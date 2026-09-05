package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.User;
import com.music.app.service.UserService;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userService.getUserByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Admin endpoint: List all users
    @GetMapping
    public ResponseEntity<?> getAllUsers(Principal principal) {
        try {
            // Retrieve users list
            Iterable<User> users = userService.getAllUsers();
            List<Map<String, Object>> response = new ArrayList<>();
            for (User u : users) {
                response.add(Map.of(
                    "id", u.getId(),
                    "name", u.getName(),
                    "email", u.getEmail(),
                    "createdAt", u.getCreatedAt()
                ));
            }
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Admin endpoint: Delete user by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUserById(@PathVariable Integer id, Principal principal) {
        try {
            userService.deleteAccount(id);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Integer id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            return ResponseEntity.ok(Map.of(
                    "id", user.getId(),
                    "name", user.getName(),
                    "email", user.getEmail(),
                    "createdAt", user.getCreatedAt()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/profile/update")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            String name = body.get("name");
            String email = body.get("email");
            
            if (name == null || email == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Name and email are required"));
            }
            
            User updated = userService.updateProfile(user.getId(), name, email);
            return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully!",
                "user", Map.of(
                    "id", updated.getId(),
                    "name", updated.getName(),
                    "email", updated.getEmail(),
                    "createdAt", updated.getCreatedAt()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/password/change")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            String oldPassword = body.get("oldPassword");
            String newPassword = body.get("newPassword");
            
            if (oldPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "Old password and new password are required"));
            }
            
            userService.changePassword(user.getId(), oldPassword, newPassword);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/profile/delete")
    public ResponseEntity<?> deleteAccount(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            userService.deleteAccount(user.getId());
            return ResponseEntity.ok(Map.of("message", "Account deleted successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
