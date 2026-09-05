package com.music.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.music.app.entity.Song;
import java.util.List;

@Repository
public interface SongRepository extends JpaRepository<Song, Integer> {
    List<Song> findByEmotion(String emotion);
    List<Song> findByGenre(String genre);
    List<Song> findByEmotionAndGenre(String emotion, String genre);
    List<Song> findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(String title, String artist);
    List<Song> findByLanguage(String language);
    List<Song> findByLanguageAndEmotion(String language, String emotion);
}
