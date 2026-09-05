package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.repository.*;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UserRepository userRepository;
    private final SongRepository songRepository;
    private final PlaylistRepository playlistRepository;
    private final EmotionHistoryRepository emotionHistoryRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    @Autowired
    public AdminController(UserRepository userRepository, SongRepository songRepository,
                           PlaylistRepository playlistRepository, EmotionHistoryRepository emotionHistoryRepository,
                           ChatHistoryRepository chatHistoryRepository) {
        this.userRepository = userRepository;
        this.songRepository = songRepository;
        this.playlistRepository = playlistRepository;
        this.emotionHistoryRepository = emotionHistoryRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    @GetMapping("/analytics")
    public ResponseEntity<?> getSystemAnalytics(Principal principal) {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", userRepository.count());
            stats.put("totalSongs", songRepository.count());
            stats.put("totalPlaylists", playlistRepository.count());
            stats.put("totalEmotionScans", emotionHistoryRepository.count());
            stats.put("totalChatLogs", chatHistoryRepository.count());
            
            // Get all emotion history records for trend details
            stats.put("emotionHistory", emotionHistoryRepository.findAll());
            // Get all chats
            stats.put("chatHistoryCount", chatHistoryRepository.count());

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
