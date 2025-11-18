package edu.pw.auth.application;

import edu.pw.auth.adapters.in.web.dto.AuthResponse;
import edu.pw.auth.adapters.out.persistence.UserRepository;
import edu.pw.auth.adapters.out.security.JwtService;
import edu.pw.auth.adapters.out.security.PasswordService;
import edu.pw.auth.domain.model.UserEntity;
import jakarta.inject.Singleton;

@Singleton
public class AuthService implements AuthUseCase {

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

    @Override
    public UserEntity register(String username, String password) {
        userRepository.findByUsername(username)
                .ifPresent(u -> {
                    throw new IllegalArgumentException("User already exists");
                });
        String hash = passwordService.hash(password);
        UserEntity u = new UserEntity(username, hash);
        return userRepository.save(u);
    }

    @Override
    public AuthResponse login(String username, String password) {
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!passwordService.verify(password, user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String access = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String refresh = jwtService.generateRefreshToken(user.getId());
        return new AuthResponse(access, refresh, jwtService.getAccessTokenExpirationMs());
    }

    @Override
    public AuthResponse refresh(String refreshToken) {
        var claimsOpt = jwtService.parseClaims(refreshToken);
        if (claimsOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid refresh token");
        }
        Long userId = Long.parseLong(claimsOpt.get()
                .getSubject());
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String newAccess = jwtService.generateAccessToken(user.getId(), user.getUsername());
        String newRefresh = jwtService.generateRefreshToken(user.getId());
        return new AuthResponse(newAccess, newRefresh, jwtService.getAccessTokenExpirationMs());
    }

    @Override
    public void changePassword(Long userId, String oldPassword, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (!passwordService.verify(oldPassword, user.getPasswordHash())) {
            throw new IllegalArgumentException("Old password does not match");
        }
        user.setPasswordHash(passwordService.hash(newPassword));
        userRepository.update(user);
    }
}
