package edu.pw.auth.adapters.in.web.api;

import edu.pw.auth.adapters.in.web.dto.*;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Auth API")
public interface AuthApi {

    @Post(uri = "/register", produces = MediaType.APPLICATION_JSON, consumes = MediaType.APPLICATION_JSON)
    @Operation(summary = "Register user",
            responses = {@ApiResponse(responseCode = "201", description = "User created")})
    HttpResponse<UserDto> register(@Body RegisterRequest req);

    @Post(uri = "/login", produces = MediaType.APPLICATION_JSON, consumes = MediaType.APPLICATION_JSON)
    @Operation(summary = "Login",
            responses = {@ApiResponse(responseCode = "200", description = "Authenticated")})
    HttpResponse<AuthResponse> login(@Body LoginRequest req);

    @Post(uri = "/refresh", produces = MediaType.APPLICATION_JSON)
    @Operation(summary = "Refresh token via cookie",
            responses = {@ApiResponse(responseCode = "200", description = "Tokens refreshed")})
    HttpResponse<AuthResponse> refresh(HttpRequest<?> request);

    @Post(uri = "/change-password", produces = MediaType.APPLICATION_JSON, consumes = MediaType.APPLICATION_JSON)
    @Operation(summary = "Change password",
            responses = {@ApiResponse(responseCode = "204", description = "Password changed")})
    HttpResponse<String> changePassword(@Header("Authorization") String authorization,
            @Body ChangePasswordRequest req);

    @Post(uri = "/logout")
    @Operation(summary = "Logout (clear refresh cookie)",
            responses = {@ApiResponse(responseCode = "204", description = "Logged out")})
    HttpResponse<Object> logout(HttpRequest<?> request);
}
