package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.music.app.entity.Playlist;
import com.music.app.entity.Song;
import com.music.app.entity.User;
import com.music.app.repository.PlaylistRepository;
import com.music.app.repository.SongRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PlaylistService {

    private final PlaylistRepository playlistRepository;
    private final SongRepository songRepository;

    @Autowired
    public PlaylistService(PlaylistRepository playlistRepository, SongRepository songRepository) {
        this.playlistRepository = playlistRepository;
        this.songRepository = songRepository;
    }

    public List<Playlist> getUserPlaylists(User user) {
        return playlistRepository.findByUserId(user.getId());
    }

    public Optional<Playlist> getPlaylistById(Integer id) {
        return playlistRepository.findById(id);
    }

    public Playlist createPlaylist(User user, String name, String emotion, List<Integer> songIds) {
        Playlist playlist = new Playlist();
        playlist.setUser(user);
        playlist.setPlaylistName(name);
        playlist.setEmotion(emotion);

        List<Song> songs = new ArrayList<>();
        if (songIds != null && !songIds.isEmpty()) {
            songs = songRepository.findAllById(songIds);
        }
        playlist.setSongs(songs);

        return playlistRepository.save(playlist);
    }

    public Playlist addSongToPlaylist(Integer playlistId, Integer songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        if (!playlist.getSongs().contains(song)) {
            playlist.getSongs().add(song);
        }
        return playlistRepository.save(playlist);
    }

    public Playlist removeSongFromPlaylist(Integer playlistId, Integer songId) {
        Playlist playlist = playlistRepository.findById(playlistId)
                .orElseThrow(() -> new RuntimeException("Playlist not found"));
        Song song = songRepository.findById(songId)
                .orElseThrow(() -> new RuntimeException("Song not found"));

        playlist.getSongs().remove(song);
        return playlistRepository.save(playlist);
    }

    public void deletePlaylist(Integer playlistId) {
        playlistRepository.deleteById(playlistId);
    }
}
