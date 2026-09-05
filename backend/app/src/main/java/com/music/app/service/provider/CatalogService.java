package com.music.app.service.provider;

import com.music.app.entity.Song;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CatalogService {

    private final List<MusicProvider> providers;
    
    // In-memory caching: 5 minutes search, 1 hour stream url
    private final Map<String, CacheEntry<List<Song>>> searchCache = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry<String>> streamCache = new ConcurrentHashMap<>();

    private static final long SEARCH_TTL_MS = 5 * 60 * 1000;
    private static final long STREAM_TTL_MS = 60 * 60 * 1000;

    @Autowired
    public CatalogService(List<MusicProvider> providers) {
        this.providers = providers;
    }

    public List<Song> search(String query, String language, String mood) {
        String cacheKey = String.format("query:%s;lang:%s;mood:%s", 
                query != null ? query.toLowerCase().trim() : "", 
                language != null ? language.toLowerCase() : "", 
                mood != null ? mood.toLowerCase() : "");

        CacheEntry<List<Song>> cached = searchCache.get(cacheKey);
        if (cached != null && !cached.isExpired(SEARCH_TTL_MS)) {
            return cached.getValue();
        }

        List<Song> merged = new ArrayList<>();
        for (MusicProvider provider : providers) {
            try {
                // If it is local provider, query first.
                // If query is specifically for a language not supported by a provider, skip to avoid API overhead.
                if (provider.getProviderId().equals("jiosaavn") && "English".equalsIgnoreCase(language)) {
                    continue;
                }
                
                List<Song> results = provider.search(query, language, mood);
                if (results != null) {
                    merged.addAll(results);
                }
            } catch (Exception e) {
                System.err.println("Provider search failed: " + provider.getProviderId() + " -> " + e.getMessage());
            }
        }

        // Deduplicate songs by title + artist (case-insensitive)
        Set<String> uniqueKeys = new HashSet<>();
        List<Song> deduped = new ArrayList<>();
        for (Song s : merged) {
            String key = (s.getTitle() + " - " + s.getArtist()).toLowerCase();
            if (!uniqueKeys.contains(key)) {
                uniqueKeys.add(key);
                deduped.add(s);
            }
        }

        // Sort: local database songs first, then providers
        deduped.sort((s1, s2) -> {
            boolean s1Local = "local".equalsIgnoreCase(s1.getProviderId());
            boolean s2Local = "local".equalsIgnoreCase(s2.getProviderId());
            if (s1Local && !s2Local) return -1;
            if (!s1Local && s2Local) return 1;
            return 0;
        });

        searchCache.put(cacheKey, new CacheEntry<>(deduped));
        return deduped;
    }

    public String getStreamUrl(String providerId, String trackId) {
        String cacheKey = providerId + ":" + trackId;
        CacheEntry<String> cached = streamCache.get(cacheKey);
        if (cached != null && !cached.isExpired(STREAM_TTL_MS)) {
            return cached.getValue();
        }

        for (MusicProvider provider : providers) {
            if (provider.getProviderId().equalsIgnoreCase(providerId)) {
                try {
                    String url = provider.getStreamUrl(trackId);
                    if (url != null) {
                        streamCache.put(cacheKey, new CacheEntry<>(url));
                        return url;
                    }
                } catch (Exception e) {
                    System.err.println("Get stream failed: " + providerId + " -> " + e.getMessage());
                }
            }
        }
        return null;
    }

    private static class CacheEntry<T> {
        private final T value;
        private final long timestamp;

        public CacheEntry(T value) {
            this.value = value;
            this.timestamp = System.currentTimeMillis();
        }

        public T getValue() {
            return value;
        }

        public boolean isExpired(long ttlMs) {
            return System.currentTimeMillis() - timestamp > ttlMs;
        }
    }
}
