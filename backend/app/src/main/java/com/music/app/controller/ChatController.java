package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.User;
import com.music.app.entity.ChatHistory;
import com.music.app.service.ChatService;
import com.music.app.service.UserService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    private final ChatService chatService;
    private final UserService userService;

    @Autowired
    public ChatController(ChatService chatService, UserService userService) {
        this.chatService = chatService;
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
    public ResponseEntity<?> sendChatMessage(@RequestBody Map<String, String> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            String message = body.get("message");
            if (message == null || message.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Message field is required"));
            }

            Map<String, Object> chatResult = chatService.processChat(user, message);
            return ResponseEntity.ok(chatResult);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            List<ChatHistory> history = chatService.getHistory(user);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
