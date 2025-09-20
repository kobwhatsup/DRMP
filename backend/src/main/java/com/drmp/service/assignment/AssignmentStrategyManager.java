package com.drmp.service.assignment;

import com.drmp.entity.CasePackage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 分案策略管理器
 * 管理和选择合适的分案策略
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Component
public class AssignmentStrategyManager {
    
    @Autowired
    private List<AssignmentStrategy> strategies;
    
    private Map<String, AssignmentStrategy> strategyMap;
    
    @PostConstruct
    public void init() {
        strategyMap = strategies.stream()
            .collect(Collectors.toMap(
                AssignmentStrategy::getStrategyName,
                strategy -> strategy,
                (existing, replacement) -> {
                    log.warn("Duplicate strategy name found: {}. Using the first one.", existing.getStrategyName());
                    return existing;
                }
            ));
            
        log.info("Initialized {} assignment strategies: {}", 
            strategies.size(), 
            strategies.stream().map(AssignmentStrategy::getStrategyName).collect(Collectors.toList()));
    }
    
    /**
     * 获取指定名称的策略
     */
    public AssignmentStrategy getStrategy(String strategyName) {
        AssignmentStrategy strategy = strategyMap.get(strategyName);
        if (strategy == null) {
            throw new IllegalArgumentException("Unknown assignment strategy: " + strategyName);
        }
        return strategy;
    }
    
    /**
     * 获取默认策略（优先级最高的策略）
     */
    public AssignmentStrategy getDefaultStrategy() {
        return strategies.stream()
            .min(Comparator.comparingInt(AssignmentStrategy::getPriority))
            .orElseThrow(() -> new IllegalStateException("No assignment strategy available"));
    }
    
    /**
     * 获取适合指定案件包的策略
     */
    public AssignmentStrategy getOptimalStrategy(CasePackage casePackage) {
        return strategies.stream()
            .filter(strategy -> strategy.supports(casePackage))
            .min(Comparator.comparingInt(AssignmentStrategy::getPriority))
            .orElse(getDefaultStrategy());
    }
    
    /**
     * 获取所有可用的策略
     */
    public List<AssignmentStrategy> getAllStrategies() {
        return new ArrayList<>(strategies);
    }
    
    /**
     * 获取支持指定案件包的所有策略
     */
    public List<AssignmentStrategy> getSupportedStrategies(CasePackage casePackage) {
        return strategies.stream()
            .filter(strategy -> strategy.supports(casePackage))
            .sorted(Comparator.comparingInt(AssignmentStrategy::getPriority))
            .collect(Collectors.toList());
    }
    
    /**
     * 获取策略信息列表
     */
    public List<StrategyInfo> getStrategyInfoList() {
        return strategies.stream()
            .map(strategy -> new StrategyInfo(
                strategy.getStrategyName(),
                strategy.getDescription(),
                strategy.getPriority(),
                strategy.getConfigurationParameters()
            ))
            .sorted(Comparator.comparingInt(StrategyInfo::getPriority))
            .collect(Collectors.toList());
    }
    
    /**
     * 策略信息
     */
    public static class StrategyInfo {
        private String name;
        private String description;
        private int priority;
        private Map<String, Object> parameters;
        
        public StrategyInfo(String name, String description, int priority, Map<String, Object> parameters) {
            this.name = name;
            this.description = description;
            this.priority = priority;
            this.parameters = parameters;
        }
        
        // Getters
        public String getName() { return name; }
        public String getDescription() { return description; }
        public int getPriority() { return priority; }
        public Map<String, Object> getParameters() { return parameters; }
    }
}