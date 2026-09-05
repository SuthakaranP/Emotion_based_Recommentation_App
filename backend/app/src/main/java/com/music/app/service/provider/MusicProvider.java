package com.music.app.service.provider;

import com.music.app.entity.Song;
import java.util.List;

public interface MusicProvider {
    String getProviderId();
    List<Song> search(String query, String language, String mood);
    String getStreamUrl(String trackId);
}
