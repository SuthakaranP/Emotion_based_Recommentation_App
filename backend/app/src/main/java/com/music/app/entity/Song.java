package com.music.app.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "songs")
public class Song {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String artist;

    @Column(nullable = false)
    private String emotion; // Happy, Sad, Relaxed, Angry, Fear, Excited, Neutral

    @Column(nullable = false)
    private String genre;

    @Column(name = "song_url", nullable = false, length = 1024)
    private String songUrl;

    @Column(nullable = false, length = 1024)
    private String thumbnail;

    @Column(nullable = false)
    private String language = "English"; // English, Tamil, Hindi, etc.

    @Column(name = "duration_ms", nullable = false)
    private Long durationMs = 180000L; // 3 minutes default

    @Column(name = "provider_id", nullable = false)
    private String providerId = "local"; // local, jiosaavn, audius

    @Column(name = "provider_track_id", nullable = true)
    private String providerTrackId;

    public Song() {
    }

    public Song(Integer id, String title, String artist, String emotion, String genre, String songUrl, String thumbnail) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.emotion = emotion;
        this.genre = genre;
        this.songUrl = songUrl;
        this.thumbnail = thumbnail;
        this.language = "English";
        this.durationMs = 180000L;
        this.providerId = "local";
    }

    public Song(Integer id, String title, String artist, String emotion, String genre, String songUrl, String thumbnail, String language, Long durationMs, String providerId, String providerTrackId) {
        this.id = id;
        this.title = title;
        this.artist = artist;
        this.emotion = emotion;
        this.genre = genre;
        this.songUrl = songUrl;
        this.thumbnail = thumbnail;
        this.language = language;
        this.durationMs = durationMs;
        this.providerId = providerId;
        this.providerTrackId = providerTrackId;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getArtist() {
        return artist;
    }

    public void setArtist(String artist) {
        this.artist = artist;
    }

    public String getEmotion() {
        return emotion;
    }

    public void setEmotion(String emotion) {
        this.emotion = emotion;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getSongUrl() {
        return songUrl;
    }

    public void setSongUrl(String songUrl) {
        this.songUrl = songUrl;
    }

    public String getThumbnail() {
        return thumbnail;
    }

    public void setThumbnail(String thumbnail) {
        this.thumbnail = thumbnail;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public Long getDurationMs() {
        return durationMs;
    }

    public void setDurationMs(Long durationMs) {
        this.durationMs = durationMs;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }

    public String getProviderTrackId() {
        return providerTrackId;
    }

    public void setProviderTrackId(String providerTrackId) {
        this.providerTrackId = providerTrackId;
    }
}
