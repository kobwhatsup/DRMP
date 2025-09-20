package com.drmp.service.system;

import com.drmp.dto.request.system.UserCreateRequest;
import com.drmp.dto.request.system.UserQueryRequest;
import com.drmp.dto.request.system.UserUpdateRequest;
import com.drmp.dto.response.system.UserResponse;
import org.springframework.data.domain.Page;

/**
 * 系统用户服务接口
 */
public interface SysUserService {

    /**
     * 分页查询用户
     */
    Page<UserResponse> getUsers(UserQueryRequest request);

    /**
     * 根据ID获取用户详情
     */
    UserResponse getUserById(Long id);

    /**
     * 创建用户
     */
    UserResponse createUser(UserCreateRequest request, Long operatorId);

    /**
     * 更新用户
     */
    UserResponse updateUser(Long id, UserUpdateRequest request, Long operatorId);

    /**
     * 删除用户
     */
    void deleteUser(Long id, Long operatorId);

    /**
     * 批量删除用户
     */
    void deleteUsers(Long[] ids, Long operatorId);

    /**
     * 启用用户
     */
    void enableUser(Long id, Long operatorId);

    /**
     * 禁用用户
     */
    void disableUser(Long id, Long operatorId);

    /**
     * 锁定用户
     */
    void lockUser(Long id, Long operatorId);

    /**
     * 解锁用户
     */
    void unlockUser(Long id, Long operatorId);

    /**
     * 重置用户密码
     */
    String resetPassword(Long id, Long operatorId);

    /**
     * 分配角色
     */
    void assignRoles(Long userId, Long[] roleIds, Long operatorId);

    /**
     * 移除角色
     */
    void removeRoles(Long userId, Long[] roleIds, Long operatorId);

    /**
     * 检查用户名是否存在
     */
    boolean existsByUsername(String username);

    /**
     * 检查邮箱是否存在
     */
    boolean existsByEmail(String email);

    /**
     * 检查手机号是否存在
     */
    boolean existsByPhone(String phone);

    /**
     * 根据用户名获取用户
     */
    UserResponse getUserByUsername(String username);

    /**
     * 更新用户最后登录信息
     */
    void updateLastLoginInfo(Long userId, String loginIp);

    /**
     * 增加登录失败次数
     */
    void incrementLoginFailureCount(Long userId);

    /**
     * 重置登录失败次数
     */
    void resetLoginFailureCount(Long userId);

    /**
     * 获取用户统计信息
     */
    UserStatistics getUserStatistics();

    /**
     * 用户统计信息
     */
    interface UserStatistics {
        long getTotalUsers();
        long getActiveUsers();
        long getDisabledUsers();
        long getLockedUsers();
        long getPendingUsers();
        long getTodayNewUsers();
        long getOnlineUsers();
    }
}