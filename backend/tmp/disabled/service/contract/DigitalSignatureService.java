package com.drmp.service.contract;

import com.drmp.dto.contract.*;
import com.drmp.entity.Contract;
import com.drmp.entity.ContractSignature;
import com.drmp.entity.Organization;
import com.drmp.repository.ContractRepository;
import com.drmp.repository.ContractSignatureRepository;
import com.drmp.service.OrganizationService;
import com.drmp.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * 数字签名服务
 * 处理电子合同的数字签名和验证
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class DigitalSignatureService {
    
    @Autowired
    private ContractRepository contractRepository;
    
    @Autowired
    private ContractSignatureRepository signatureRepository;
    
    @Autowired
    private ContractTemplateService templateService;
    
    @Autowired
    private OrganizationService organizationService;
    
    @Autowired
    private UserService userService;
    
    @Value("${app.contract.signature.algorithm:SHA256withRSA}")
    private String signatureAlgorithm;
    
    @Value("${app.contract.signature.timeout:7}")
    private int signatureTimeoutDays;
    
    /**
     * 创建待签署合同
     *
     * @param request 合同创建请求
     * @return 合同创建结果
     */
    @Transactional
    public ContractCreationResult createContract(ContractCreationRequest request) {
        log.info("创建待签署合同: templateId={}, title={}", request.getTemplateId(), request.getTitle());
        
        try {
            // 验证模板
            ContractTemplate template = templateService.getTemplate(request.getTemplateId());
            if (template == null) {
                return ContractCreationResult.failure("合同模板不存在");
            }
            
            // 验证签署方
            if (!validateSignatories(request.getSignatories())) {
                return ContractCreationResult.failure("签署方信息验证失败");
            }
            
            // 生成合同内容
            String contractContent = templateService.generateContractContent(template, request.getVariables());
            
            // 创建合同记录
            Contract contract = new Contract();
            contract.setContractNo(generateContractNo());
            contract.setTitle(request.getTitle());
            contract.setTemplateId(request.getTemplateId());
            contract.setContent(contractContent);
            contract.setStatus("PENDING"); // 待签署
            contract.setCreatedBy(request.getCreatedBy());
            contract.setCreatedAt(LocalDateTime.now());
            contract.setExpiresAt(LocalDateTime.now().plusDays(signatureTimeoutDays));
            contract.setVariables(request.getVariables());
            
            contractRepository.save(contract);
            
            // 创建签署记录
            for (SignatoryInfo signatory : request.getSignatories()) {
                ContractSignature signature = new ContractSignature();
                signature.setContractId(contract.getId());
                signature.setSignatoryType(signatory.getType()); // ORGANIZATION, USER
                signature.setSignatoryId(signatory.getId());
                signature.setSignatoryName(signatory.getName());
                signature.setSignatoryRole(signatory.getRole());
                signature.setSignOrder(signatory.getSignOrder());
                signature.setStatus("PENDING");
                signature.setRequiredAt(LocalDateTime.now());
                signature.setExpiresAt(contract.getExpiresAt());
                
                signatureRepository.save(signature);
            }
            
            // 异步发送签署通知
            sendSignatureNotifications(contract.getId());
            
            log.info("合同创建成功: contractId={}, contractNo={}", contract.getId(), contract.getContractNo());
            
            return ContractCreationResult.success(contract.getId(), contract.getContractNo());
            
        } catch (Exception e) {
            log.error("创建合同异常: title={}", request.getTitle(), e);
            return ContractCreationResult.failure("创建合同异常: " + e.getMessage());
        }
    }
    
    /**
     * 执行数字签名
     *
     * @param request 签名请求
     * @return 签名结果
     */
    @Transactional
    public SignatureResult executeSignature(SignatureRequest request) {
        log.info("执行数字签名: contractId={}, signatoryId={}", request.getContractId(), request.getSignatoryId());
        
        try {
            // 获取合同信息
            Contract contract = contractRepository.findById(request.getContractId()).orElse(null);
            if (contract == null) {
                return SignatureResult.failure("合同不存在");
            }
            
            if (!"PENDING".equals(contract.getStatus())) {
                return SignatureResult.failure("合同状态不允许签署");
            }
            
            if (contract.getExpiresAt().isBefore(LocalDateTime.now())) {
                return SignatureResult.failure("合同已过期");
            }
            
            // 获取签署记录
            ContractSignature signature = signatureRepository
                    .findByContractIdAndSignatoryId(request.getContractId(), request.getSignatoryId());
            
            if (signature == null) {
                return SignatureResult.failure("签署记录不存在");
            }
            
            if (!"PENDING".equals(signature.getStatus())) {
                return SignatureResult.failure("该签署方已签署或已拒绝");
            }
            
            // 验证签署权限
            if (!validateSignaturePermission(request)) {
                return SignatureResult.failure("签署权限验证失败");
            }
            
            // 验证签署顺序
            if (!validateSignatureOrder(contract.getId(), signature)) {
                return SignatureResult.failure("签署顺序错误，请等待前序签署完成");
            }
            
            // 生成数字签名
            String digitalSignature = generateDigitalSignature(contract.getContent(), request);
            
            // 更新签署记录
            signature.setStatus("SIGNED");
            signature.setSignedAt(LocalDateTime.now());
            signature.setSignatureValue(digitalSignature);
            signature.setSignatureAlgorithm(signatureAlgorithm);
            signature.setSignerIp(request.getSignerIp());
            signature.setSignerUserAgent(request.getSignerUserAgent());
            signature.setSignatureComment(request.getSignatureComment());
            
            signatureRepository.save(signature);
            
            // 检查是否所有签署方都已签署
            boolean allSigned = checkAllSignatureCompleted(contract.getId());
            if (allSigned) {
                contract.setStatus("SIGNED");
                contract.setCompletedAt(LocalDateTime.now());
                contractRepository.save(contract);
                
                // 发送合同完成通知
                sendContractCompletedNotifications(contract.getId());
                
                log.info("合同签署完成: contractId={}", contract.getId());
            } else {
                // 通知下一个签署方
                notifyNextSignatory(contract.getId(), signature.getSignOrder());
            }
            
            return SignatureResult.success(signature.getId(), digitalSignature);
            
        } catch (Exception e) {
            log.error("执行数字签名异常: contractId={}", request.getContractId(), e);
            return SignatureResult.failure("签名异常: " + e.getMessage());
        }
    }
    
    /**
     * 拒绝签署合同
     *
     * @param contractId 合同ID
     * @param signatoryId 签署方ID
     * @param reason 拒绝原因
     * @param userId 操作用户ID
     * @return 操作结果
     */
    @Transactional
    public SignatureResult rejectContract(Long contractId, Long signatoryId, String reason, Long userId) {
        log.info("拒绝签署合同: contractId={}, signatoryId={}, reason={}", contractId, signatoryId, reason);
        
        try {
            // 获取签署记录
            ContractSignature signature = signatureRepository
                    .findByContractIdAndSignatoryId(contractId, signatoryId);
            
            if (signature == null) {
                return SignatureResult.failure("签署记录不存在");
            }
            
            if (!"PENDING".equals(signature.getStatus())) {
                return SignatureResult.failure("该签署方已处理过");
            }
            
            // 更新签署记录
            signature.setStatus("REJECTED");
            signature.setRejectedAt(LocalDateTime.now());
            signature.setRejectionReason(reason);
            signature.setRejectedBy(userId);
            
            signatureRepository.save(signature);
            
            // 更新合同状态
            Contract contract = contractRepository.findById(contractId).orElse(null);
            if (contract != null) {
                contract.setStatus("REJECTED");
                contract.setCompletedAt(LocalDateTime.now());
                contractRepository.save(contract);
            }
            
            // 发送拒签通知
            sendContractRejectedNotifications(contractId, reason);
            
            log.info("合同拒签完成: contractId={}", contractId);
            
            return SignatureResult.success(signature.getId(), "合同已拒签");
            
        } catch (Exception e) {
            log.error("拒绝签署合同异常: contractId={}", contractId, e);
            return SignatureResult.failure("拒签异常: " + e.getMessage());
        }
    }
    
    /**
     * 验证合同签名
     *
     * @param contractId 合同ID
     * @return 验证结果
     */
    public SignatureVerificationResult verifyContractSignatures(Long contractId) {
        log.info("验证合同签名: contractId={}", contractId);
        
        try {
            Contract contract = contractRepository.findById(contractId).orElse(null);
            if (contract == null) {
                return SignatureVerificationResult.failure("合同不存在");
            }
            
            List<ContractSignature> signatures = signatureRepository.findByContractIdOrderBySignOrder(contractId);
            if (signatures.isEmpty()) {
                return SignatureVerificationResult.failure("无签署记录");
            }
            
            SignatureVerificationResult result = new SignatureVerificationResult();
            result.setContractId(contractId);
            result.setTotalSignatures(signatures.size());
            
            int validCount = 0;
            for (ContractSignature signature : signatures) {
                SignatureValidationInfo validationInfo = validateSingleSignature(contract, signature);
                result.addSignatureValidation(validationInfo);
                
                if (validationInfo.isValid()) {
                    validCount++;
                }
            }
            
            result.setValidSignatures(validCount);
            result.setAllValid(validCount == signatures.size());
            result.setSuccess(true);
            
            return result;
            
        } catch (Exception e) {
            log.error("验证合同签名异常: contractId={}", contractId, e);
            return SignatureVerificationResult.failure("验证异常: " + e.getMessage());
        }
    }
    
    /**
     * 获取合同签署状态
     *
     * @param contractId 合同ID
     * @return 签署状态
     */
    public ContractSignatureStatus getSignatureStatus(Long contractId) {
        try {
            Contract contract = contractRepository.findById(contractId).orElse(null);
            if (contract == null) {
                return null;
            }
            
            List<ContractSignature> signatures = signatureRepository.findByContractIdOrderBySignOrder(contractId);
            
            ContractSignatureStatus status = new ContractSignatureStatus();
            status.setContractId(contractId);
            status.setContractNo(contract.getContractNo());
            status.setContractStatus(contract.getStatus());
            status.setTotalSignatories(signatures.size());
            status.setSignedCount((int) signatures.stream().filter(s -> "SIGNED".equals(s.getStatus())).count());
            status.setRejectedCount((int) signatures.stream().filter(s -> "REJECTED".equals(s.getStatus())).count());
            status.setPendingCount((int) signatures.stream().filter(s -> "PENDING".equals(s.getStatus())).count());
            status.setCreatedAt(contract.getCreatedAt());
            status.setExpiresAt(contract.getExpiresAt());
            status.setCompletedAt(contract.getCompletedAt());
            
            // 设置签署详情
            for (ContractSignature signature : signatures) {
                SignatoryStatus signatoryStatus = new SignatoryStatus();
                signatoryStatus.setSignatoryId(signature.getSignatoryId());
                signatoryStatus.setSignatoryName(signature.getSignatoryName());
                signatoryStatus.setSignatoryRole(signature.getSignatoryRole());
                signatoryStatus.setSignOrder(signature.getSignOrder());
                signatoryStatus.setStatus(signature.getStatus());
                signatoryStatus.setRequiredAt(signature.getRequiredAt());
                signatoryStatus.setSignedAt(signature.getSignedAt());
                signatoryStatus.setRejectedAt(signature.getRejectedAt());
                signatoryStatus.setRejectionReason(signature.getRejectionReason());
                
                status.addSignatoryStatus(signatoryStatus);
            }
            
            return status;
            
        } catch (Exception e) {
            log.error("获取合同签署状态异常: contractId={}", contractId, e);
            return null;
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 验证签署方信息
     */
    private boolean validateSignatories(List<SignatoryInfo> signatories) {
        if (signatories == null || signatories.isEmpty()) {
            return false;
        }
        
        // 验证签署顺序不重复
        long distinctOrders = signatories.stream().mapToInt(SignatoryInfo::getSignOrder).distinct().count();
        if (distinctOrders != signatories.size()) {
            log.warn("签署顺序存在重复");
            return false;
        }
        
        // 验证签署方是否存在
        for (SignatoryInfo signatory : signatories) {
            if ("ORGANIZATION".equals(signatory.getType())) {
                Organization org = organizationService.findById(signatory.getId());
                if (org == null) {
                    log.warn("签署机构不存在: orgId={}", signatory.getId());
                    return false;
                }
            }
            // 可以添加用户验证逻辑
        }
        
        return true;
    }
    
    /**
     * 验证签署权限
     */
    private boolean validateSignaturePermission(SignatureRequest request) {
        // 实现签署权限验证逻辑
        // 例如验证用户是否有权代表机构签署
        return true;
    }
    
    /**
     * 验证签署顺序
     */
    private boolean validateSignatureOrder(Long contractId, ContractSignature currentSignature) {
        if (currentSignature.getSignOrder() == 1) {
            return true; // 第一个签署方
        }
        
        // 检查前序签署方是否已完成签署
        List<ContractSignature> previousSignatures = signatureRepository
                .findByContractIdAndSignOrderLessThan(contractId, currentSignature.getSignOrder());
        
        return previousSignatures.stream().allMatch(s -> "SIGNED".equals(s.getStatus()));
    }
    
    /**
     * 生成数字签名
     */
    private String generateDigitalSignature(String content, SignatureRequest request) {
        try {
            // 这里应该使用真正的数字签名算法
            // 简化实现，实际应使用RSA或ECC算法
            String dataToSign = content + request.getSignatoryId() + System.currentTimeMillis();
            return java.util.Base64.getEncoder().encodeToString(
                    java.security.MessageDigest.getInstance("SHA-256")
                            .digest(dataToSign.getBytes()));
        } catch (Exception e) {
            throw new RuntimeException("生成数字签名失败", e);
        }
    }
    
    /**
     * 检查所有签署是否完成
     */
    private boolean checkAllSignatureCompleted(Long contractId) {
        List<ContractSignature> signatures = signatureRepository.findByContractId(contractId);
        return signatures.stream().allMatch(s -> "SIGNED".equals(s.getStatus()));
    }
    
    /**
     * 验证单个签名
     */
    private SignatureValidationInfo validateSingleSignature(Contract contract, ContractSignature signature) {
        SignatureValidationInfo info = new SignatureValidationInfo();
        info.setSignatureId(signature.getId());
        info.setSignatoryName(signature.getSignatoryName());
        info.setSignedAt(signature.getSignedAt());
        info.setSignatureAlgorithm(signature.getSignatureAlgorithm());
        
        try {
            // 这里应该验证数字签名的有效性
            // 简化实现，实际应验证签名是否匹配
            boolean isValid = signature.getSignatureValue() != null && 
                             !signature.getSignatureValue().isEmpty();
            
            info.setValid(isValid);
            info.setValidationMessage(isValid ? "签名有效" : "签名无效");
            
        } catch (Exception e) {
            info.setValid(false);
            info.setValidationMessage("签名验证异常: " + e.getMessage());
        }
        
        return info;
    }
    
    /**
     * 生成合同编号
     */
    private String generateContractNo() {
        return "CT" + System.currentTimeMillis() + String.format("%04d", 
                (int) (Math.random() * 10000));
    }
    
    // 异步通知方法
    @Async("notificationExecutor")
    private void sendSignatureNotifications(Long contractId) {
        log.info("发送签署通知: contractId={}", contractId);
        // 实现通知逻辑
    }
    
    @Async("notificationExecutor")
    private void sendContractCompletedNotifications(Long contractId) {
        log.info("发送合同完成通知: contractId={}", contractId);
        // 实现通知逻辑
    }
    
    @Async("notificationExecutor")
    private void sendContractRejectedNotifications(Long contractId, String reason) {
        log.info("发送合同拒签通知: contractId={}, reason={}", contractId, reason);
        // 实现通知逻辑
    }
    
    private void notifyNextSignatory(Long contractId, int currentOrder) {
        log.info("通知下一个签署方: contractId={}, currentOrder={}", contractId, currentOrder);
        // 实现通知逻辑
    }
}