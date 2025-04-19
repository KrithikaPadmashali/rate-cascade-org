
package com.organization.branch.controller;

import com.organization.branch.model.Branch;
import com.organization.branch.service.BranchService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
public class BranchController {
    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getBranchDetails(@PathVariable Long id) {
        Branch branch = branchService.getBranchById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("branch", branch);
        response.put("children", branchService.getChildBranches(id));
        response.put("accounts", branch.getAccounts());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/rate")
    public ResponseEntity<Branch> updateBranchRate(
            @PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        Double newRate = request.get("rate");
        Branch updatedBranch = branchService.updateBranchRate(id, newRate);
        return ResponseEntity.ok(updatedBranch);
    }
}
