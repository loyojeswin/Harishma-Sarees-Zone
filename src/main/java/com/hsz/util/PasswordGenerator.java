package com.hsz.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Generate hash for "user123"
        String userPassword = encoder.encode("user123");
        System.out.println("Hash for 'user123': " + userPassword);
        
        // Generate hash for "admin123"
        String adminPassword = encoder.encode("admin123");
        System.out.println("Hash for 'admin123': " + adminPassword);
        
        // Test the hashes
        System.out.println("user123 matches: " + encoder.matches("user123", userPassword));
        System.out.println("admin123 matches: " + encoder.matches("admin123", adminPassword));
    }
}
