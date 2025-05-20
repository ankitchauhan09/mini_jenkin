package com.mini_jenkin.payload;

import lombok.Data;

@Data
public class LoginRequest {
    private String email;
    private String password;
}
