package edu.pw.auth.adapters.in.web.dto;

public class AuthResponse {
    public String accessToken;
    public String refreshToken;
    public long expiresInMs;

    public AuthResponse(String accessToken, String refreshToken, long expiresInMs) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresInMs = expiresInMs;
    }
}