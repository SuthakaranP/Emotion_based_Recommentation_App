package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.music.app.entity.Favorite;
import com.music.app.entity.Song;
import com.music.app.entity.User;
import com.music.app.repository.FavoriteRepository;
import com.music.app.repository.SongRepository;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final SongRepository songRepository;

    @Autowired
    public FavoriteService(FavoriteRepository favoriteRepository, SongRepository songRepository) {
        this.favoriteRepository = favoriteRepository;
        this.songRepository = songRepository;
    }

    public List<Favorite> getUserFavorites(User user) {
        return favoriteRepository.findByUserId(user.getId());
    }

    public boolean toggleFavorite(User user, Integer songId) {
        Optional<Favorite> existing = favoriteRepository.findByUserIdAndSongId(user.getId(), songId);
        
        if (existing.isPresent()) {
            favoriteRepository.delete(existing.get());
            return false; // Removed
        } else {
            Song song = songRepository.findById(songId)
                    .orElseThrow(() -> new RuntimeException("Song not found"));
            
            Favorite favorite = new Favorite();
            favorite.setUser(user);
            favorite.setSong(song);
            favoriteRepository.save(favorite);
            return true; // Added
        }
    }

    public boolean isFavorite(User user, Integer songId) {
        return favoriteRepository.existsByUserIdAndSongId(user.getId(), songId);
    }
}
