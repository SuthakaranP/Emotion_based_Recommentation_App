package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.User;
import com.music.app.entity.Favorite;
import com.music.app.service.FavoriteService;
import com.music.app.service.UserService;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*")
public class FavoriteController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    @Autowired
    public FavoriteController(FavoriteService favoriteService, UserService userService) {
        this.favoriteService = favoriteService;
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
    public ResponseEntity<?> getFavorites(Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            List<Favorite> favorites = favoriteService.getUserFavorites(user);
            return ResponseEntity.ok(favorites);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> toggleFavorite(@RequestBody Map<String, Integer> body, Principal principal) {
        try {
            User user = getAuthenticatedUser(principal);
            Integer songId = body.get("songId");
            if (songId == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "songId is required"));
            }

            boolean isLiked = favoriteService.toggleFavorite(user, songId);
            return ResponseEntity.ok(Map.of(
                    "songId", songId,
                    "isFavorite", isLiked,
                    "message", isLiked ? "Added to favorites" : "Removed from favorites"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
