package com.drmp.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 案件导入请求
 * 
 * @author DRMP Team
 * @since 1.0.0
 */
@Data
public class CaseImportRequest {

    /**
     * 上传的文件
     */
    @NotNull(message = "上传文件不能为空")
    private MultipartFile file;

    /**
     * 案件包名称
     */
    @NotBlank(message = "案件包名称不能为空")
    private String packageName;

    /**
     * 案件包描述
     */
    private String packageDescription;

    /**
     * 分案策略
     */
    private String assignmentStrategy;

    /**
     * 是否自动分案
     */
    private Boolean autoAssignment = false;

    /**
     * 期望回款率
     */
    private Double expectedRecoveryRate;

    /**
     * 最大处置周期(天)
     */
    private Integer maxDisposalPeriod;

    /**
     * 偏好处置方式
     */
    private String preferredDisposalMethods;

    /**
     * 委托开始日期
     */
    private String entrustStartDate;

    /**
     * 委托结束日期
     */
    private String entrustEndDate;

    /**
     * 是否跳过重复数据
     */
    private Boolean skipDuplicates = true;

    /**
     * 是否验证数据完整性
     */
    private Boolean validateData = true;

    /**
     * 批量大小（每批处理的记录数）
     */
    private Integer batchSize = 1000;
}