package edu.pw.auth.adapters.in.web;

import static org.slf4j.LoggerFactory.getLogger;

import org.slf4j.Logger;

import edu.pw.auth.adapters.in.web.api.AuthApi;
import edu.pw.auth.adapters.in.web.dto.AuthResponse;
import edu.pw.auth.adapters.in.web.dto.ChangePasswordRequest;
import edu.pw.auth.adapters.in.web.dto.LoginRequest;
import edu.pw.auth.adapters.in.web.dto.RegisterRequest;
import edu.pw.auth.adapters.in.web.dto.UserDto;
import edu.pw.auth.adapters.in.web.mapper.UserMapper;
import edu.pw.auth.adapters.out.security.JwtService;
import edu.pw.auth.application.AuthUseCase;
import edu.pw.auth.config.AuthCookieProperties;
import edu.pw.auth.domain.model.UserEntity;
import io.micronaut.http.HttpRequest;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.cookie.Cookie;

@Controller("/api/v1/auth")
public class AuthController implements AuthApi {

    private final AuthUseCase authUseCase;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final AuthCookieProperties cookieProps;
    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

    private static final Logger log = getLogger(AuthController.class);

    public AuthController(AuthUseCase authUseCase,
            JwtService jwtService,
            UserMapper userMapper,
            AuthCookieProperties cookieProps) {
        this.authUseCase = authUseCase;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.cookieProps = cookieProps;
    }

    @Override
    public HttpResponse<UserDto> register(RegisterRequest req) {
        try {
            log.info("Registering user: {}", req.username());
            UserEntity user = authUseCase.register(req.username(), req.password());
            UserDto dto = userMapper.toDto(user);
            return HttpResponse.created(dto);
        } catch (IllegalArgumentException e) {
            return HttpResponse.badRequest();
        }
    }

    @Override
    public HttpResponse<AuthResponse> login(LoginRequest req) {
        try {
            log.info("Logging in user: {}", req.username());
            AuthResponse resp = authUseCase.login(req.username(), req.password());
            Cookie refreshCookie = getRefreshCookie(resp);
            return HttpResponse.ok(resp)
                    .cookie(refreshCookie);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Override
    public HttpResponse<AuthResponse> refresh(HttpRequest<?> request) {
        log.info("Refreshing token");
        Cookie cookie = request.getCookies()
                .get(REFRESH_TOKEN_COOKIE_NAME);
        if (cookie == null) {
            return HttpResponse.unauthorized();
        }
        try {
            AuthResponse resp = authUseCase.refresh(cookie.getValue());
            Cookie refreshCookie = getRefreshCookie(resp);
            return HttpResponse.ok(resp)
                    .cookie(refreshCookie);
        } catch (IllegalArgumentException e) {
            return HttpResponse.unauthorized();
        }
    }

    @Override
    public HttpResponse<String> changePassword(String authorization, ChangePasswordRequest req) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return HttpResponse.unauthorized();
        }
        log.info("Changing password");
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

    @Override
    public HttpResponse<Object> logout(HttpRequest<?> request) {
        log.info("Logging out");
        Cookie clear = Cookie.of(REFRESH_TOKEN_COOKIE_NAME, "")
                .httpOnly(true)
                .secure(cookieProps.isSecure())
                .sameSite(cookieProps.getSameSite())
                .path(cookieProps.getPath())
                .maxAge(0);
        if (cookieProps.getDomain() != null && !cookieProps.getDomain()
                .isBlank()) {
            clear = clear.domain(cookieProps.getDomain());
        }
        return HttpResponse.noContent()
                .cookie(clear);
    }

    private Cookie getRefreshCookie(AuthResponse response) {
        Cookie refreshCookie = Cookie.of(REFRESH_TOKEN_COOKIE_NAME, response.refreshToken())
                .httpOnly(true)
                .secure(cookieProps.isSecure())
                .sameSite(cookieProps.getSameSite())
                .path(cookieProps.getPath())
                .maxAge((int) (jwtService.getRefreshTokenExpirationMs() / 1000));
        if (cookieProps.getDomain() != null && !cookieProps.getDomain()
                .isBlank()) {
            refreshCookie = refreshCookie.domain(cookieProps.getDomain());
        }
        return refreshCookie;
    }
}
