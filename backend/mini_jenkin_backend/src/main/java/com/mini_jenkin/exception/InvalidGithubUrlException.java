package com.mini_jenkin.exception;

public class InvalidGithubUrlException extends RuntimeException {
    public InvalidGithubUrlException(String message, Exception e) {
        super(message);
    }
}
