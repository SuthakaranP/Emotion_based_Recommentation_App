package com.music.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_history")
public class EmotionHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "user_input", nullable = false, columnDefinition = "TEXT")
    private String userInput;

    @Column(name = "detected_emotion", nullable = false)
    private String detectedEmotion;

    @Column(name = "detected_at", nullable = false, updatable = false, columnDefinition = "DATETIME")
    private LocalDateTime detectedAt;

    @PrePersist
    protected void onCreate() {
        detectedAt = LocalDateTime.now();
    }

    public EmotionHistory() {
    }

    public EmotionHistory(Integer id, User user, String userInput, String detectedEmotion, LocalDateTime detectedAt) {
        this.id = id;
        this.user = user;
        this.userInput = userInput;
        this.detectedEmotion = detectedEmotion;
        this.detectedAt = detectedAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getUserInput() {
        return userInput;
    }

    public void setUserInput(String userInput) {
        this.userInput = userInput;
    }

    public String getDetectedEmotion() {
        return detectedEmotion;
    }

    public void setDetectedEmotion(String detectedEmotion) {
        this.detectedEmotion = detectedEmotion;
    }

    public LocalDateTime getDetectedAt() {
        return detectedAt;
    }

    public void setDetectedAt(LocalDateTime detectedAt) {
        this.detectedAt = detectedAt;
    }
}
