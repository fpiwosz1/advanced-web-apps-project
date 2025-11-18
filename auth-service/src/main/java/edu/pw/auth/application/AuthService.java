package edu.pw.auth.application;

import edu.pw.auth.adapters.in.web.dto.*;
import edu.pw.auth.adapters.out.persistence.UserRepository;
import edu.pw.auth.adapters.out.security.JwtService;
import edu.pw.auth.adapters.out.security.PasswordService;
import edu.pw.auth.domain.model.UserEntity;
import jakarta.inject.Singleton;

@Singleton
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordService passwordService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordService = passwordService;
        this.jwtService = jwtService;
    }

    public UserEntity register(RegisterRequest req) {
        if (userRepository.findByUsername(req.username).isPresent()) {
            throw new IllegalArgumentException("UserEntity already exists");
        }
        String hash = passwordService.hash(req.password);
        UserEntity u = new UserEntity(req.username, hash);
        return userRepository.save(u);
    }

    public AuthResponse login(LoginRequest req) {
        UserEntity userEntity = userRepository.findByUsername(req.username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordService.verify(req.password, userEntity.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        String access = jwtService.generateAccessToken(userEntity.getId(), userEntity.getUsername());
        String refresh = jwtService.generateRefreshToken(userEntity.getId());
        return new AuthResponse(access, refresh, jwtService.getAccessTokenExpirationMs());
    }

    public AuthResponse refresh(String refreshToken) {
        var claimsOpt = jwtService.parseClaims(refreshToken);
        if (claimsOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        var claims = claimsOpt.get();
        Long userId = Long.parseLong(claims.getSubject());
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("UserEntity not found"));
        String newAccess = jwtService.generateAccessToken(userEntity.getId(), userEntity.getUsername());
        String newRefresh = jwtService.generateRefreshToken(userEntity.getId());
        return new AuthResponse(newAccess, newRefresh, jwtService.getAccessTokenExpirationMs());
    }

    public void changePassword(Long userId, ChangePasswordRequest req) {
        UserEntity userEntity = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("UserEntity not found"));
        if (!passwordService.verify(req.oldPassword, userEntity.getPasswordHash())) {
            throw new IllegalArgumentException("Old password does not match");
        }
        String newHash = passwordService.hash(req.newPassword);
        userEntity.setPasswordHash(newHash);
        userRepository.update(userEntity);
    }
}
