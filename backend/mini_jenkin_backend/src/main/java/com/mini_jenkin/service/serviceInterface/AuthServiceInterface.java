package com.mini_jenkin.service.serviceInterface;

import com.mini_jenkin.dto.UserDto;
import com.mini_jenkin.entity.User;
import com.mini_jenkin.payload.AuthResponse;
import com.mini_jenkin.payload.LoginRequest;

public interface AuthServiceInterface {
    public UserDto registerUser(User user);
    public AuthResponse loginUser(LoginRequest loginRequest);
}
