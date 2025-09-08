package com.drmp.service.notification;

import com.drmp.dto.notification.NotificationMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * 短信通知服务
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class SmsNotificationService {
    
    @Value("${notification.sms.enabled:false}")
    private boolean smsEnabled;
    
    @Value("${notification.sms.api.url:}")
    private String smsApiUrl;
    
    @Value("${notification.sms.api.key:}")
    private String smsApiKey;
    
    /**
     * 发送短信通知
     *
     * @param message 通知消息
     * @return 发送结果
     */
    public boolean sendSms(NotificationMessage message) {
        if (!smsEnabled) {
            log.debug("短信通知已禁用");
            return false;
        }
        
        try {
            // 获取用户手机号
            String phoneNumber = getUserPhoneNumber(message.getRecipientId());
            if (phoneNumber == null || phoneNumber.trim().isEmpty()) {
                log.warn("用户手机号为空: userId={}", message.getRecipientId());
                return false;
            }
            
            // 发送短信
            boolean sent = sendSmsMessage(phoneNumber, message.getContent());
            
            if (sent) {
                log.info("短信发送成功: messageId={}, phone={}", message.getId(), maskPhoneNumber(phoneNumber));
            } else {
                log.warn("短信发送失败: messageId={}", message.getId());
            }
            
            return sent;
            
        } catch (Exception e) {
            log.error("短信发送异常: messageId={}", message.getId(), e);
            return false;
        }
    }
    
    /**
     * 实际发送短信
     */
    private boolean sendSmsMessage(String phoneNumber, String content) {
        try {
            // TODO: 这里应该集成实际的短信服务提供商API
            // 例如阿里云短信、腾讯云短信等
            
            log.info("模拟发送短信: phone={}, content={}", maskPhoneNumber(phoneNumber), content);
            
            // 模拟发送成功
            return true;
            
        } catch (Exception e) {
            log.error("发送短信异常: phone={}", maskPhoneNumber(phoneNumber), e);
            return false;
        }
    }
    
    /**
     * 获取用户手机号
     */
    private String getUserPhoneNumber(Long userId) {
        // TODO: 从用户服务获取手机号
        return "138****" + String.valueOf(userId).substring(Math.max(0, String.valueOf(userId).length() - 4));
    }
    
    /**
     * 手机号脱敏
     */
    private String maskPhoneNumber(String phoneNumber) {
        if (phoneNumber == null || phoneNumber.length() < 7) {
            return phoneNumber;
        }
        
        return phoneNumber.substring(0, 3) + "****" + phoneNumber.substring(phoneNumber.length() - 4);
    }
}