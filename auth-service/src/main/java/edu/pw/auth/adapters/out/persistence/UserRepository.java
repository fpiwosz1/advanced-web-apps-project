package edu.pw.auth.adapters.out.persistence;

import java.util.Optional;

import edu.pw.auth.domain.model.UserEntity;
import io.micronaut.data.annotation.Repository;
import io.micronaut.data.repository.CrudRepository;

@Repository
public interface UserRepository extends CrudRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
}
