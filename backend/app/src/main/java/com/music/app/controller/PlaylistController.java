package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.Playlist;
import com.music.app.entity.User;
import com.music.app.service.PlaylistService;
import com.music.app.service.UserService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/playlists")
@CrossOrigin(origins = "*")
public class PlaylistController {

    private final PlaylistService playlistService;
    private final UserService userService;

    @Autowired
    public PlaylistController(PlaylistService playlistService, UserService userService) {
        this.playlistService = playlistService;
        this.userService = userService;
    }

    private User getAuthenticatedUser(Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }
        return userService.getUserByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public ResponseEntity<?> getPlaylists(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            List<Playlist> playlists = playlistService.getUserPlaylists(user);
            return ResponseEntity.ok(playlists);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlaylistById(@PathVariable Integer id) {
        return playlistService.getPlaylistById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createPlaylist(@RequestBody Map<String, Object> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            String name = (String) body.get("playlistName");
            String emotion = (String) body.get("emotion");
            @SuppressWarnings("unchecked")
            List<Integer> songIds = (List<Integer>) body.get("songIds");

            if (name == null || name.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Playlist name is required"));
            }

            Playlist created = playlistService.createPlaylist(user, name, emotion, songIds);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/songs")
    public ResponseEntity<?> addSongToPlaylist(@PathVariable Integer id, @RequestBody Map<String, Integer> body) {
        try {
            Integer songId = body.get("songId");
            if (songId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "songId is required"));
            }
            Playlist updated = playlistService.addSongToPlaylist(id, songId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/songs/{songId}")
    public ResponseEntity<?> removeSongFromPlaylist(@PathVariable Integer id, @PathVariable Integer songId) {
        try {
            Playlist updated = playlistService.removeSongFromPlaylist(id, songId);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlaylist(@PathVariable Integer id) {
        try {
            playlistService.deletePlaylist(id);
            return ResponseEntity.ok(Map.of("message", "Playlist deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
