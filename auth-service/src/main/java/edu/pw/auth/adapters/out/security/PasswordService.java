package edu.pw.auth.adapters.out.security;

import org.mindrot.jbcrypt.BCrypt;

import jakarta.inject.Singleton;

@Singleton
public class PasswordService {

    private static final int WORKLOAD = 12;

    public String hash(String plainPassword) {
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(WORKLOAD));
    }

    public boolean verify(String plainPassword, String hashed) {
        if (plainPassword == null || hashed == null)
            return false;
        return BCrypt.checkpw(plainPassword, hashed);
    }
}
