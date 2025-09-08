package com.drmp.service.contract;

import com.drmp.dto.contract.ContractTemplate;
import com.drmp.entity.Contract;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 合同模板服务
 * 管理合同模板和生成合同内容
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class ContractTemplateService {
    
    // 预置的合同模板
    private final Map<Long, ContractTemplate> templates = new HashMap<>();
    
    public ContractTemplateService() {
        initializeDefaultTemplates();
    }
    
    /**
     * 获取合同模板
     *
     * @param templateId 模板ID
     * @return 合同模板
     */
    public ContractTemplate getTemplate(Long templateId) {
        return templates.get(templateId);
    }
    
    /**
     * 获取所有可用模板
     *
     * @return 模板列表
     */
    public List<ContractTemplate> getAllTemplates() {
        return new ArrayList<>(templates.values());
    }
    
    /**
     * 根据业务类型获取模板
     *
     * @param businessType 业务类型
     * @return 模板列表
     */
    public List<ContractTemplate> getTemplatesByType(String businessType) {
        return templates.values().stream()
                .filter(template -> businessType.equals(template.getBusinessType()))
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * 生成合同内容
     *
     * @param template 合同模板
     * @param variables 变量值映射
     * @return 生成的合同内容
     */
    public String generateContractContent(ContractTemplate template, Map<String, Object> variables) {
        if (template == null || template.getContent() == null) {
            throw new IllegalArgumentException("合同模板或内容不能为空");
        }
        
        try {
            String content = template.getContent();
            
            // 替换变量
            content = replaceVariables(content, variables);
            
            // 添加时间戳
            content = addTimestamp(content);
            
            // 格式化内容
            content = formatContent(content);
            
            log.info("合同内容生成成功: templateId={}, contentLength={}", 
                    template.getId(), content.length());
            
            return content;
            
        } catch (Exception e) {
            log.error("生成合同内容异常: templateId={}", template.getId(), e);
            throw new RuntimeException("生成合同内容失败", e);
        }
    }
    
    /**
     * 验证合同模板
     *
     * @param template 合同模板
     * @return 验证结果
     */
    public boolean validateTemplate(ContractTemplate template) {
        if (template == null) {
            return false;
        }
        
        if (template.getName() == null || template.getName().trim().isEmpty()) {
            log.warn("模板名称不能为空");
            return false;
        }
        
        if (template.getContent() == null || template.getContent().trim().isEmpty()) {
            log.warn("模板内容不能为空");
            return false;
        }
        
        // 验证模板变量语法
        if (!validateTemplateSyntax(template.getContent())) {
            log.warn("模板语法验证失败: templateId={}", template.getId());
            return false;
        }
        
        return true;
    }
    
    /**
     * 保存合同模板
     *
     * @param template 合同模板
     * @return 保存结果
     */
    public boolean saveTemplate(ContractTemplate template) {
        try {
            if (!validateTemplate(template)) {
                return false;
            }
            
            if (template.getId() == null) {
                template.setId(generateTemplateId());
            }
            
            template.setUpdatedAt(LocalDateTime.now());
            templates.put(template.getId(), template);
            
            log.info("合同模板保存成功: templateId={}, name={}", template.getId(), template.getName());
            return true;
            
        } catch (Exception e) {
            log.error("保存合同模板异常", e);
            return false;
        }
    }
    
    /**
     * 删除合同模板
     *
     * @param templateId 模板ID
     * @return 删除结果
     */
    public boolean deleteTemplate(Long templateId) {
        try {
            ContractTemplate removed = templates.remove(templateId);
            if (removed != null) {
                log.info("合同模板删除成功: templateId={}", templateId);
                return true;
            } else {
                log.warn("模板不存在: templateId={}", templateId);
                return false;
            }
        } catch (Exception e) {
            log.error("删除合同模板异常: templateId={}", templateId, e);
            return false;
        }
    }
    
    /**
     * 提取模板变量
     *
     * @param templateContent 模板内容
     * @return 变量列表
     */
    public List<String> extractTemplateVariables(String templateContent) {
        List<String> variables = new ArrayList<>();
        
        if (templateContent == null) {
            return variables;
        }
        
        Pattern pattern = Pattern.compile("\\{\\{\\s*(\\w+)\\s*\\}\\}");
        Matcher matcher = pattern.matcher(templateContent);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            if (!variables.contains(variable)) {
                variables.add(variable);
            }
        }
        
        return variables;
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 初始化默认模板
     */
    private void initializeDefaultTemplates() {
        // 1. 案件委托处置协议模板
        ContractTemplate disposalAgreement = new ContractTemplate();
        disposalAgreement.setId(1L);
        disposalAgreement.setName("案件委托处置协议");
        disposalAgreement.setBusinessType("CASE_DISPOSAL");
        disposalAgreement.setDescription("案源机构委托处置机构处理不良资产案件的协议");
        disposalAgreement.setContent(getDisposalAgreementTemplate());
        disposalAgreement.setStatus("ACTIVE");
        disposalAgreement.setCreatedAt(LocalDateTime.now());
        disposalAgreement.setUpdatedAt(LocalDateTime.now());
        templates.put(1L, disposalAgreement);
        
        // 2. 保密协议模板
        ContractTemplate confidentialityAgreement = new ContractTemplate();
        confidentialityAgreement.setId(2L);
        confidentialityAgreement.setName("保密协议");
        confidentialityAgreement.setBusinessType("CONFIDENTIALITY");
        confidentialityAgreement.setDescription("机构间信息保密协议");
        confidentialityAgreement.setContent(getConfidentialityAgreementTemplate());
        confidentialityAgreement.setStatus("ACTIVE");
        confidentialityAgreement.setCreatedAt(LocalDateTime.now());
        confidentialityAgreement.setUpdatedAt(LocalDateTime.now());
        templates.put(2L, confidentialityAgreement);
        
        // 3. 服务协议模板
        ContractTemplate serviceAgreement = new ContractTemplate();
        serviceAgreement.setId(3L);
        serviceAgreement.setName("平台服务协议");
        serviceAgreement.setBusinessType("SERVICE");
        serviceAgreement.setDescription("平台服务使用协议");
        serviceAgreement.setContent(getServiceAgreementTemplate());
        serviceAgreement.setStatus("ACTIVE");
        serviceAgreement.setCreatedAt(LocalDateTime.now());
        serviceAgreement.setUpdatedAt(LocalDateTime.now());
        templates.put(3L, serviceAgreement);
        
        log.info("默认合同模板初始化完成: count={}", templates.size());
    }
    
    /**
     * 替换模板变量
     */
    private String replaceVariables(String content, Map<String, Object> variables) {
        if (variables == null || variables.isEmpty()) {
            return content;
        }
        
        String result = content;
        
        for (Map.Entry<String, Object> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue().toString() : "";
            result = result.replace(placeholder, value);
        }
        
        return result;
    }
    
    /**
     * 添加时间戳
     */
    private String addTimestamp(String content) {
        String timestamp = "\\n\\n本协议生成时间：" + LocalDateTime.now().format(
                java.time.format.DateTimeFormatter.ofPattern("yyyy年MM月dd日 HH:mm:ss"));
        return content + timestamp;
    }
    
    /**
     * 格式化内容
     */
    private String formatContent(String content) {
        return content.trim();
    }
    
    /**
     * 验证模板语法
     */
    private boolean validateTemplateSyntax(String content) {
        try {
            // 检查模板变量语法是否正确
            Pattern pattern = Pattern.compile("\\{\\{\\s*(\\w+)\\s*\\}\\}");
            Matcher matcher = pattern.matcher(content);
            
            // 检查是否有不匹配的花括号
            int openCount = content.length() - content.replace("{{", "").length();
            int closeCount = content.length() - content.replace("}}", "").length();
            
            return openCount == closeCount;
            
        } catch (Exception e) {
            log.error("模板语法验证异常", e);
            return false;
        }
    }
    
    /**
     * 生成模板ID
     */
    private Long generateTemplateId() {
        return System.currentTimeMillis();
    }
    
    // ==================== 模板内容 ====================
    
    /**
     * 案件委托处置协议模板
     */
    private String getDisposalAgreementTemplate() {
        return "# 案件委托处置协议\\n\\n" +
                "**委托方（甲方）**：{{sourceOrgName}}\\n" +
                "**受托方（乙方）**：{{disposalOrgName}}\\n\\n" +
                "## 第一条 委托事项\\n" +
                "甲方委托乙方处置以下不良资产案件：\\n" +
                "- 案件包编号：{{packageNo}}\\n" +
                "- 案件数量：{{caseCount}}件\\n" +
                "- 委托金额：{{totalAmount}}元\\n" +
                "- 委托期限：{{commissionPeriod}}\\n\\n" +
                "## 第二条 处置要求\\n" +
                "1. 期望回款率：{{expectedRecoveryRate}}\\n" +
                "2. 处置方式：{{disposalMethods}}\\n" +
                "3. 处置周期：{{disposalPeriod}}\\n\\n" +
                "## 第三条 费用结算\\n" +
                "1. 结算方式：{{settlementType}}\\n" +
                "2. 费用标准：{{feeStandard}}\\n" +
                "3. 支付方式：{{paymentMethod}}\\n\\n" +
                "## 第四条 保密义务\\n" +
                "双方应对案件信息严格保密，不得泄露给第三方。\\n\\n" +
                "## 第五条 协议生效\\n" +
                "本协议自双方签署之日起生效。\\n\\n" +
                "**甲方（委托方）**：{{sourceOrgName}}\\n" +
                "**乙方（受托方）**：{{disposalOrgName}}\\n\\n" +
                "签署日期：{{signDate}}";
    }
    
    /**
     * 保密协议模板
     */
    private String getConfidentialityAgreementTemplate() {
        return "# 保密协议\\n\\n" +
                "**甲方**：{{partyA}}\\n" +
                "**乙方**：{{partyB}}\\n\\n" +
                "## 第一条 保密信息定义\\n" +
                "本协议所称保密信息包括但不限于：\\n" +
                "1. 客户信息、债务人信息\\n" +
                "2. 案件处置数据和统计信息\\n" +
                "3. 业务流程和操作方法\\n" +
                "4. 其他标记为保密的信息\\n\\n" +
                "## 第二条 保密义务\\n" +
                "1. 严格保密，不得向第三方泄露\\n" +
                "2. 仅用于约定的业务目的\\n" +
                "3. 采取适当的保护措施\\n\\n" +
                "## 第三条 违约责任\\n" +
                "违反保密义务的，应承担相应法律责任。\\n\\n" +
                "本协议有效期：{{validPeriod}}\\n\\n" +
                "**甲方**：{{partyA}}\\n" +
                "**乙方**：{{partyB}}\\n\\n" +
                "签署日期：{{signDate}}";
    }
    
    /**
     * 服务协议模板
     */
    private String getServiceAgreementTemplate() {
        return "# 平台服务协议\\n\\n" +
                "**服务提供方**：DRMP平台\\n" +
                "**服务使用方**：{{orgName}}\\n\\n" +
                "## 第一条 服务内容\\n" +
                "1. 案件管理服务\\n" +
                "2. 智能分案服务\\n" +
                "3. 数据统计分析服务\\n" +
                "4. 其他增值服务\\n\\n" +
                "## 第二条 服务标准\\n" +
                "1. 系统可用性：99.9%\\n" +
                "2. 数据安全保障\\n" +
                "3. 7×24小时技术支持\\n\\n" +
                "## 第三条 费用标准\\n" +
                "- 基础服务费：{{basicFee}}元/月\\n" +
                "- 增值服务费：按实际使用计算\\n\\n" +
                "## 第四条 协议期限\\n" +
                "协议有效期：{{contractPeriod}}\\n\\n" +
                "**服务提供方**：DRMP平台\\n" +
                "**服务使用方**：{{orgName}}\\n\\n" +
                "签署日期：{{signDate}}";
    }
}