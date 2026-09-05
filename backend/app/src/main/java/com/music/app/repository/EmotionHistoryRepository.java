package com.music.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.music.app.entity.EmotionHistory;
import java.util.List;

@Repository
public interface EmotionHistoryRepository extends JpaRepository<EmotionHistory, Integer> {
    List<EmotionHistory> findByUserIdOrderByDetectedAtDesc(Integer userId);
}
