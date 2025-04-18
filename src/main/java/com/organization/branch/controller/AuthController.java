
package com.organization.branch.controller;

import com.organization.branch.model.User;
import com.organization.branch.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        if (userService.validateCredentials(username, password)) {
            User user = userService.findByUsername(username);
            Map<String, Object> response = new HashMap<>();
            response.put("token", "mock-jwt-token"); // In a real app, generate a JWT token
            response.put("user", user);
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.badRequest().body("Invalid credentials");
    }
}

