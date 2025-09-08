package com.drmp.service.notification;

import com.drmp.dto.notification.NotificationMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

/**
 * WebSocket通知服务
 *
 * @author DRMP Team
 */
@Slf4j
@Service
public class WebSocketNotificationService {
    
    @Autowired
    private ObjectMapper objectMapper;
    
    // 用户WebSocket会话映射
    private final ConcurrentHashMap<Long, CopyOnWriteArraySet<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    
    /**
     * 添加用户会话
     *
     * @param userId 用户ID
     * @param session WebSocket会话
     */
    public void addUserSession(Long userId, WebSocketSession session) {
        userSessions.computeIfAbsent(userId, k -> new CopyOnWriteArraySet<>()).add(session);
        log.info("用户WebSocket会话已添加: userId={}, sessionId={}", userId, session.getId());
    }
    
    /**
     * 移除用户会话
     *
     * @param userId 用户ID
     * @param session WebSocket会话
     */
    public void removeUserSession(Long userId, WebSocketSession session) {
        CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                userSessions.remove(userId);
            }
        }
        log.info("用户WebSocket会话已移除: userId={}, sessionId={}", userId, session.getId());
    }
    
    /**
     * 发送通知消息
     *
     * @param message 通知消息
     * @return 发送结果
     */
    public boolean sendMessage(NotificationMessage message) {
        try {
            Long recipientId = message.getRecipientId();
            CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(recipientId);
            
            if (sessions == null || sessions.isEmpty()) {
                log.warn("用户没有活跃的WebSocket连接: userId={}", recipientId);
                return false;
            }
            
            // 构造WebSocket消息
            WebSocketMessage wsMessage = new WebSocketMessage();
            wsMessage.setType("notification");
            wsMessage.setData(message);
            
            String messageJson = objectMapper.writeValueAsString(wsMessage);
            TextMessage textMessage = new TextMessage(messageJson);
            
            boolean allSent = true;
            for (WebSocketSession session : sessions) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                        log.debug("WebSocket消息发送成功: userId={}, sessionId={}", recipientId, session.getId());
                    } else {
                        sessions.remove(session);
                        log.warn("WebSocket会话已关闭，已移除: userId={}, sessionId={}", recipientId, session.getId());
                        allSent = false;
                    }
                } catch (Exception e) {
                    log.error("发送WebSocket消息异常: userId={}, sessionId={}", recipientId, session.getId(), e);
                    sessions.remove(session);
                    allSent = false;
                }
            }
            
            return allSent && !sessions.isEmpty();
            
        } catch (Exception e) {
            log.error("发送WebSocket通知异常: messageId={}", message.getId(), e);
            return false;
        }
    }
    
    /**
     * 向指定用户发送系统消息
     *
     * @param userId 用户ID
     * @param messageType 消息类型
     * @param data 消息数据
     * @return 发送结果
     */
    public boolean sendSystemMessage(Long userId, String messageType, Object data) {
        try {
            CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
            
            if (sessions == null || sessions.isEmpty()) {
                log.warn("用户没有活跃的WebSocket连接: userId={}", userId);
                return false;
            }
            
            WebSocketMessage wsMessage = new WebSocketMessage();
            wsMessage.setType(messageType);
            wsMessage.setData(data);
            
            String messageJson = objectMapper.writeValueAsString(wsMessage);
            TextMessage textMessage = new TextMessage(messageJson);
            
            boolean allSent = true;
            for (WebSocketSession session : sessions) {
                try {
                    if (session.isOpen()) {
                        session.sendMessage(textMessage);
                        log.debug("系统消息发送成功: userId={}, type={}", userId, messageType);
                    } else {
                        sessions.remove(session);
                        allSent = false;
                    }
                } catch (Exception e) {
                    log.error("发送系统消息异常: userId={}, type={}", userId, messageType, e);
                    sessions.remove(session);
                    allSent = false;
                }
            }
            
            return allSent && !sessions.isEmpty();
            
        } catch (Exception e) {
            log.error("发送系统消息异常: userId={}, type={}", userId, messageType, e);
            return false;
        }
    }
    
    /**
     * 广播消息给所有在线用户
     *
     * @param messageType 消息类型
     * @param data 消息数据
     * @return 发送统计
     */
    public BroadcastResult broadcastMessage(String messageType, Object data) {
        try {
            WebSocketMessage wsMessage = new WebSocketMessage();
            wsMessage.setType(messageType);
            wsMessage.setData(data);
            
            String messageJson = objectMapper.writeValueAsString(wsMessage);
            TextMessage textMessage = new TextMessage(messageJson);
            
            int totalUsers = userSessions.size();
            int successCount = 0;
            int failedCount = 0;
            
            for (Long userId : userSessions.keySet()) {
                CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
                if (sessions != null) {
                    boolean userSent = false;
                    for (WebSocketSession session : sessions) {
                        try {
                            if (session.isOpen()) {
                                session.sendMessage(textMessage);
                                userSent = true;
                                break; // 给用户发送一次即可
                            }
                        } catch (Exception e) {
                            log.error("广播消息发送异常: userId={}", userId, e);
                        }
                    }
                    
                    if (userSent) {
                        successCount++;
                    } else {
                        failedCount++;
                    }
                }
            }
            
            log.info("广播消息完成: type={}, total={}, success={}, failed={}", 
                    messageType, totalUsers, successCount, failedCount);
            
            return new BroadcastResult(totalUsers, successCount, failedCount);
            
        } catch (Exception e) {
            log.error("广播消息异常: type={}", messageType, e);
            return new BroadcastResult(0, 0, userSessions.size());
        }
    }
    
    /**
     * 获取在线用户数量
     *
     * @return 在线用户数量
     */
    public int getOnlineUserCount() {
        return userSessions.size();
    }
    
    /**
     * 检查用户是否在线
     *
     * @param userId 用户ID
     * @return 是否在线
     */
    public boolean isUserOnline(Long userId) {
        CopyOnWriteArraySet<WebSocketSession> sessions = userSessions.get(userId);
        return sessions != null && !sessions.isEmpty() && 
               sessions.stream().anyMatch(WebSocketSession::isOpen);
    }
    
    // ==================== 内部类 ====================
    
    /**
     * WebSocket消息
     */
    public static class WebSocketMessage {
        private String type;
        private Object data;
        private long timestamp = System.currentTimeMillis();
        
        // Getters and Setters
        public String getType() { return type; }
        public void setType(String type) { this.type = type; }
        
        public Object getData() { return data; }
        public void setData(Object data) { this.data = data; }
        
        public long getTimestamp() { return timestamp; }
        public void setTimestamp(long timestamp) { this.timestamp = timestamp; }
    }
    
    /**
     * 广播结果
     */
    public static class BroadcastResult {
        private final int totalUsers;
        private final int successCount;
        private final int failedCount;
        
        public BroadcastResult(int totalUsers, int successCount, int failedCount) {
            this.totalUsers = totalUsers;
            this.successCount = successCount;
            this.failedCount = failedCount;
        }
        
        public int getTotalUsers() { return totalUsers; }
        public int getSuccessCount() { return successCount; }
        public int getFailedCount() { return failedCount; }
        public double getSuccessRate() { 
            return totalUsers > 0 ? (double) successCount / totalUsers : 0.0; 
        }
    }
}