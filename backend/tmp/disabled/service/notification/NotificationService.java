package com.drmp.service.notification;

import com.drmp.dto.notification.NotificationMessage;
import com.drmp.dto.notification.NotificationTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 通知服务
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class NotificationService {
    
    @Autowired
    private WebSocketNotificationService webSocketService;
    
    @Autowired
    private EmailNotificationService emailService;
    
    @Autowired
    private SmsNotificationService smsService;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    // 通知模板缓存
    private final Map<String, NotificationTemplate> templates = new HashMap<>();
    
    // 消息队列缓存
    private final String MESSAGE_QUEUE_KEY = "notification:queue";
    private final String MESSAGE_HISTORY_KEY = "notification:history:";
    
    public NotificationService() {
        initializeDefaultTemplates();
    }
    
    /**
     * 发送通知消息
     *
     * @param message 通知消息
     * @return 发送结果
     */
    @Async
    public CompletableFuture<Boolean> sendNotification(NotificationMessage message) {
        try {
            log.info("发送通知消息: type={}, recipientId={}, channel={}", 
                    message.getType(), message.getRecipientId(), message.getChannel());
            
            // 设置默认值
            if (message.getId() == null) {
                message.setId(generateMessageId());
            }
            if (message.getCreatedAt() == null) {
                message.setCreatedAt(LocalDateTime.now());
            }
            
            // 验证消息
            if (!validateMessage(message)) {
                message.setStatus("FAILED");
                return CompletableFuture.completedFuture(false);
            }
            
            // 添加到消息队列
            addToQueue(message);
            
            // 根据渠道发送
            boolean sent = false;
            switch (message.getChannel().toUpperCase()) {
                case "WEBSOCKET":
                    sent = webSocketService.sendMessage(message);
                    break;
                case "EMAIL":
                    sent = emailService.sendEmail(message);
                    break;
                case "SMS":
                    sent = smsService.sendSms(message);
                    break;
                default:
                    log.warn("不支持的通知渠道: {}", message.getChannel());
            }
            
            // 更新消息状态
            if (sent) {
                message.setStatus("SENT");
                message.setSentAt(LocalDateTime.now());
            } else {
                message.setStatus("FAILED");
                // 可重试的消息加入重试队列
                if (message.isRetryable() && message.getRetryCount() < 3) {
                    scheduleRetry(message);
                }
            }
            
            // 保存到历史记录
            saveToHistory(message);
            
            log.info("通知消息发送完成: id={}, status={}", message.getId(), message.getStatus());
            return CompletableFuture.completedFuture(sent);
            
        } catch (Exception e) {
            log.error("发送通知消息异常: messageId={}", message.getId(), e);
            message.setStatus("FAILED");
            saveToHistory(message);
            return CompletableFuture.completedFuture(false);
        }
    }
    
    /**
     * 批量发送通知
     *
     * @param messages 消息列表
     * @return 发送结果
     */
    @Async
    public CompletableFuture<Map<Long, Boolean>> batchSendNotifications(List<NotificationMessage> messages) {
        Map<Long, Boolean> results = new HashMap<>();
        
        List<CompletableFuture<Boolean>> futures = new ArrayList<>();
        
        for (NotificationMessage message : messages) {
            CompletableFuture<Boolean> future = sendNotification(message);
            futures.add(future);
            
            future.whenComplete((result, throwable) -> {
                results.put(message.getId(), result != null ? result : false);
            });
        }
        
        // 等待所有消息发送完成
        CompletableFuture<Void> allOf = CompletableFuture.allOf(
                futures.toArray(new CompletableFuture[0]));
        
        return allOf.thenApply(v -> results);
    }
    
    /**
     * 使用模板创建通知消息
     *
     * @param templateCode 模板代码
     * @param recipientId 接收人ID
     * @param variables 模板变量
     * @param channel 通知渠道
     * @return 通知消息
     */
    public NotificationMessage createFromTemplate(String templateCode, Long recipientId, 
                                                 Map<String, Object> variables, String channel) {
        try {
            NotificationTemplate template = getTemplate(templateCode);
            if (template == null) {
                log.warn("通知模板不存在: templateCode={}", templateCode);
                return null;
            }
            
            NotificationMessage message = new NotificationMessage();
            message.setId(generateMessageId());
            message.setType(template.getType());
            message.setRecipientId(recipientId);
            message.setChannel(channel);
            message.setCreatedAt(LocalDateTime.now());
            
            // 替换模板变量
            String title = replaceTemplateVariables(template.getTitleTemplate(), variables);
            String content = replaceTemplateVariables(template.getContentTemplate(), variables);
            
            message.setTitle(title);
            message.setContent(content);
            message.setExtraData(variables);
            
            log.info("使用模板创建通知消息: templateCode={}, recipientId={}", templateCode, recipientId);
            return message;
            
        } catch (Exception e) {
            log.error("使用模板创建通知消息异常: templateCode={}", templateCode, e);
            return null;
        }
    }
    
    /**
     * 获取用户未读消息
     *
     * @param userId 用户ID
     * @return 未读消息列表
     */
    public List<NotificationMessage> getUnreadMessages(Long userId) {
        try {
            String key = MESSAGE_HISTORY_KEY + userId;
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);
            
            return messages.stream()
                    .map(msg -> (NotificationMessage) msg)
                    .filter(msg -> "SENT".equals(msg.getStatus()) && msg.getReadAt() == null)
                    .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                    .collect(java.util.stream.Collectors.toList());
                    
        } catch (Exception e) {
            log.error("获取用户未读消息异常: userId={}", userId, e);
            return new ArrayList<>();
        }
    }
    
    /**
     * 标记消息为已读
     *
     * @param messageId 消息ID
     * @param userId 用户ID
     * @return 操作结果
     */
    public boolean markAsRead(Long messageId, Long userId) {
        try {
            String key = MESSAGE_HISTORY_KEY + userId;
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);
            
            for (int i = 0; i < messages.size(); i++) {
                NotificationMessage msg = (NotificationMessage) messages.get(i);
                if (messageId.equals(msg.getId())) {
                    msg.setReadAt(LocalDateTime.now());
                    msg.setStatus("READ");
                    redisTemplate.opsForList().set(key, i, msg);
                    
                    log.info("消息标记为已读: messageId={}, userId={}", messageId, userId);
                    return true;
                }
            }
            
            log.warn("未找到消息: messageId={}, userId={}", messageId, userId);
            return false;
            
        } catch (Exception e) {
            log.error("标记消息已读异常: messageId={}, userId={}", messageId, userId, e);
            return false;
        }
    }
    
    /**
     * 获取消息统计
     *
     * @param userId 用户ID
     * @return 消息统计
     */
    public Map<String, Long> getMessageStatistics(Long userId) {
        try {
            String key = MESSAGE_HISTORY_KEY + userId;
            List<Object> messages = redisTemplate.opsForList().range(key, 0, -1);
            
            Map<String, Long> stats = new HashMap<>();
            long total = messages.size();
            long unread = messages.stream()
                    .map(msg -> (NotificationMessage) msg)
                    .mapToLong(msg -> msg.getReadAt() == null ? 1 : 0)
                    .sum();
            
            stats.put("total", total);
            stats.put("unread", unread);
            stats.put("read", total - unread);
            
            return stats;
            
        } catch (Exception e) {
            log.error("获取消息统计异常: userId={}", userId, e);
            return new HashMap<>();
        }
    }
    
    // ==================== 私有方法 ====================
    
    /**
     * 初始化默认模板
     */
    private void initializeDefaultTemplates() {
        // 案件分配通知
        NotificationTemplate caseAssignment = new NotificationTemplate();
        caseAssignment.setCode("CASE_ASSIGNMENT");
        caseAssignment.setName("案件分配通知");
        caseAssignment.setType("CASE_ASSIGNMENT");
        caseAssignment.setTitleTemplate("您有新的案件包待处理");
        caseAssignment.setContentTemplate("案件包「${packageName}」已分配给您的机构，包含 ${caseCount} 个案件，委托金额 ${totalAmount} 元。请及时处理。");
        caseAssignment.setSupportedChannels(new String[]{"WEBSOCKET", "EMAIL"});
        templates.put("CASE_ASSIGNMENT", caseAssignment);
        
        // 合同签署通知
        NotificationTemplate contractSigned = new NotificationTemplate();
        contractSigned.setCode("CONTRACT_SIGNED");
        contractSigned.setName("合同签署通知");
        contractSigned.setType("CONTRACT_SIGNED");
        contractSigned.setTitleTemplate("合同签署完成");
        contractSigned.setContentTemplate("合同「${contractTitle}」已完成签署，签署方：${signerName}，签署时间：${signTime}。");
        contractSigned.setSupportedChannels(new String[]{"WEBSOCKET", "EMAIL"});
        templates.put("CONTRACT_SIGNED", contractSigned);
        
        // 回款通知
        NotificationTemplate paymentReceived = new NotificationTemplate();
        paymentReceived.setCode("PAYMENT_RECEIVED");
        paymentReceived.setName("回款到账通知");
        paymentReceived.setType("PAYMENT_RECEIVED");
        paymentReceived.setTitleTemplate("回款到账通知");
        paymentReceived.setContentTemplate("案件「${caseName}」收到回款 ${amount} 元，债务人：${debtorName}，到账时间：${receivedTime}。");
        paymentReceived.setSupportedChannels(new String[]{"WEBSOCKET", "EMAIL", "SMS"});
        templates.put("PAYMENT_RECEIVED", paymentReceived);
        
        log.info("默认通知模板初始化完成: count={}", templates.size());
    }
    
    /**
     * 验证消息
     */
    private boolean validateMessage(NotificationMessage message) {
        if (message.getRecipientId() == null) {
            log.warn("接收人ID不能为空");
            return false;
        }
        
        if (message.getChannel() == null || message.getChannel().trim().isEmpty()) {
            log.warn("通知渠道不能为空");
            return false;
        }
        
        if (message.getTitle() == null || message.getTitle().trim().isEmpty()) {
            log.warn("消息标题不能为空");
            return false;
        }
        
        return true;
    }
    
    /**
     * 添加到消息队列
     */
    private void addToQueue(NotificationMessage message) {
        try {
            redisTemplate.opsForList().rightPush(MESSAGE_QUEUE_KEY, message);
            redisTemplate.expire(MESSAGE_QUEUE_KEY, 7, TimeUnit.DAYS);
            log.debug("消息已添加到队列: messageId={}", message.getId());
        } catch (Exception e) {
            log.error("添加消息到队列异常: messageId={}", message.getId(), e);
        }
    }
    
    /**
     * 保存到历史记录
     */
    private void saveToHistory(NotificationMessage message) {
        try {
            String key = MESSAGE_HISTORY_KEY + message.getRecipientId();
            redisTemplate.opsForList().rightPush(key, message);
            // 保留最近1000条消息
            redisTemplate.opsForList().trim(key, -1000, -1);
            redisTemplate.expire(key, 30, TimeUnit.DAYS);
            
            log.debug("消息已保存到历史: messageId={}", message.getId());
        } catch (Exception e) {
            log.error("保存消息历史异常: messageId={}", message.getId(), e);
        }
    }
    
    /**
     * 安排重试
     */
    private void scheduleRetry(NotificationMessage message) {
        try {
            message.setRetryCount(message.getRetryCount() + 1);
            message.setStatus("PENDING");
            
            // 延迟重试
            String retryKey = "notification:retry:" + message.getId();
            redisTemplate.opsForValue().set(retryKey, message, 5, TimeUnit.MINUTES);
            
            log.info("消息安排重试: messageId={}, retryCount={}", message.getId(), message.getRetryCount());
        } catch (Exception e) {
            log.error("安排消息重试异常: messageId={}", message.getId(), e);
        }
    }
    
    /**
     * 替换模板变量
     */
    private String replaceTemplateVariables(String template, Map<String, Object> variables) {
        if (template == null || variables == null) {
            return template;
        }
        
        String result = template;
        Pattern pattern = Pattern.compile("\\$\\{(\\w+)\\}");
        Matcher matcher = pattern.matcher(template);
        
        while (matcher.find()) {
            String variable = matcher.group(1);
            Object value = variables.get(variable);
            if (value != null) {
                result = result.replace("${" + variable + "}", value.toString());
            }
        }
        
        return result;
    }
    
    /**
     * 获取模板
     */
    private NotificationTemplate getTemplate(String templateCode) {
        return templates.get(templateCode);
    }
    
    /**
     * 生成消息ID
     */
    private Long generateMessageId() {
        return System.currentTimeMillis();
    }
}