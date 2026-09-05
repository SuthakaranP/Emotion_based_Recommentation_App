package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.User;
import com.music.app.entity.EmotionHistory;
import com.music.app.service.EmotionService;
import com.music.app.service.UserService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emotion")
@CrossOrigin(origins = "*")
public class EmotionController {

    private final EmotionService emotionService;
    private final UserService userService;

    @Autowired
    public EmotionController(EmotionService emotionService, UserService userService) {
        this.emotionService = emotionService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userService.getUserByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @PostMapping
    public ResponseEntity<?> detectEmotion(@RequestBody Map<String, String> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            String text = body.get("text");
            if (text == null || text.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Text field is required"));
            }

            String emotion = emotionService.detectEmotion(user, text);
            return ResponseEntity.ok(Map.of("emotion", emotion));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getEmotionHistory(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            List<EmotionHistory> history = emotionService.getHistory(user);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
