package com.drmp.service.impl;

import com.drmp.dto.request.WorkRecordCreateRequest;
import com.drmp.dto.request.WorkRecordUpdateRequest;
import com.drmp.dto.request.WorkRecordQueryRequest;
import com.drmp.dto.response.PageResponse;
import com.drmp.dto.response.WorkRecordResponse;
import com.drmp.entity.CaseDetail;
import com.drmp.entity.WorkRecord;
import com.drmp.exception.BusinessException;
import com.drmp.exception.ErrorCode;
import com.drmp.repository.CaseDetailRepository;
import com.drmp.repository.WorkRecordRepository;
import com.drmp.service.WorkRecordService;
import com.drmp.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 作业记录服务实现
 *
 * @author DRMP Team
 * @since 1.0.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class WorkRecordServiceImpl implements WorkRecordService {

    private final WorkRecordRepository workRecordRepository;
    private final CaseDetailRepository caseDetailRepository;

    @Override
    @Transactional
    public WorkRecordResponse createWorkRecord(WorkRecordCreateRequest request) {
        log.info("Creating work record for case: {}", request.getCaseId());

        // 验证案件是否存在
        CaseDetail caseDetail = caseDetailRepository.findById(request.getCaseId())
                .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND));

        // 创建作业记录
        WorkRecord workRecord = new WorkRecord();
        BeanUtils.copyProperties(request, workRecord);
        workRecord.setCaseDetail(caseDetail);
        workRecord.setHandlerId(SecurityUtils.getCurrentUserId());
        workRecord.setHandlerName(SecurityUtils.getCurrentUserName());

        WorkRecord saved = workRecordRepository.save(workRecord);
        
        log.info("Work record created successfully with id: {}", saved.getId());
        return convertToResponse(saved);
    }

    @Override
    @Transactional
    public WorkRecordResponse updateWorkRecord(Long id, WorkRecordUpdateRequest request) {
        log.info("Updating work record: {}", id);

        WorkRecord workRecord = workRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORK_RECORD_NOT_FOUND));

        // 检查权限
        if (!workRecord.getHandlerId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        // 更新字段
        if (request.getRecordType() != null) {
            workRecord.setRecordType(request.getRecordType());
        }
        if (request.getTitle() != null) {
            workRecord.setTitle(request.getTitle());
        }
        if (request.getContent() != null) {
            workRecord.setContent(request.getContent());
        }
        if (request.getContactDate() != null) {
            workRecord.setContactDate(request.getContactDate());
        }
        if (request.getContactMethod() != null) {
            workRecord.setContactMethod(request.getContactMethod());
        }
        if (request.getContactResult() != null) {
            workRecord.setContactResult(request.getContactResult());
        }
        if (request.getContactDuration() != null) {
            workRecord.setContactDuration(request.getContactDuration());
        }
        if (request.getDebtorResponse() != null) {
            workRecord.setDebtorResponse(request.getDebtorResponse());
        }
        if (request.getDebtorAttitude() != null) {
            workRecord.setDebtorAttitude(request.getDebtorAttitude());
        }
        if (request.getNextAction() != null) {
            workRecord.setNextAction(request.getNextAction());
        }
        if (request.getNextContactDate() != null) {
            workRecord.setNextContactDate(request.getNextContactDate());
        }
        if (request.getFollowUpRequired() != null) {
            workRecord.setFollowUpRequired(request.getFollowUpRequired());
        }
        if (request.getIsImportant() != null) {
            workRecord.setIsImportant(request.getIsImportant());
        }
        if (request.getTemplateId() != null) {
            workRecord.setTemplateId(request.getTemplateId());
        }
        if (request.getTemplateName() != null) {
            workRecord.setTemplateName(request.getTemplateName());
        }
        if (request.getAttachments() != null) {
            workRecord.setAttachments(request.getAttachments());
        }
        if (request.getTags() != null) {
            workRecord.setTags(request.getTags());
        }
        if (request.getWorkDuration() != null) {
            workRecord.setWorkDuration(request.getWorkDuration());
        }
        if (request.getLocation() != null) {
            workRecord.setLocation(request.getLocation());
        }
        if (request.getWeather() != null) {
            workRecord.setWeather(request.getWeather());
        }

        WorkRecord updated = workRecordRepository.save(workRecord);
        
        log.info("Work record updated successfully: {}", id);
        return convertToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteWorkRecord(Long id) {
        log.info("Deleting work record: {}", id);

        WorkRecord workRecord = workRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORK_RECORD_NOT_FOUND));

        // 检查权限
        if (!workRecord.getHandlerId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException(ErrorCode.ACCESS_DENIED);
        }

        workRecord.setDeleted(true);
        workRecordRepository.save(workRecord);
        
        log.info("Work record deleted successfully: {}", id);
    }

    @Override
    public WorkRecordResponse getWorkRecord(Long id) {
        log.info("Getting work record: {}", id);

        WorkRecord workRecord = workRecordRepository.findById(id)
                .orElseThrow(() -> new BusinessException(ErrorCode.WORK_RECORD_NOT_FOUND));

        return convertToResponse(workRecord);
    }

    @Override
    public PageResponse<WorkRecordResponse> queryWorkRecords(WorkRecordQueryRequest request, Pageable pageable) {
        log.info("Querying work records with request: {}", request);

        Specification<WorkRecord> spec = buildSpecification(request);
        Page<WorkRecord> page = workRecordRepository.findAll(spec, pageable);

        List<WorkRecordResponse> content = page.getContent().stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());

        return PageResponse.<WorkRecordResponse>builder()
                .content(content)
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .size(page.getSize())
                .page(page.getNumber())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Override
    public List<WorkRecordResponse> getCaseWorkRecords(Long caseId) {
        log.info("Getting work records for case: {}", caseId);

        List<WorkRecord> workRecords = workRecordRepository.findByCaseDetail_IdAndIsDeletedFalseOrderByCreatedAtDesc(caseId);
        
        return workRecords.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<WorkRecordResponse> getFollowUpRecords() {
        log.info("Getting follow up records for current user");

        Long currentUserId = SecurityUtils.getCurrentUserId();
        List<WorkRecord> workRecords = workRecordRepository.findFollowUpRecords(currentUserId, LocalDateTime.now());
        
        return workRecords.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<WorkRecordResponse> batchCreateWorkRecords(List<WorkRecordCreateRequest> requests) {
        log.info("Batch creating work records, count: {}", requests.size());

        List<WorkRecord> workRecords = new ArrayList<>();
        Long currentUserId = SecurityUtils.getCurrentUserId();
        String currentUserName = SecurityUtils.getCurrentUserName();

        for (WorkRecordCreateRequest request : requests) {
            // 验证案件是否存在
            CaseDetail caseDetail = caseDetailRepository.findById(request.getCaseId())
                    .orElseThrow(() -> new BusinessException(ErrorCode.CASE_NOT_FOUND, "案件不存在: " + request.getCaseId()));

            WorkRecord workRecord = new WorkRecord();
            BeanUtils.copyProperties(request, workRecord);
            workRecord.setCaseDetail(caseDetail);
            workRecord.setHandlerId(currentUserId);
            workRecord.setHandlerName(currentUserName);
            
            workRecords.add(workRecord);
        }

        List<WorkRecord> saved = workRecordRepository.saveAll(workRecords);
        
        log.info("Batch created work records successfully, count: {}", saved.size());
        return saved.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Object getWorkRecordStatistics(Long caseId, Long handlerId) {
        log.info("Getting work record statistics for case: {}, handler: {}", caseId, handlerId);

        // TODO: 实现统计逻辑
        return null;
    }

    private Specification<WorkRecord> buildSpecification(WorkRecordQueryRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 基本条件：未删除
            predicates.add(criteriaBuilder.isFalse(root.get("isDeleted")));

            if (request.getCaseId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("caseDetail").get("id"), request.getCaseId()));
            }

            if (request.getHandlerId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("handlerId"), request.getHandlerId()));
            }

            if (request.getRecordType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("recordType"), request.getRecordType()));
            }

            if (request.getContactMethod() != null) {
                predicates.add(criteriaBuilder.equal(root.get("contactMethod"), request.getContactMethod()));
            }

            if (request.getContactResult() != null) {
                predicates.add(criteriaBuilder.equal(root.get("contactResult"), request.getContactResult()));
            }

            if (request.getDebtorAttitude() != null) {
                predicates.add(criteriaBuilder.equal(root.get("debtorAttitude"), request.getDebtorAttitude()));
            }

            if (request.getFollowUpRequired() != null) {
                predicates.add(criteriaBuilder.equal(root.get("followUpRequired"), request.getFollowUpRequired()));
            }

            if (request.getIsImportant() != null) {
                predicates.add(criteriaBuilder.equal(root.get("isImportant"), request.getIsImportant()));
            }

            if (request.getStartDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("createdAt"), request.getStartDate()));
            }

            if (request.getEndDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("createdAt"), request.getEndDate()));
            }

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String keyword = "%" + request.getKeyword().trim() + "%";
                Predicate titlePredicate = criteriaBuilder.like(root.get("title"), keyword);
                Predicate contentPredicate = criteriaBuilder.like(root.get("content"), keyword);
                predicates.add(criteriaBuilder.or(titlePredicate, contentPredicate));
            }

            if (request.getTags() != null && !request.getTags().trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(root.get("tags"), "%" + request.getTags().trim() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    private WorkRecordResponse convertToResponse(WorkRecord workRecord) {
        WorkRecordResponse response = new WorkRecordResponse();
        BeanUtils.copyProperties(workRecord, response);
        
        if (workRecord.getCaseDetail() != null) {
            response.setCaseId(workRecord.getCaseDetail().getId());
        }
        
        // 设置枚举描述
        response.setRecordType(workRecord.getRecordType());
        response.setContactMethod(workRecord.getContactMethod());
        response.setContactResult(workRecord.getContactResult());
        response.setDebtorAttitude(workRecord.getDebtorAttitude());
        
        // 设置格式化时长
        response.setFormattedContactDuration(workRecord.getFormattedContactDuration());
        
        // 设置标签列表
        response.setTagList(workRecord.getTagList());
        
        // 设置是否需要跟进
        response.setNeedsFollowUp(workRecord.needsFollowUp());
        
        return response;
    }
}