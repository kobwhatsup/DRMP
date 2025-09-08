package com.drmp.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 全局异常处理器
 * 统一处理所有异常，返回标准格式的错误响应
 *
 * @author DRMP Team
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * 处理业务异常
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResponse<Object>> handleBusinessException(BusinessException e, WebRequest request) {
        log.warn("业务异常: code={}, message={}, path={}", e.getCode(), e.getMessage(), getRequestPath(request));
        return ResponseEntity.status(getHttpStatus(e.getCode()))
                .body(ApiResponse.error(e.getCode(), e.getMessage()));
    }

    /**
     * 处理参数校验异常
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Object>> handleValidationException(MethodArgumentNotValidException e, WebRequest request) {
        log.warn("参数校验异常: path={}", getRequestPath(request), e);
        
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        
        String message = "参数校验失败: " + errors.values().stream()
                .collect(Collectors.joining(", "));
                
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message, errors));
    }

    /**
     * 处理绑定异常
     */
    @ExceptionHandler(BindException.class)
    public ResponseEntity<ApiResponse<Object>> handleBindException(BindException e, WebRequest request) {
        log.warn("参数绑定异常: path={}", getRequestPath(request), e);
        
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : e.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        
        String message = "参数绑定失败: " + errors.values().stream()
                .collect(Collectors.joining(", "));
                
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message, errors));
    }

    /**
     * 处理约束校验异常
     */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolationException(ConstraintViolationException e, WebRequest request) {
        log.warn("约束校验异常: path={}", getRequestPath(request), e);
        
        Set<ConstraintViolation<?>> violations = e.getConstraintViolations();
        Map<String, String> errors = violations.stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage
                ));
        
        String message = "约束校验失败: " + errors.values().stream()
                .collect(Collectors.joining(", "));
                
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message, errors));
    }

    /**
     * 处理缺少请求参数异常
     */
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<Object>> handleMissingParameterException(MissingServletRequestParameterException e, WebRequest request) {
        log.warn("缺少请求参数异常: parameter={}, path={}", e.getParameterName(), getRequestPath(request));
        
        String message = String.format("缺少必需的请求参数: %s", e.getParameterName());
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message));
    }

    /**
     * 处理HTTP消息不可读异常
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<Object>> handleHttpMessageNotReadableException(HttpMessageNotReadableException e, WebRequest request) {
        log.warn("HTTP消息不可读异常: path={}", getRequestPath(request), e);
        
        String message = "请求体格式错误，请检查JSON格式";
        if (e.getMessage() != null && e.getMessage().contains("JSON parse error")) {
            message = "JSON格式错误: " + extractJsonErrorMessage(e.getMessage());
        }
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message));
    }

    /**
     * 处理不支持的HTTP方法异常
     */
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMethodNotSupportedException(HttpRequestMethodNotSupportedException e, WebRequest request) {
        log.warn("不支持的HTTP方法异常: method={}, path={}", e.getMethod(), getRequestPath(request));
        
        String message = String.format("不支持的HTTP方法: %s，支持的方法: %s", 
                e.getMethod(), String.join(", ", e.getSupportedMethods()));
        
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED)
                .body(ApiResponse.error(405, message));
    }

    /**
     * 处理不支持的媒体类型异常
     */
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiResponse<Object>> handleMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException e, WebRequest request) {
        log.warn("不支持的媒体类型异常: contentType={}, path={}", e.getContentType(), getRequestPath(request));
        
        String message = String.format("不支持的媒体类型: %s，支持的类型: %s", 
                e.getContentType(), e.getSupportedMediaTypes().stream()
                        .map(Object::toString)
                        .collect(Collectors.joining(", ")));
        
        return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                .body(ApiResponse.error(415, message));
    }

    /**
     * 处理认证异常
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthenticationException(AuthenticationException e, WebRequest request) {
        log.warn("认证异常: message={}, path={}", e.getMessage(), getRequestPath(request));
        
        String message = "认证失败";
        if (e instanceof BadCredentialsException) {
            message = "用户名或密码错误";
        }
        
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResponse.error(401, message));
    }

    /**
     * 处理权限不足异常
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDeniedException(AccessDeniedException e, WebRequest request) {
        log.warn("权限不足异常: message={}, path={}", e.getMessage(), getRequestPath(request));
        
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.error(403, "权限不足，无法访问该资源"));
    }

    /**
     * 处理找不到处理器异常
     */
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> handleNoHandlerFoundException(NoHandlerFoundException e, WebRequest request) {
        log.warn("找不到处理器异常: method={}, url={}", e.getHttpMethod(), e.getRequestURL());
        
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.error(404, "请求的资源不存在"));
    }

    /**
     * 处理文件上传大小超限异常
     */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Object>> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException e, WebRequest request) {
        log.warn("文件上传大小超限异常: maxSize={}, path={}", e.getMaxUploadSize(), getRequestPath(request));
        
        String message = String.format("文件大小超过限制，最大允许: %d bytes", e.getMaxUploadSize());
        
        return ResponseEntity.badRequest()
                .body(ApiResponse.error(400, message));
    }

    /**
     * 处理数据库访问异常
     */
    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResponse<Object>> handleDataAccessException(DataAccessException e, WebRequest request) {
        log.error("数据库访问异常: path={}", getRequestPath(request), e);
        
        String message = "数据库操作失败";
        if (e instanceof DataIntegrityViolationException) {
            message = "数据完整性约束冲突，可能存在重复数据";
        }
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, message));
    }

    /**
     * 处理其他所有异常
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception e, WebRequest request) {
        log.error("未处理异常: type={}, message={}, path={}", 
                e.getClass().getSimpleName(), e.getMessage(), getRequestPath(request), e);
        
        // 开发环境显示详细错误信息
        String message = isDevelopmentMode() ? 
                String.format("系统异常: %s - %s", e.getClass().getSimpleName(), e.getMessage()) :
                "系统内部错误，请稍后重试";
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error(500, message));
    }

    // ==================== 私有辅助方法 ====================

    /**
     * 获取请求路径
     */
    private String getRequestPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }

    /**
     * 根据错误码获取HTTP状态码
     */
    private HttpStatus getHttpStatus(int errorCode) {
        int statusCategory = errorCode / 100;
        if (statusCategory == 4) {
            return HttpStatus.valueOf(errorCode);
        } else if (statusCategory == 5) {
            return HttpStatus.INTERNAL_SERVER_ERROR;
        } else {
            return HttpStatus.BAD_REQUEST;
        }
    }

    /**
     * 提取JSON错误信息
     */
    private String extractJsonErrorMessage(String fullMessage) {
        if (fullMessage == null) return "JSON解析失败";
        
        // 提取关键错误信息
        if (fullMessage.contains("Unexpected character")) {
            return "JSON格式错误，包含非法字符";
        } else if (fullMessage.contains("Expected")) {
            return "JSON格式错误，缺少必要的字符或结构";
        } else if (fullMessage.contains("Cannot deserialize")) {
            return "JSON数据类型转换失败";
        } else {
            return "JSON解析失败";
        }
    }

    /**
     * 判断是否为开发模式
     */
    private boolean isDevelopmentMode() {
        // 这里可以通过配置或环境变量判断
        String profiles = System.getProperty("spring.profiles.active", "");
        return profiles.contains("dev") || profiles.contains("local");
    }
}