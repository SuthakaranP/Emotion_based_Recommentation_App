package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.music.app.entity.User;
import com.music.app.repository.UserRepository;
import com.music.app.config.JwtTokenProvider;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    // In-memory store for temporary forgot password tokens
    private final Map<String, String> resetTokens = new ConcurrentHashMap<>();

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    public User register(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email is already registered!");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Map<String, Object> login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        return generateLoginResponse(user);
    }

    // Google OAuth Register/Login
    public Map<String, Object> googleLogin(String name, String email, String avatarUrl) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        if (existingUser.isEmpty()) {
            // Register new Google OAuth User
            user = new User();
            user.setName(name);
            user.setEmail(email);
            // Use random secure password since they log in via Google
            user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
            user = userRepository.save(user);
            System.out.println("Registered new Google User: " + email);
        } else {
            user = existingUser.get();
        }

        return generateLoginResponse(user);
    }

    private Map<String, Object> generateLoginResponse(User user) {
        String token = tokenProvider.generateToken(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", user.getId());
        userDetails.put("name", user.getName());
        userDetails.put("email", user.getEmail());
        userDetails.put("createdAt", user.getCreatedAt());
        
        response.put("user", userDetails);
        return response;
    }

    public String forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No user found with email: " + email));

        String token = UUID.randomUUID().toString().substring(0, 8); // Simple 8-char token
        resetTokens.put(email, token);
        
        // Output token to console for local developer access
        System.out.println("=================================================");
        System.out.println("PASSWORD RESET REQUESTED FOR: " + email);
        System.out.println("RESET TOKEN: " + token);
        System.out.println("=================================================");
        
        return token;
    }

    public void resetPassword(String email, String token, String newPassword) {
        String storedToken = resetTokens.get(email);
        if (storedToken == null || !storedToken.equals(token)) {
            throw new RuntimeException("Invalid reset token!");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        resetTokens.remove(email); // Clean up token
    }

    public User updateProfile(Integer userId, String name, String email) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equals(email) && userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email is already taken by another account!");
        }

        user.setName(name);
        user.setEmail(email);
        return userRepository.save(user);
    }

    public void changePassword(Integer userId, String oldPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(oldPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password!");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public void deleteAccount(Integer userId) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found");
        }
        userRepository.deleteById(userId);
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<User> getUserById(Integer id) {
        return userRepository.findById(id);
    }
    
    public Iterable<User> getAllUsers() {
        return userRepository.findAll();
    }
}
