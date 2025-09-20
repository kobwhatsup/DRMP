package com.drmp.service.notification;

import com.drmp.dto.notification.NotificationMessage;
import com.drmp.dto.notification.NotificationTemplate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ListOperations;
import org.springframework.data.redis.core.ValueOperations;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private WebSocketNotificationService webSocketService;

    @Mock
    private EmailNotificationService emailService;

    @Mock
    private SmsNotificationService smsService;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ListOperations<String, Object> listOperations;

    @Mock
    private ValueOperations<String, Object> valueOperations;

    @InjectMocks
    private NotificationService notificationService;

    private NotificationMessage testMessage;

    @BeforeEach
    void setUp() {
        // 设置Redis操作模拟
        when(redisTemplate.opsForList()).thenReturn(listOperations);
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        // 创建测试消息
        testMessage = new NotificationMessage();
        testMessage.setId(1L);
        testMessage.setType("TEST_MESSAGE");
        testMessage.setTitle("测试标题");
        testMessage.setContent("测试内容");
        testMessage.setRecipientId(100L);
        testMessage.setChannel("WEBSOCKET");
        testMessage.setPriority("NORMAL");
        testMessage.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void testSendNotification_WebSocket_Success() throws Exception {
        // Arrange
        when(webSocketService.sendMessage(testMessage)).thenReturn(true);

        // Act
        CompletableFuture<Boolean> result = notificationService.sendNotification(testMessage);
        Boolean sent = result.get();

        // Assert
        assertTrue(sent);
        assertEquals("SENT", testMessage.getStatus());
        assertNotNull(testMessage.getSentAt());

        // 验证调用
        verify(webSocketService).sendMessage(testMessage);
        verify(listOperations).rightPush(eq("notification:queue"), eq(testMessage));
        verify(listOperations).rightPush(eq("notification:history:100"), eq(testMessage));
    }

    @Test
    void testSendNotification_Email_Success() throws Exception {
        // Arrange
        testMessage.setChannel("EMAIL");
        when(emailService.sendEmail(testMessage)).thenReturn(true);

        // Act
        CompletableFuture<Boolean> result = notificationService.sendNotification(testMessage);
        Boolean sent = result.get();

        // Assert
        assertTrue(sent);
        assertEquals("SENT", testMessage.getStatus());

        // 验证调用
        verify(emailService).sendEmail(testMessage);
    }

    @Test
    void testSendNotification_SMS_Success() throws Exception {
        // Arrange
        testMessage.setChannel("SMS");
        when(smsService.sendSms(testMessage)).thenReturn(true);

        // Act
        CompletableFuture<Boolean> result = notificationService.sendNotification(testMessage);
        Boolean sent = result.get();

        // Assert
        assertTrue(sent);
        assertEquals("SENT", testMessage.getStatus());

        // 验证调用
        verify(smsService).sendSms(testMessage);
    }

    @Test
    void testSendNotification_Failed_WithRetry() throws Exception {
        // Arrange
        testMessage.setRetryable(true);
        testMessage.setRetryCount(0);
        when(webSocketService.sendMessage(testMessage)).thenReturn(false);

        // Act
        CompletableFuture<Boolean> result = notificationService.sendNotification(testMessage);
        Boolean sent = result.get();

        // Assert
        assertFalse(sent);
        assertEquals("FAILED", testMessage.getStatus());

        // 验证重试逻辑
        verify(valueOperations).set(eq("notification:retry:1"), eq(testMessage), eq(5L), any());
    }

    @Test
    void testSendNotification_InvalidMessage() throws Exception {
        // Arrange
        testMessage.setRecipientId(null); // 无效消息

        // Act
        CompletableFuture<Boolean> result = notificationService.sendNotification(testMessage);
        Boolean sent = result.get();

        // Assert
        assertFalse(sent);
        assertEquals("FAILED", testMessage.getStatus());

        // 验证没有调用发送服务
        verify(webSocketService, never()).sendMessage(any());
        verify(emailService, never()).sendEmail(any());
        verify(smsService, never()).sendSms(any());
    }

    @Test
    void testCreateFromTemplate_Success() {
        // Arrange
        Map<String, Object> variables = new HashMap<>();
        variables.put("packageName", "测试案件包");
        variables.put("caseCount", 10);
        variables.put("totalAmount", 100000);

        // Act
        NotificationMessage message = notificationService.createFromTemplate(
                "CASE_ASSIGNMENT", 100L, variables, "WEBSOCKET");

        // Assert
        assertNotNull(message);
        assertEquals("CASE_ASSIGNMENT", message.getType());
        assertEquals(100L, message.getRecipientId());
        assertEquals("WEBSOCKET", message.getChannel());
        assertTrue(message.getTitle().contains("案件包"));
        assertTrue(message.getContent().contains("测试案件包"));
        assertTrue(message.getContent().contains("10"));
        assertTrue(message.getContent().contains("100000"));
    }

    @Test
    void testCreateFromTemplate_TemplateNotFound() {
        // Arrange
        Map<String, Object> variables = new HashMap<>();

        // Act
        NotificationMessage message = notificationService.createFromTemplate(
                "NON_EXISTING_TEMPLATE", 100L, variables, "WEBSOCKET");

        // Assert
        assertNull(message);
    }

    @Test
    void testGetUnreadMessages() {
        // Arrange
        Long userId = 100L;
        List<Object> messages = Arrays.asList(
                createTestMessage(1L, "SENT", null),
                createTestMessage(2L, "SENT", LocalDateTime.now()),
                createTestMessage(3L, "SENT", null)
        );
        
        when(listOperations.range("notification:history:100", 0, -1)).thenReturn(messages);

        // Act
        List<NotificationMessage> unreadMessages = notificationService.getUnreadMessages(userId);

        // Assert
        assertEquals(2, unreadMessages.size());
        assertTrue(unreadMessages.stream().allMatch(msg -> msg.getReadAt() == null));
    }

    @Test
    void testMarkAsRead_Success() {
        // Arrange
        Long messageId = 1L;
        Long userId = 100L;
        List<Object> messages = Arrays.asList(
                createTestMessage(1L, "SENT", null),
                createTestMessage(2L, "SENT", null)
        );

        when(listOperations.range("notification:history:100", 0, -1)).thenReturn(messages);

        // Act
        boolean result = notificationService.markAsRead(messageId, userId);

        // Assert
        assertTrue(result);
        verify(listOperations).set(eq("notification:history:100"), eq(0), any(NotificationMessage.class));
    }

    @Test
    void testMarkAsRead_MessageNotFound() {
        // Arrange
        Long messageId = 999L;
        Long userId = 100L;
        List<Object> messages = Arrays.asList(
                createTestMessage(1L, "SENT", null)
        );

        when(listOperations.range("notification:history:100", 0, -1)).thenReturn(messages);

        // Act
        boolean result = notificationService.markAsRead(messageId, userId);

        // Assert
        assertFalse(result);
    }

    @Test
    void testGetMessageStatistics() {
        // Arrange
        Long userId = 100L;
        List<Object> messages = Arrays.asList(
                createTestMessage(1L, "SENT", null),
                createTestMessage(2L, "SENT", LocalDateTime.now()),
                createTestMessage(3L, "SENT", null),
                createTestMessage(4L, "SENT", LocalDateTime.now())
        );

        when(listOperations.range("notification:history:100", 0, -1)).thenReturn(messages);

        // Act
        Map<String, Long> stats = notificationService.getMessageStatistics(userId);

        // Assert
        assertEquals(4L, stats.get("total"));
        assertEquals(2L, stats.get("unread"));
        assertEquals(2L, stats.get("read"));
    }

    @Test
    void testBatchSendNotifications() throws Exception {
        // Arrange
        NotificationMessage message1 = createTestMessage(1L, "PENDING", null);
        message1.setChannel("WEBSOCKET");
        NotificationMessage message2 = createTestMessage(2L, "PENDING", null);
        message2.setChannel("EMAIL");

        List<NotificationMessage> messages = Arrays.asList(message1, message2);

        when(webSocketService.sendMessage(message1)).thenReturn(true);
        when(emailService.sendEmail(message2)).thenReturn(true);

        // Act
        CompletableFuture<Map<Long, Boolean>> result = notificationService.batchSendNotifications(messages);
        Map<Long, Boolean> results = result.get();

        // Assert
        assertEquals(2, results.size());
        assertTrue(results.get(1L));
        assertTrue(results.get(2L));
    }

    // 辅助方法
    private NotificationMessage createTestMessage(Long id, String status, LocalDateTime readAt) {
        NotificationMessage message = new NotificationMessage();
        message.setId(id);
        message.setType("TEST");
        message.setTitle("测试消息");
        message.setContent("测试内容");
        message.setRecipientId(100L);
        message.setStatus(status);
        message.setReadAt(readAt);
        message.setCreatedAt(LocalDateTime.now());
        return message;
    }
}