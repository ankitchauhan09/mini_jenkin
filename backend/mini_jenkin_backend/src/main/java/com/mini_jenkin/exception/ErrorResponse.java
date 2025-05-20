package com.mini_jenkin.exception;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ErrorResponse {
    String message;
    String detail;
}
