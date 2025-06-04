package com.mini_jenkin.controller;

import com.mini_jenkin.dto.UserDto;
import com.mini_jenkin.entity.User;
import com.mini_jenkin.payload.ApiResponse;
import com.mini_jenkin.payload.LoginRequest;
import com.mini_jenkin.service.serviceInterface.AuthServiceInterface;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("/auth")
@RestController
@Slf4j
public class AuthController {

    @Autowired
    private AuthServiceInterface authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> registerUser(@RequestBody User user) {
        log.info("Registering user: {}", user);
        UserDto registeredUser = authService.registerUser(user);
        log.info("user", registeredUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(registeredUser, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Object>> loginUser(@RequestBody LoginRequest loginRequest) {
        Object loginResponse = authService.loginUser(loginRequest);
        return ResponseEntity.ok(ApiResponse.success(loginResponse, "Login successful"));
    }
}