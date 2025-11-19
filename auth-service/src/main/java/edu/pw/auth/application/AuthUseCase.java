package edu.pw.auth.application;

import edu.pw.auth.adapters.in.web.dto.AuthResponse;
import edu.pw.auth.domain.model.UserEntity;

public interface AuthUseCase {

    UserEntity register(String username, String password);

    AuthResponse login(String username, String password);

    AuthResponse refresh(String refreshToken);

    void changePassword(Long userId, String oldPassword, String newPassword);
}
