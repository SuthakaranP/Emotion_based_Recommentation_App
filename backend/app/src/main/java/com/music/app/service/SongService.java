package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.music.app.entity.Song;
import com.music.app.repository.SongRepository;

import java.util.List;
import java.util.Optional;

@Service
public class SongService {

    private final SongRepository songRepository;

    @Autowired
    public SongService(SongRepository songRepository) {
        this.songRepository = songRepository;
    }

    public List<Song> getAllSongs() {
        return songRepository.findAll();
    }

    public Optional<Song> getSongById(Integer id) {
        return songRepository.findById(id);
    }

    public List<Song> getSongsByEmotion(String emotion) {
        return songRepository.findByEmotion(emotion);
    }

    public List<Song> getSongsByGenre(String genre) {
        return songRepository.findByGenre(genre);
    }

    public List<Song> getSongsByLanguage(String language) {
        return songRepository.findByLanguage(language);
    }

    public List<Song> getSongsByEmotionAndGenre(String emotion, String genre) {
        return songRepository.findByEmotionAndGenre(emotion, genre);
    }

    public List<Song> searchSongs(String query) {
        if (query == null || query.trim().isEmpty()) {
            return songRepository.findAll();
        }
        return songRepository.findByTitleContainingIgnoreCaseOrArtistContainingIgnoreCase(query, query);
    }

    public Song createSong(Song song) {
        return songRepository.save(song);
    }

    public Song updateSong(Integer id, Song updated) {
        Song song = songRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Song not found"));
        song.setTitle(updated.getTitle());
        song.setArtist(updated.getArtist());
        song.setEmotion(updated.getEmotion());
        song.setGenre(updated.getGenre());
        song.setSongUrl(updated.getSongUrl());
        song.setThumbnail(updated.getThumbnail());
        return songRepository.save(song);
    }

    public void deleteSong(Integer id) {
        if (!songRepository.existsById(id)) {
            throw new RuntimeException("Song not found");
        }
        songRepository.deleteById(id);
    }
}
