package edu.pw.auth.adapters.in.web.mapper;

import edu.pw.auth.adapters.in.web.dto.UserDto;
import edu.pw.auth.domain.model.UserEntity;
import jakarta.inject.Singleton;

@Singleton
public class UserMapper {
    public UserDto toDto(UserEntity entity) {
        if (entity == null)
            return null;
        return new UserDto(entity.getId(), entity.getUsername());
    }
}
