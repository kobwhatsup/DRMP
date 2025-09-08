package com.drmp.aspect;

import com.drmp.annotation.OperationLog;
import com.drmp.entity.system.SysOperationLog;
import com.drmp.service.system.OperationLogService;
import com.drmp.util.IpUtils;
import com.drmp.util.JsonUtils;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.AfterThrowing;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.lang.reflect.Method;
import java.time.LocalDateTime;

/**
 * 操作日志切面
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Aspect
@Component
@Order(1)
@RequiredArgsConstructor
public class OperationLogAspect {

    private final OperationLogService operationLogService;

    /**
     * 切点：标注了@OperationLog注解的方法
     */
    @Pointcut("@annotation(com.drmp.annotation.OperationLog)")
    public void operationLogPointcut() {
    }

    /**
     * 环绕通知：记录操作日志
     */
    @Around("operationLogPointcut()")
    public Object around(ProceedingJoinPoint joinPoint) throws Throwable {
        long startTime = System.currentTimeMillis();
        SysOperationLog operationLog = new SysOperationLog();
        
        try {
            // 获取注解信息
            MethodSignature signature = (MethodSignature) joinPoint.getSignature();
            Method method = signature.getMethod();
            OperationLog annotation = method.getAnnotation(OperationLog.class);
            
            // 获取请求信息
            HttpServletRequest request = getHttpServletRequest();
            
            // 设置基本信息
            operationLog.setUserId(SecurityUtils.getCurrentUserId());
            operationLog.setUsername(SecurityUtils.getCurrentUsername());
            operationLog.setOperationType(annotation.operationType());
            operationLog.setModuleName(annotation.module());
            operationLog.setBusinessType(annotation.businessType());
            operationLog.setMethodName(joinPoint.getTarget().getClass().getName() + "." + method.getName());
            operationLog.setOperatedAt(LocalDateTime.now());
            
            if (request != null) {
                operationLog.setRequestMethod(request.getMethod());
                operationLog.setRequestUrl(request.getRequestURI());
                operationLog.setOperationIp(IpUtils.getClientIp(request));
                operationLog.setUserAgent(request.getHeader("User-Agent"));
            }
            
            // 记录请求参数
            if (annotation.includeArgs()) {
                String params = getMethodParams(joinPoint);
                operationLog.setRequestParams(params);
            }
            
            // 执行目标方法
            Object result = joinPoint.proceed();
            
            // 记录响应结果
            if (annotation.includeResult()) {
                operationLog.setResponseResult(JsonUtils.toJsonString(result));
            }
            
            // 计算执行时间
            long executionTime = System.currentTimeMillis() - startTime;
            operationLog.setExecutionTime(executionTime);
            operationLog.setOperationStatus(SysOperationLog.OperationStatus.SUCCESS);
            
            // 保存日志
            saveOperationLog(operationLog, annotation.async());
            
            return result;
            
        } catch (Exception e) {
            // 记录异常信息
            long executionTime = System.currentTimeMillis() - startTime;
            operationLog.setExecutionTime(executionTime);
            
            if (!getAnnotation(joinPoint).ignoreException()) {
                operationLog.setOperationStatus(SysOperationLog.OperationStatus.FAILURE);
                operationLog.setErrorMessage(getExceptionMessage(e));
            } else {
                operationLog.setOperationStatus(SysOperationLog.OperationStatus.SUCCESS);
            }
            
            // 保存日志
            saveOperationLog(operationLog, getAnnotation(joinPoint).async());
            
            // 重新抛出异常
            throw e;
        }
    }

    /**
     * 异常通知：记录异常日志
     */
    @AfterThrowing(pointcut = "operationLogPointcut()", throwing = "e")
    public void afterThrowing(JoinPoint joinPoint, Exception e) {
        log.error("操作日志记录异常：{}", e.getMessage(), e);
    }

    /**
     * 获取HTTP请求
     */
    private HttpServletRequest getHttpServletRequest() {
        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            return attributes != null ? attributes.getRequest() : null;
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 获取方法参数
     */
    private String getMethodParams(JoinPoint joinPoint) {
        try {
            Object[] args = joinPoint.getArgs();
            if (args == null || args.length == 0) {
                return null;
            }
            
            StringBuilder params = new StringBuilder();
            for (int i = 0; i < args.length; i++) {
                if (i > 0) {
                    params.append(", ");
                }
                
                Object arg = args[i];
                if (arg == null) {
                    params.append("null");
                } else if (isSimpleType(arg.getClass())) {
                    params.append(arg.toString());
                } else {
                    // 复杂对象转JSON，但限制长度
                    String json = JsonUtils.toJsonString(arg);
                    if (json != null && json.length() > 1000) {
                        json = json.substring(0, 1000) + "...";
                    }
                    params.append(json);
                }
            }
            
            return params.toString();
        } catch (Exception e) {
            log.warn("获取方法参数失败：{}", e.getMessage());
            return "参数获取失败";
        }
    }

    /**
     * 判断是否为简单类型
     */
    private boolean isSimpleType(Class<?> clazz) {
        return clazz.isPrimitive() || 
               clazz == String.class ||
               clazz == Boolean.class ||
               clazz == Character.class ||
               Number.class.isAssignableFrom(clazz);
    }

    /**
     * 获取异常信息
     */
    private String getExceptionMessage(Exception e) {
        String message = e.getMessage();
        if (message != null && message.length() > 500) {
            message = message.substring(0, 500) + "...";
        }
        return message;
    }

    /**
     * 获取注解信息
     */
    private OperationLog getAnnotation(JoinPoint joinPoint) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        return method.getAnnotation(OperationLog.class);
    }

    /**
     * 保存操作日志
     */
    private void saveOperationLog(SysOperationLog operationLog, boolean async) {
        try {
            if (async) {
                operationLogService.saveOperationLogAsync(operationLog);
            } else {
                operationLogService.saveOperationLog(operationLog);
            }
        } catch (Exception e) {
            log.error("保存操作日志失败：{}", e.getMessage(), e);
        }
    }
}