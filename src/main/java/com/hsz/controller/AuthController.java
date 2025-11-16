package com.hsz.controller;

import com.hsz.config.JwtUtils;
import com.hsz.config.UserPrincipal;
import com.hsz.dto.JwtResponse;
import com.hsz.dto.LoginRequest;
import com.hsz.dto.MessageResponse;
import com.hsz.dto.SignupRequest;
import com.hsz.model.User;
import com.hsz.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {

        Authentication authentication = authenticationManager
                .authenticate(new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(), 
                        loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        return ResponseEntity.ok(new JwtResponse(jwt,
                userDetails.getId(),
                userDetails.getName(),
                userDetails.getEmail(),
                roles));
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already taken!"));
        }

        // Create new user's account
        User user = new User(signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        user.setAddress(signUpRequest.getAddress());
        user.setPhone(signUpRequest.getPhone());
        user.setRole(User.Role.USER);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
    }

    @PostMapping("/admin/signup")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(new MessageResponse("Error: Email is already taken!"));
        }

        // Create new admin account
        User user = new User(signUpRequest.getName(),
                signUpRequest.getEmail(),
                encoder.encode(signUpRequest.getPassword()));

        user.setAddress(signUpRequest.getAddress());
        user.setPhone(signUpRequest.getPhone());
        user.setRole(User.Role.ADMIN);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Admin registered successfully!"));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Return user info without sensitive data
        return ResponseEntity.ok(new JwtResponse(null, // Don't return token
                user.getId(),
                user.getName(),
                user.getEmail(),
                List.of("ROLE_" + user.getRole().name())));
    }

    @PostMapping("/promote-to-admin")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> promoteToAdmin(Authentication authentication) {
        UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(userPrincipal.getId()).orElse(null);
        
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        
        // Promote user to admin
        user.setRole(User.Role.ADMIN);
        userRepository.save(user);
        
        return ResponseEntity.ok(new MessageResponse("User promoted to admin successfully!"));
    }

    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        // Check if test user already exists
        if (userRepository.existsByEmail("test@example.com")) {
            return ResponseEntity.ok(new MessageResponse("Test user already exists!"));
        }

        // Create test user
        User user = new User("Test User", "test@example.com", encoder.encode("password123"));
        user.setAddress("Test Address");
        user.setPhone("1234567890");
        user.setRole(User.Role.USER);

        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Test user created successfully! Email: test@example.com, Password: password123"));
    }
}
