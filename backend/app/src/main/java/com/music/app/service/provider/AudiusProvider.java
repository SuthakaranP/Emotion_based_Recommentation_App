package com.music.app.service.provider;

import com.music.app.entity.Song;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;

@Component
public class AudiusProvider implements MusicProvider {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Autowired
    public AudiusProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public String getProviderId() {
        return "audius";
    }

    @Override
    public List<Song> search(String query, String language, String mood) {
        List<Song> results = new ArrayList<>();
        
        // Skip Audius for South Asian / Bollywood languages — it has no content there.
        // Route those queries to JioSaavn (SaavnProvider) instead.
        if ("Tamil".equalsIgnoreCase(language) || "Hindi".equalsIgnoreCase(language) || "Telugu".equalsIgnoreCase(language)) {
            return results;
        }

        if (query == null || query.trim().isEmpty()) {
            query = mood != null ? mood + " mood chill" : "lofi chill";
        }

        try {
            String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
            String url = "https://api.audius.co/v1/tracks/search?query=" + encodedQuery + "&app_name=aurabeat";
            
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Accept", "application/json")
                    .GET()
                    .timeout(Duration.ofSeconds(5))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode data = root.path("data");
                if (data.isArray()) {
                    for (int i = 0; i < Math.min(data.size(), 10); i++) {
                        JsonNode track = data.get(i);
                        
                        Song song = new Song();
                        song.setTitle(track.path("title").asText("Unknown Title"));
                        song.setArtist(track.path("user").path("name").asText("Unknown Artist"));
                        song.setGenre(track.path("genre").asText("Indie"));
                        
                        String trackMood = mood != null ? mood : mapGenreToEmotion(song.getGenre());
                        song.setEmotion(trackMood);
                        song.setLanguage("English");
                        song.setDurationMs(track.path("duration").asLong(180) * 1000);
                        song.setProviderId("audius");
                        
                        String trackId = track.path("id").asText();
                        song.setProviderTrackId(trackId);
                        
                        song.setSongUrl("https://api.audius.co/v1/tracks/" + trackId + "/stream?app_name=aurabeat");
                        
                        String artUrl = track.path("artwork").path("150x150").asText();
                        if (artUrl.isEmpty()) {
                            artUrl = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60";
                        }
                        song.setThumbnail(artUrl);
                        
                        results.add(song);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Audius search failed: " + e.getMessage());
        }
        return results;
    }

    @Override
    public String getStreamUrl(String trackId) {
        return "https://api.audius.co/v1/tracks/" + trackId + "/stream?app_name=aurabeat";
    }

    private String mapGenreToEmotion(String genre) {
        if (genre == null) return "Neutral";
        String lower = genre.toLowerCase();
        if (lower.contains("ambient") || lower.contains("chill") || lower.contains("classical")) return "Relaxed";
        if (lower.contains("metal") || lower.contains("punk") || lower.contains("rock")) return "Angry";
        if (lower.contains("dance") || lower.contains("pop") || lower.contains("electronic")) return "Happy";
        if (lower.contains("acoustic") || lower.contains("folk")) return "Neutral";
        return "Happy";
    }
}
