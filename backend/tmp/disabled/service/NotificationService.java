package com.drmp.service;

import com.drmp.dto.request.NotificationCreateRequest;
import com.drmp.dto.request.NotificationQueryRequest;
import com.drmp.dto.request.ReminderCreateRequest;
import com.drmp.dto.response.NotificationResponse;
import com.drmp.dto.response.ReminderResponse;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.Map;

/**
 * 智能提醒和通知服务接口
 * 处理系统通知、智能提醒、消息推送等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
public interface NotificationService {

    /**
     * 获取通知列表
     * 
     * @param request 查询请求
     * @return 通知列表
     */
    Page<NotificationResponse> getNotificationList(NotificationQueryRequest request);

    /**
     * 获取未读通知数量
     * 
     * @param userId 用户ID
     * @return 未读通知统计
     */
    Map<String, Object> getUnreadNotificationCount(Long userId);

    /**
     * 标记通知为已读
     * 
     * @param notificationId 通知ID
     * @param userId 用户ID
     */
    void markNotificationAsRead(Long notificationId, Long userId);

    /**
     * 批量标记通知为已读
     * 
     * @param notificationIds 通知ID列表
     * @param userId 用户ID
     */
    void batchMarkNotificationsAsRead(List<Long> notificationIds, Long userId);

    /**
     * 标记所有通知为已读
     * 
     * @param userId 用户ID
     */
    void markAllNotificationsAsRead(Long userId);

    /**
     * 删除通知
     * 
     * @param notificationId 通知ID
     * @param userId 用户ID
     */
    void deleteNotification(Long notificationId, Long userId);

    /**
     * 创建提醒
     * 
     * @param request 提醒创建请求
     * @return 提醒响应
     */
    ReminderResponse createReminder(ReminderCreateRequest request);

    /**
     * 获取提醒列表
     * 
     * @param userId 用户ID
     * @param status 状态
     * @param businessType 业务类型
     * @return 提醒列表
     */
    List<ReminderResponse> getReminderList(Long userId, String status, String businessType);

    /**
     * 更新提醒
     * 
     * @param reminderId 提醒ID
     * @param request 更新请求
     * @param userId 用户ID
     * @return 提醒响应
     */
    ReminderResponse updateReminder(Long reminderId, ReminderCreateRequest request, Long userId);

    /**
     * 取消提醒
     * 
     * @param reminderId 提醒ID
     * @param userId 用户ID
     */
    void cancelReminder(Long reminderId, Long userId);

    /**
     * 获取智能提醒建议
     * 
     * @param userId 用户ID
     * @return 提醒建议列表
     */
    List<Map<String, Object>> getSmartReminderSuggestions(Long userId);

    /**
     * 发送即时通知
     * 
     * @param request 通知创建请求
     */
    void sendInstantNotification(NotificationCreateRequest request);

    /**
     * 订阅通知
     * 
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessId 业务ID
     */
    void subscribeNotification(Long userId, String notificationType, Long businessId);

    /**
     * 取消订阅通知
     * 
     * @param userId 用户ID
     * @param notificationType 通知类型
     * @param businessId 业务ID
     */
    void unsubscribeNotification(Long userId, String notificationType, Long businessId);

    /**
     * 获取通知设置
     * 
     * @param userId 用户ID
     * @return 通知设置
     */
    Map<String, Object> getNotificationSettings(Long userId);

    /**
     * 更新通知设置
     * 
     * @param userId 用户ID
     * @param settings 设置参数
     */
    void updateNotificationSettings(Long userId, Map<String, Object> settings);

    /**
     * 获取通知模板
     * 
     * @param templateType 模板类型
     * @return 模板列表
     */
    List<Map<String, Object>> getNotificationTemplates(String templateType);

    /**
     * 测试通知发送
     * 
     * @param notificationType 通知类型
     * @param recipientUserId 接收用户ID
     * @param testContent 测试内容
     */
    void testNotification(String notificationType, Long recipientUserId, String testContent);

    /**
     * 获取通知统计
     * 
     * @param days 统计天数
     * @return 统计数据
     */
    Map<String, Object> getNotificationStatistics(Integer days);
}