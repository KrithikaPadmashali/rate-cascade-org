
package com.organization.branch.repository;

import com.organization.branch.model.Account;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByBranchId(Long branchId);
}
