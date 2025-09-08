package com.drmp.controller;

import com.drmp.dto.request.NotificationCreateRequest;
import com.drmp.dto.request.NotificationQueryRequest;
import com.drmp.dto.request.ReminderCreateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.NotificationResponse;
import com.drmp.dto.response.ReminderResponse;
import com.drmp.service.NotificationService;
import com.drmp.util.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

/**
 * 智能提醒和通知控制器
 * 处理系统通知、智能提醒、消息推送等功能
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@RestController
@RequestMapping("/v1/notifications")
@RequiredArgsConstructor
@Validated
@Tag(name = "智能提醒和通知", description = "系统通知、智能提醒、消息推送功能")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "获取通知列表", description = "分页查询用户通知列表")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotificationList(
            @Parameter(description = "查询参数") @Valid NotificationQueryRequest request) {
        
        log.info("Getting notification list for user: {}", SecurityUtils.getCurrentUserId());
        request.setUserId(SecurityUtils.getCurrentUserId());
        Page<NotificationResponse> result = notificationService.getNotificationList(request);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "获取未读通知数量", description = "获取当前用户的未读通知数量")
    @GetMapping("/unread-count")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUnreadNotificationCount() {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Getting unread notification count for user: {}", userId);
        Map<String, Object> result = notificationService.getUnreadNotificationCount(userId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "标记通知为已读", description = "标记指定通知为已读状态")
    @PostMapping("/{notificationId}/mark-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> markNotificationAsRead(
            @Parameter(description = "通知ID") @PathVariable Long notificationId) {
        
        log.info("Marking notification as read: {}", notificationId);
        notificationService.markNotificationAsRead(notificationId, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("通知已标记为已读"));
    }

    @Operation(summary = "批量标记已读", description = "批量标记多个通知为已读")
    @PostMapping("/batch-mark-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> batchMarkNotificationsAsRead(
            @Parameter(description = "通知ID列表") @RequestBody List<Long> notificationIds) {
        
        log.info("Batch marking notifications as read: {}", notificationIds);
        notificationService.batchMarkNotificationsAsRead(notificationIds, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("批量标记已读成功"));
    }

    @Operation(summary = "全部标记为已读", description = "标记所有未读通知为已读")
    @PostMapping("/mark-all-read")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> markAllNotificationsAsRead() {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Marking all notifications as read for user: {}", userId);
        notificationService.markAllNotificationsAsRead(userId);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("全部通知已标记为已读"));
    }

    @Operation(summary = "删除通知", description = "删除指定通知")
    @DeleteMapping("/{notificationId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @Parameter(description = "通知ID") @PathVariable Long notificationId) {
        
        log.info("Deleting notification: {}", notificationId);
        notificationService.deleteNotification(notificationId, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("通知删除成功"));
    }

    @Operation(summary = "创建提醒", description = "创建智能提醒")
    @PostMapping("/reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReminderResponse>> createReminder(
            @Parameter(description = "提醒信息") @Valid @RequestBody ReminderCreateRequest request) {
        
        log.info("Creating reminder for user: {}", SecurityUtils.getCurrentUserId());
        request.setCreatedBy(SecurityUtils.getCurrentUserId());
        ReminderResponse result = notificationService.createReminder(request);
        
        return ResponseEntity.ok(ApiResponse.success(result, "提醒创建成功"));
    }

    @Operation(summary = "获取提醒列表", description = "获取用户的提醒列表")
    @GetMapping("/reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<List<ReminderResponse>>> getReminderList(
            @Parameter(description = "提醒状态") @RequestParam(required = false) String status,
            @Parameter(description = "业务类型") @RequestParam(required = false) String businessType) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Getting reminder list for user: {}, status: {}, businessType: {}", userId, status, businessType);
        List<ReminderResponse> result = notificationService.getReminderList(userId, status, businessType);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "更新提醒", description = "更新提醒信息")
    @PutMapping("/reminders/{reminderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<ReminderResponse>> updateReminder(
            @Parameter(description = "提醒ID") @PathVariable Long reminderId,
            @Parameter(description = "提醒信息") @Valid @RequestBody ReminderCreateRequest request) {
        
        log.info("Updating reminder: {}", reminderId);
        ReminderResponse result = notificationService.updateReminder(reminderId, request, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.success(result, "提醒更新成功"));
    }

    @Operation(summary = "取消提醒", description = "取消指定提醒")
    @PostMapping("/reminders/{reminderId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> cancelReminder(
            @Parameter(description = "提醒ID") @PathVariable Long reminderId) {
        
        log.info("Cancelling reminder: {}", reminderId);
        notificationService.cancelReminder(reminderId, SecurityUtils.getCurrentUserId());
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("提醒已取消"));
    }

    @Operation(summary = "获取智能推荐提醒", description = "根据用户行为和业务规则推荐智能提醒")
    @GetMapping("/smart-reminders")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getSmartReminderSuggestions() {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Getting smart reminder suggestions for user: {}", userId);
        List<Map<String, Object>> result = notificationService.getSmartReminderSuggestions(userId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "发送即时通知", description = "发送即时通知给指定用户")
    @PostMapping("/send-instant")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> sendInstantNotification(
            @Parameter(description = "通知信息") @Valid @RequestBody NotificationCreateRequest request) {
        
        log.info("Sending instant notification to users: {}", request.getRecipientUserIds());
        request.setSenderId(SecurityUtils.getCurrentUserId());
        notificationService.sendInstantNotification(request);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("即时通知发送成功"));
    }

    @Operation(summary = "订阅通知", description = "订阅特定类型的通知")
    @PostMapping("/subscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> subscribeNotification(
            @Parameter(description = "通知类型") @RequestParam String notificationType,
            @Parameter(description = "业务ID") @RequestParam(required = false) Long businessId) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("User {} subscribing to notification type: {}, businessId: {}", userId, notificationType, businessId);
        notificationService.subscribeNotification(userId, notificationType, businessId);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("订阅成功"));
    }

    @Operation(summary = "取消订阅", description = "取消订阅特定类型的通知")
    @PostMapping("/unsubscribe")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> unsubscribeNotification(
            @Parameter(description = "通知类型") @RequestParam String notificationType,
            @Parameter(description = "业务ID") @RequestParam(required = false) Long businessId) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("User {} unsubscribing from notification type: {}, businessId: {}", userId, notificationType, businessId);
        notificationService.unsubscribeNotification(userId, notificationType, businessId);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("取消订阅成功"));
    }

    @Operation(summary = "获取通知设置", description = "获取用户的通知设置")
    @GetMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotificationSettings() {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Getting notification settings for user: {}", userId);
        Map<String, Object> result = notificationService.getNotificationSettings(userId);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "更新通知设置", description = "更新用户的通知设置")
    @PostMapping("/settings")
    @PreAuthorize("hasAnyRole('ADMIN', 'CASE_MANAGER', 'SOURCE_ORG_MANAGER', 'DISPOSAL_ORG_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> updateNotificationSettings(
            @Parameter(description = "通知设置") @RequestBody Map<String, Object> settings) {
        
        Long userId = SecurityUtils.getCurrentUserId();
        log.info("Updating notification settings for user: {}", userId);
        notificationService.updateNotificationSettings(userId, settings);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("通知设置更新成功"));
    }

    @Operation(summary = "获取通知模板", description = "获取可用的通知模板")
    @GetMapping("/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getNotificationTemplates(
            @Parameter(description = "模板类型") @RequestParam(required = false) String templateType) {
        
        log.info("Getting notification templates for type: {}", templateType);
        List<Map<String, Object>> result = notificationService.getNotificationTemplates(templateType);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    @Operation(summary = "测试通知发送", description = "测试通知发送功能")
    @PostMapping("/test")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> testNotification(
            @Parameter(description = "通知类型") @RequestParam String notificationType,
            @Parameter(description = "接收用户ID") @RequestParam Long recipientUserId,
            @Parameter(description = "测试内容") @RequestParam(required = false) String testContent) {
        
        log.info("Testing notification: type={}, recipient={}", notificationType, recipientUserId);
        notificationService.testNotification(notificationType, recipientUserId, testContent);
        
        return ResponseEntity.ok(ApiResponse.successWithMessage("测试通知发送成功"));
    }

    @Operation(summary = "获取通知统计", description = "获取通知发送和处理统计")
    @GetMapping("/statistics")
    @PreAuthorize("hasAnyRole('ADMIN', 'PLATFORM_MANAGER')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getNotificationStatistics(
            @Parameter(description = "统计时间范围(天)") @RequestParam(defaultValue = "30") Integer days) {
        
        log.info("Getting notification statistics for {} days", days);
        Map<String, Object> result = notificationService.getNotificationStatistics(days);
        
        return ResponseEntity.ok(ApiResponse.success(result));
    }
}