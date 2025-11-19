package edu.pw.auth.adapters.in.web;

import edu.pw.auth.adapters.in.web.api.AuthApi;
import edu.pw.auth.adapters.in.web.dto.*;
import edu.pw.auth.adapters.in.web.mapper.UserMapper;
import edu.pw.auth.adapters.out.security.JwtService;
import edu.pw.auth.application.AuthUseCase;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;

@Controller("/api/v1/auth")
public class AuthController implements AuthApi {

    private final AuthUseCase authUseCase;
    private final JwtService jwtService;
    private final UserMapper userMapper;

    public AuthController(AuthUseCase authUseCase, JwtService jwtService, UserMapper userMapper) {
        this.authUseCase = authUseCase;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
    }

    @Override
    public HttpResponse<UserDto> register(RegisterRequest req) {
        try {
            var user = authUseCase.register(req.username(), req.password());
            var dto = userMapper.toDto(user);
            return HttpResponse.created(dto);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<AuthResponse> login(LoginRequest req) {
        try {
            var resp = authUseCase.login(req.username(), req.password());
            return HttpResponse.ok(resp);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Override
    public HttpResponse<AuthResponse> refresh(RefreshRequest req) {
        try {
            var resp = authUseCase.refresh(req.refreshToken());
            return HttpResponse.ok(resp);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Override
    public HttpResponse<String> changePassword(String authorization, ChangePasswordRequest req) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return HttpResponse.unauthorized();
        }
        String token = authorization.substring(7);
        var claimsOpt = jwtService.parseClaims(token);
        if (claimsOpt.isEmpty()) {
            return HttpResponse.unauthorized();
        }
        Long userId = Long.parseLong(claimsOpt.get()
                .getSubject());
        try {
            authUseCase.changePassword(userId, req.oldPassword(), req.newPassword());
            return HttpResponse.noContent();
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }
}
