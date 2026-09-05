package com.music.app.service.provider;

import com.music.app.entity.Song;
import com.music.app.repository.SongRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class LocalProvider implements MusicProvider {

    private final SongRepository songRepository;

    @Autowired
    public LocalProvider(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    @Override
    public String getProviderId() {
        return "local";
    }

    @Override
    public List<Song> search(String query, String language, String mood) {
        if (query == null || query.trim().isEmpty()) {
            if (language != null && mood != null) {
                return songRepository.findByLanguageAndEmotion(language, mood);
            } else if (language != null) {
                return songRepository.findByLanguage(language);
            } else if (mood != null) {
                return songRepository.findByEmotion(mood);
            }
            return songRepository.findAll();
        }
        return songRepository.findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(query, query);
    }

    @Override
    public String getStreamUrl(String trackId) {
        try {
            return songRepository.findById(Integer.parseInt(trackId))
                    .map(Song::getSongUrl)
                    .orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
