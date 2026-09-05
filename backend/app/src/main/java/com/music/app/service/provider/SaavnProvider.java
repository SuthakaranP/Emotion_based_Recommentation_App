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
public class SaavnProvider implements MusicProvider {

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Autowired
    public SaavnProvider(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public String getProviderId() {
        return "jiosaavn";
    }

    /**
     * Build a sensible default search query when the caller provides only
     * a mood/language but no explicit search string.  Without this, JioSaavn
     * returned empty results for every emotion-vibe click on the Dashboard.
     */
    private String buildDefaultQuery(String language, String mood) {
        String lang = (language != null && !language.isBlank()) ? language.toLowerCase() : "";
        String moodLower = (mood != null && !mood.isBlank()) ? mood.toLowerCase() : "popular";

        if ("tamil".equals(lang))   return moodLower + " tamil songs";
        if ("telugu".equals(lang))  return moodLower + " telugu songs";
        if ("hindi".equals(lang))   return moodLower + " hindi songs";
        // For unknown / English language, still query JioSaavn with the mood
        return moodLower + " songs";
    }

    @Override
    public List<Song> search(String query, String language, String mood) {
        List<Song> results = new ArrayList<>();

        // If no query is given, derive one from language + mood so the JioSaavn
        // catalog is always queried for emotion-vibe clicks on the Dashboard.
        String effectiveQuery = (query == null || query.trim().isEmpty())
                ? buildDefaultQuery(language, mood)
                : query.trim();

        try {
            String encodedQuery = URLEncoder.encode(effectiveQuery, StandardCharsets.UTF_8);
            String url = "https://saavn.dev/api/search/songs?query=" + encodedQuery;

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
                JsonNode songs = data.path("results");
                if (songs.isArray()) {
                    for (int i = 0; i < Math.min(songs.size(), 10); i++) {
                        JsonNode track = songs.get(i);

                        Song song = new Song();
                        song.setTitle(track.path("name").asText("Unknown Title"));

                        String artistName = "JioSaavn Artist";
                        JsonNode artists = track.path("artists").path("primary");
                        if (artists.isArray() && artists.size() > 0) {
                            artistName = artists.get(0).path("name").asText("Unknown Artist");
                        }
                        song.setArtist(artistName);
                        song.setGenre("Bollywood");
                        song.setEmotion(mood != null ? mood : "Happy");

                        // Map JioSaavn language codes to our standard names.
                        // "telugu" was previously falling through to "English" — fixed.
                        String trackLang = track.path("language").asText("hindi").toLowerCase();
                        switch (trackLang) {
                            case "tamil"   -> song.setLanguage("Tamil");
                            case "telugu"  -> song.setLanguage("Telugu");
                            case "hindi"   -> song.setLanguage("Hindi");
                            case "english" -> song.setLanguage("English");
                            default        -> song.setLanguage("Hindi"); // Saavn default
                        }

                        // If the caller explicitly requested a language, honour it
                        // (overrides whatever the track metadata says).
                        if (language != null && !language.isBlank()) {
                            song.setLanguage(language);
                        }

                        song.setDurationMs(track.path("duration").asLong(200) * 1000);
                        song.setProviderId("jiosaavn");

                        String trackId = track.path("id").asText();
                        song.setProviderTrackId(trackId);

                        // downloadUrl array — use the highest quality entry (last element).
                        // This is the full-length stream URL, NOT a 30-second preview.
                        String streamUrl = null;
                        JsonNode dlUrls = track.path("downloadUrl");
                        if (dlUrls.isArray() && dlUrls.size() > 0) {
                            streamUrl = dlUrls.get(dlUrls.size() - 1).path("url").asText();
                        }
                        if (streamUrl == null || streamUrl.isEmpty()) {
                            streamUrl = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
                        }
                        song.setSongUrl(streamUrl);

                        String artwork = null;
                        JsonNode images = track.path("image");
                        if (images.isArray() && images.size() > 0) {
                            artwork = images.get(images.size() - 1).path("url").asText();
                        }
                        if (artwork == null || artwork.isEmpty()) {
                            artwork = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60";
                        }
                        song.setThumbnail(artwork);

                        results.add(song);
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("JioSaavn search failed: " + e.getMessage());
        }

        // Provide mock fallback songs if JioSaavn API is offline or returned nothing
        if (results.isEmpty()) {
            results = getMockSaavnResults(effectiveQuery, language, mood);
        }

        return results;
    }

    @Override
    public String getStreamUrl(String trackId) {
        try {
            String url = "https://saavn.dev/api/songs?id=" + trackId;
            HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().timeout(Duration.ofSeconds(4)).build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode dlUrls = root.path("data").get(0).path("downloadUrl");
                if (dlUrls.isArray() && dlUrls.size() > 0) {
                    return dlUrls.get(dlUrls.size() - 1).path("url").asText();
                }
            }
        } catch (Exception e) {
            System.err.println("JioSaavn getStreamUrl failed: " + e.getMessage());
        }
        return "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
    }

    /**
     * Offline fallback — returned when JioSaavn API is unreachable.
     * Covers Tamil, Telugu, and Hindi with SoundHelix placeholder audio so
     * the UI never shows an empty state even without internet.
     */
    private List<Song> getMockSaavnResults(String query, String language, String mood) {
        List<Song> mockList = new ArrayList<>();
        String langStr = language != null ? language : "Tamil";
        String moodStr = mood != null ? mood : "Happy";

        switch (langStr) {
            case "Tamil" -> {
                mockList.add(new Song(null, "Naa Ready (JioSaavn Vibe)", "Anirudh Ravichander", moodStr, "Dance",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
                        "Tamil", 240000L, "jiosaavn", "mock_tamil_1"));
                mockList.add(new Song(null, "Kadhilikka Neramillai (Acoustic)", "Pradeep Kumar", moodStr, "Melody",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
                        "Tamil", 290000L, "jiosaavn", "mock_tamil_2"));
            }
            case "Telugu" -> {
                mockList.add(new Song(null, "Buttabomma (Telugu Acoustic)", "Armaan Malik", moodStr, "Melody",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
                        "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300&auto=format&fit=crop&q=60",
                        "Telugu", 248000L, "jiosaavn", "mock_telugu_1"));
                mockList.add(new Song(null, "Samajavaragamana (Classic)", "Sid Sriram", moodStr, "Carnatic Fusion",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
                        "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&auto=format&fit=crop&q=60",
                        "Telugu", 268000L, "jiosaavn", "mock_telugu_2"));
                mockList.add(new Song(null, "Inkem Inkem Inkem Kaavaale", "Sid Sriram", moodStr, "Melody",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60",
                        "Telugu", 320000L, "jiosaavn", "mock_telugu_3"));
            }
            default -> {
                mockList.add(new Song(null, "Kesariya (Hindi Acoustic)", "Arijit Singh", moodStr, "Love",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
                        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
                        "Hindi", 252000L, "jiosaavn", "mock_hindi_1"));
                mockList.add(new Song(null, "Chaleya (Bollywood Lo-Fi)", "Anirudh & Arijit", moodStr, "Romantic",
                        "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
                        "https://images.unsplash.com/photo-1484755560695-a4c740285a15?w=300&auto=format&fit=crop&q=60",
                        "Hindi", 200000L, "jiosaavn", "mock_hindi_2"));
            }
        }
        return mockList;
    }
}
