package com.drmp.repository;

import com.drmp.entity.CaseDetail;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CaseDetailRepository extends JpaRepository<CaseDetail, Long> {
    // 可以根据需要添加自定义查询方法
}