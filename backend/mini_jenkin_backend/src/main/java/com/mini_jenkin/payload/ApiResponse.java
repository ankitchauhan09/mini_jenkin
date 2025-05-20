package com.mini_jenkin.payload;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ApiResponse<T> {
    private Boolean success;
    private T data;
    private String message;

    public static <T> ApiResponse<T> success(T data, String message) {
        return new ApiResponse<T>(true, data, message);
    }

    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<T>(false, null, message);
    }

}
