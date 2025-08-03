package com.drmp.controller.system;

import com.drmp.dto.request.system.UserCreateRequest;
import com.drmp.dto.request.system.UserQueryRequest;
import com.drmp.dto.request.system.UserUpdateRequest;
import com.drmp.dto.response.ApiResponse;
import com.drmp.dto.response.system.UserResponse;
import com.drmp.service.system.SysUserService;
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
import java.util.Map;

/**
 * 系统用户管理控制器
 */
@Slf4j
@RestController
@RequestMapping("/api/system/users")
@RequiredArgsConstructor
@Validated
@Tag(name = "系统用户管理", description = "系统用户的增删改查、权限管理等功能")
public class SysUserController {

    private final SysUserService userService;

    @Operation(summary = "分页查询用户", description = "根据条件分页查询系统用户")
    @GetMapping
    @PreAuthorize("hasAuthority('system:user:list')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getUsers(
            @Valid @ModelAttribute UserQueryRequest request) {
        
        Page<UserResponse> users = userService.getUsers(request);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    @Operation(summary = "获取用户详情", description = "根据用户ID获取详细信息")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:list')")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        UserResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    @Operation(summary = "创建用户", description = "创建新的系统用户")
    @PostMapping
    @PreAuthorize("hasAuthority('system:user:create')")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(
            @Valid @RequestBody UserCreateRequest request) {
        
        // 从Security上下文获取当前操作用户ID
        Long operatorId = getCurrentUserId();
        UserResponse user = userService.createUser(request, operatorId);
        return ResponseEntity.ok(ApiResponse.success(user, "用户创建成功"));
    }

    @Operation(summary = "更新用户", description = "更新用户信息")
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request) {
        
        Long operatorId = getCurrentUserId();
        UserResponse user = userService.updateUser(id, request, operatorId);
        return ResponseEntity.ok(ApiResponse.success(user, "用户更新成功"));
    }

    @Operation(summary = "删除用户", description = "删除指定用户")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        userService.deleteUser(id, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("用户删除成功"));
    }

    @Operation(summary = "批量删除用户", description = "批量删除多个用户")
    @DeleteMapping("/batch")
    @PreAuthorize("hasAuthority('system:user:delete')")
    public ResponseEntity<ApiResponse<Void>> deleteUsers(
            @Parameter(description = "用户ID数组") @RequestBody Long[] ids) {
        
        Long operatorId = getCurrentUserId();
        userService.deleteUsers(ids, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("批量删除成功"));
    }

    @Operation(summary = "启用用户", description = "启用指定用户")
    @PutMapping("/{id}/enable")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> enableUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        userService.enableUser(id, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("用户启用成功"));
    }

    @Operation(summary = "禁用用户", description = "禁用指定用户")
    @PutMapping("/{id}/disable")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> disableUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        userService.disableUser(id, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("用户禁用成功"));
    }

    @Operation(summary = "锁定用户", description = "锁定指定用户")
    @PutMapping("/{id}/lock")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> lockUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        userService.lockUser(id, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("用户锁定成功"));
    }

    @Operation(summary = "解锁用户", description = "解锁指定用户")
    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> unlockUser(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        userService.unlockUser(id, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("用户解锁成功"));
    }

    @Operation(summary = "重置密码", description = "重置用户密码并返回新密码")
    @PutMapping("/{id}/reset-password")
    @PreAuthorize("hasAuthority('system:user:reset-password')")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPassword(
            @Parameter(description = "用户ID") @PathVariable Long id) {
        
        Long operatorId = getCurrentUserId();
        String newPassword = userService.resetPassword(id, operatorId);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("newPassword", newPassword), "密码重置成功"));
    }

    @Operation(summary = "分配角色", description = "为用户分配角色")
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> assignRoles(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "角色ID数组") @RequestBody Long[] roleIds) {
        
        Long operatorId = getCurrentUserId();
        userService.assignRoles(id, roleIds, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("角色分配成功"));
    }

    @Operation(summary = "移除角色", description = "移除用户的指定角色")
    @DeleteMapping("/{id}/roles")
    @PreAuthorize("hasAuthority('system:user:update')")
    public ResponseEntity<ApiResponse<Void>> removeRoles(
            @Parameter(description = "用户ID") @PathVariable Long id,
            @Parameter(description = "角色ID数组") @RequestBody Long[] roleIds) {
        
        Long operatorId = getCurrentUserId();
        userService.removeRoles(id, roleIds, operatorId);
        return ResponseEntity.ok(ApiResponse.successWithMessage("角色移除成功"));
    }

    @Operation(summary = "检查用户名", description = "检查用户名是否已存在")
    @GetMapping("/check-username")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkUsername(
            @Parameter(description = "用户名") @RequestParam String username) {
        
        boolean exists = userService.existsByUsername(username);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("exists", exists)));
    }

    @Operation(summary = "检查邮箱", description = "检查邮箱是否已存在")
    @GetMapping("/check-email")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkEmail(
            @Parameter(description = "邮箱") @RequestParam String email) {
        
        boolean exists = userService.existsByEmail(email);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("exists", exists)));
    }

    @Operation(summary = "检查手机号", description = "检查手机号是否已存在")
    @GetMapping("/check-phone")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> checkPhone(
            @Parameter(description = "手机号") @RequestParam String phone) {
        
        boolean exists = userService.existsByPhone(phone);
        return ResponseEntity.ok(ApiResponse.success(
            Map.of("exists", exists)));
    }

    @Operation(summary = "获取用户统计", description = "获取用户相关的统计数据")
    @GetMapping("/statistics")
    @PreAuthorize("hasAuthority('system:user:list')")
    public ResponseEntity<ApiResponse<SysUserService.UserStatistics>> getUserStatistics() {
        
        SysUserService.UserStatistics statistics = userService.getUserStatistics();
        return ResponseEntity.ok(ApiResponse.success(statistics));
    }

    /**
     * 获取当前登录用户ID
     * 这里需要根据实际的Security配置实现
     */
    private Long getCurrentUserId() {
        // 临时返回1，实际需要从SecurityContext获取
        return 1L;
    }
}