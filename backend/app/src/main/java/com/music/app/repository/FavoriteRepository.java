package com.music.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.music.app.entity.Favorite;
import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Integer> {
    List<Favorite> findByUserId(Integer userId);
    Optional<Favorite> findByUserIdAndSongId(Integer userId, Integer songId);
    boolean existsByUserIdAndSongId(Integer userId, Integer songId);
}
