package com.music.app.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.music.app.entity.Song;
import com.music.app.service.SongService;
import com.music.app.service.provider.CatalogService;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/songs")
@CrossOrigin(origins = "*")
public class SongController {

    private final SongService songService;
    private final CatalogService catalogService;

    @Autowired
    public SongController(SongService songService, CatalogService catalogService) {
        this.songService = songService;
        this.catalogService = catalogService;
    }

    @GetMapping
    public ResponseEntity<List<Song>> getSongs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String emotion,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String language) {
        
        // If a specific filter (query, language, or emotion) is requested, search using multi-provider Catalog
        if ((search != null && !search.trim().isEmpty()) || emotion != null) {
            return ResponseEntity.ok(catalogService.search(search, language, emotion));
        }
        
        // Language-only filter from the local DB (for Trending tab filters)
        if (language != null && !language.trim().isEmpty()) {
            return ResponseEntity.ok(songService.getSongsByLanguage(language));
        }
        
        if (genre != null) {
            return ResponseEntity.ok(songService.getSongsByGenre(genre));
        }
        
        // Return default catalog (useful for admin panels)
        return ResponseEntity.ok(songService.getAllSongs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Song> getSongById(@PathVariable Integer id) {
        return songService.getSongById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stream")
    public ResponseEntity<?> getSongStream(
            @RequestParam String providerId,
            @RequestParam String providerTrackId) {
        String url = catalogService.getStreamUrl(providerId, providerTrackId);
        if (url != null) {
            return ResponseEntity.ok(Map.of("streamUrl", url));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Resolve a real (non-soundhelix) streaming URL for a given song title+artist.
     * The frontend calls this when a song has a placeholder soundhelix URL so it
     * can get a live JioSaavn CDN URL just before playback.
     */
    @GetMapping("/resolve-stream")
    public ResponseEntity<?> resolveStream(
            @RequestParam String title,
            @RequestParam String artist,
            @RequestParam(required = false) String language) {
        try {
            String query = title + " " + artist;
            List<Song> results = catalogService.search(query, language, null);
            Optional<Song> realSong = results.stream()
                    .filter(s -> s.getSongUrl() != null && !s.getSongUrl().contains("soundhelix.com"))
                    .findFirst();
            if (realSong.isPresent()) {
                return ResponseEntity.ok(Map.of("streamUrl", realSong.get().getSongUrl()));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Stream resolve failed: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<Song> createSong(@RequestBody Song song) {
        Song created = songService.createSong(song);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSong(@PathVariable Integer id, @RequestBody Song song) {
        try {
            Song updated = songService.updateSong(id, song);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteSong(@PathVariable Integer id) {
        try {
            songService.deleteSong(id);
            return ResponseEntity.ok(Map.of("message", "Song deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
