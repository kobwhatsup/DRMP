package com.drmp.service.notification;

import com.drmp.dto.notification.NotificationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 邮件通知服务
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class EmailNotificationService {
    
    private final JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${notification.email.enabled:true}")
    private boolean emailEnabled;
    
    public EmailNotificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    
    /**
     * 发送邮件通知
     *
     * @param message 通知消息
     * @return 发送结果
     */
    public boolean sendEmail(NotificationMessage message) {
        if (!emailEnabled) {
            log.debug("邮件通知已禁用");
            return false;
        }
        
        try {
            // 这里需要根据recipientId获取用户邮箱
            String recipientEmail = getUserEmail(message.getRecipientId());
            if (recipientEmail == null) {
                log.warn("用户邮箱为空: userId={}", message.getRecipientId());
                return false;
            }
            
            SimpleMailMessage mailMessage = new SimpleMailMessage();
            mailMessage.setFrom(fromEmail);
            mailMessage.setTo(recipientEmail);
            mailMessage.setSubject(message.getTitle());
            mailMessage.setText(message.getContent());
            
            mailSender.send(mailMessage);
            
            log.info("邮件发送成功: messageId={}, recipient={}", message.getId(), recipientEmail);
            return true;
            
        } catch (Exception e) {
            log.error("邮件发送失败: messageId={}", message.getId(), e);
            return false;
        }
    }
    
    /**
     * 获取用户邮箱
     * 这里应该从用户服务中获取邮箱信息
     */
    private String getUserEmail(Long userId) {
        // TODO: 实现从用户服务获取邮箱的逻辑
        return "user" + userId + "@example.com";
    }
}