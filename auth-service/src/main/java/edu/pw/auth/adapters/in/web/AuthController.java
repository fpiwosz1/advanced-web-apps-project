package edu.pw.auth.adapters.in.web;

import edu.pw.auth.adapters.in.web.dto.ChangePasswordRequest;
import edu.pw.auth.adapters.in.web.dto.LoginRequest;
import edu.pw.auth.adapters.in.web.dto.RegisterRequest;
import edu.pw.auth.adapters.out.security.JwtService;
import edu.pw.auth.application.AuthService;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Header;
import io.micronaut.http.annotation.Post;

import java.util.Optional;

@Controller("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }
    @Post("/register")
    public HttpResponse<?> register(@Body RegisterRequest req) {
        try {
            var user = authService.register(req);
            return HttpResponse.created(user);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }

    @Post("/login")
    public HttpResponse<?> login(@Body LoginRequest req) {
        try {
            var resp = authService.login(req);
            return HttpResponse.ok(resp);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Post("/refresh")
    public HttpResponse<?> refresh(@Body String refreshToken) {
        try {
            var resp = authService.refresh(refreshToken);
            return HttpResponse.ok(resp);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Post("/change-password")
    public HttpResponse<?> changePassword(@Header("Authorization") Optional<String> authorization,
                                          @Body ChangePasswordRequest req) {
        if (authorization.isEmpty() || !authorization.get().startsWith("Bearer ")) {
            return HttpResponse.unauthorized();
        }
        String token = authorization.get().substring(7);
        var claimsOpt = jwtService.parseClaims(token);
        if (claimsOpt.isEmpty()) {
            return HttpResponse.unauthorized();
        }
        Long userId = Long.parseLong(claimsOpt.get().getSubject());
        try {
            authService.changePassword(userId, req);
            return HttpResponse.noContent();
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest(e.getMessage());
        }
    }
}
