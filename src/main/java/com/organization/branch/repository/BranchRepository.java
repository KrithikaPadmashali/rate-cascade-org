
package com.organization.branch.repository;

import com.organization.branch.model.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BranchRepository extends JpaRepository<Branch, Long> {
    List<Branch> findByParentId(Long parentId);
    
    @Query("SELECT b FROM Branch b WHERE b.parent.id = :branchId")
    List<Branch> findAllChildBranches(@Param("branchId") Long branchId);
}

