package com.drmp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步任务配置
 *
 * @author DRMP Team
 */
@Configuration
@EnableAsync
public class AsyncConfig {
    
    /**
     * 异步任务执行器配置
     * 专门用于批量导入等CPU密集型任务
     */
    @Bean("asyncTaskExecutor")
    public Executor asyncTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 核心线程数
        executor.setCorePoolSize(4);
        
        // 最大线程数
        executor.setMaxPoolSize(8);
        
        // 队列容量
        executor.setQueueCapacity(500);
        
        // 线程名前缀
        executor.setThreadNamePrefix("AsyncTask-");
        
        // 线程空闲时间（秒）
        executor.setKeepAliveSeconds(60);
        
        // 拒绝策略：由调用者执行
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 等待任务完成后再关闭线程池
        executor.setWaitForTasksToCompleteOnShutdown(true);
        
        // 等待时间
        executor.setAwaitTerminationSeconds(60);
        
        executor.initialize();
        return executor;
    }
    
    /**
     * 文件处理执行器
     * 专门用于文件上传、下载等IO密集型任务
     */
    @Bean("fileProcessorExecutor")
    public Executor fileProcessorExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("FileProcessor-");
        executor.setKeepAliveSeconds(60);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(30);
        
        executor.initialize();
        return executor;
    }
    
    /**
     * 消息通知执行器
     * 用于发送邮件、短信等通知任务
     */
    @Bean("notificationExecutor")
    public Executor notificationExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("Notification-");
        executor.setKeepAliveSeconds(30);
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        executor.initialize();
        return executor;
    }
}