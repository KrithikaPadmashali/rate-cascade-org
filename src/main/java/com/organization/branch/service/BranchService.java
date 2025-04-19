
package com.organization.branch.service;

import com.organization.branch.model.Branch;
import com.organization.branch.model.Account;
import com.organization.branch.repository.BranchRepository;
import com.organization.branch.repository.AccountRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class BranchService {
    private final BranchRepository branchRepository;
    private final AccountRepository accountRepository;

    public BranchService(BranchRepository branchRepository, AccountRepository accountRepository) {
        this.branchRepository = branchRepository;
        this.accountRepository = accountRepository;
    }

    public Branch getBranchById(Long id) {
        return branchRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Branch not found"));
    }

    public List<Branch> getChildBranches(Long branchId) {
        return branchRepository.findAllChildBranches(branchId);
    }

    @Transactional
    public Branch updateBranchRate(Long branchId, Double newRate) {
        Branch branch = getBranchById(branchId);
        updateRateCascading(branch, newRate);
        return branchRepository.save(branch);
    }

    private void updateRateCascading(Branch branch, Double newRate) {
        // Update current branch rate
        branch.setRate(newRate);

        // Update all accounts under this branch
        List<Account> accounts = accountRepository.findByBranchId(branch.getId());
        accounts.forEach(account -> account.setRate(newRate));
        accountRepository.saveAll(accounts);

        // Recursively update all child branches
        List<Branch> childBranches = branchRepository.findAllChildBranches(branch.getId());
        childBranches.forEach(childBranch -> updateRateCascading(childBranch, newRate));
    }
}
