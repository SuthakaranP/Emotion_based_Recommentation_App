package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.music.app.entity.User;
import com.music.app.entity.Song;
import com.music.app.entity.ChatHistory;
import com.music.app.repository.ChatHistoryRepository;
import com.music.app.repository.SongRepository;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatService {

    private final GeminiService geminiService;
    private final EmotionService emotionService;
    private final SongRepository songRepository;
    private final ChatHistoryRepository chatHistoryRepository;

    @Autowired
    public ChatService(GeminiService geminiService, EmotionService emotionService,
                       SongRepository songRepository, ChatHistoryRepository chatHistoryRepository) {
        this.geminiService = geminiService;
        this.emotionService = emotionService;
        this.songRepository = songRepository;
        this.chatHistoryRepository = chatHistoryRepository;
    }

    public Map<String, Object> processChat(User user, String userMessage) {
        // 1. Detect emotion
        String emotion = emotionService.detectEmotion(user, userMessage);

        // 2. Fetch last 5 chat messages of this user for conversational context
        List<ChatHistory> fullHistory = chatHistoryRepository.findByUserIdOrderByTimestampAsc(user.getId());
        List<ChatHistory> recentHistory = fullHistory.size() > 5 
                ? fullHistory.subList(fullHistory.size() - 5, fullHistory.size())
                : fullHistory;

        StringBuilder context = new StringBuilder();
        for (ChatHistory h : recentHistory) {
            context.append("User: ").append(h.getUserInput()).append("\n");
            context.append("Assistant: ").append(h.getBotResponse()).append("\n");
        }

        // 3. Query Gemini or use rules-based fallback
        String botResponse;
        try {
            String prompt = "You are AuraBeat AI Assistant, a voice controller agent. " +
                    "The user is feeling: " + emotion + ". " +
                    "Conversation history context:\n" + context.toString() + "\n" +
                    "User input: \"" + userMessage + "\". " +
                    "Determine if they want to call any of these tools:\n" +
                    "- navigate (PARAM: dashboard, discover, trending, playlists, favorites, profile, admin)\n" +
                    "- play_song (PARAM: song title, artist, mood vibe, or language query, e.g., 'Arabic Kuthu', 'happy in Tamil', 'sad')\n" +
                    "- pause (PARAM: none)\n" +
                    "- skip_next (PARAM: none)\n" +
                    "- skip_previous (PARAM: none)\n" +
                    "- set_volume (PARAM: numeric level 0.0 to 1.0, or 'up', 'down')\n" +
                    "- search_songs (PARAM: query)\n" +
                    "- create_playlist (PARAM: name)\n" +
                    "- like_song (PARAM: none)\n" +
                    "- scan_emotion (PARAM: none)\n" +
                    "- get_stats (PARAM: none)\n\n" +
                    "Return your response in the EXACT format:\n" +
                    "[ACTION:action_name] [PARAM:parameter_val] your_friendly_conversational_voice_response\n" +
                    "If no action matches, use [ACTION:none] [PARAM:none] and just talk normally.\n" +
                    "Write at most 2 sentences of response text.";

            botResponse = geminiService.generate(prompt);
        } catch (Exception e) {
            botResponse = getFallbackChatResponse(emotion, userMessage);
        }

        // 4. Parse action and parameter
        String action = "none";
        String param = "none";

        if (botResponse.startsWith("[ACTION:")) {
            try {
                int actionEnd = botResponse.indexOf("]");
                if (actionEnd != -1) {
                    action = botResponse.substring(8, actionEnd);
                    
                    int paramStart = botResponse.indexOf("[PARAM:");
                    if (paramStart != -1) {
                        int paramEnd = botResponse.indexOf("]", paramStart);
                        if (paramEnd != -1) {
                            param = botResponse.substring(paramStart + 7, paramEnd);
                            botResponse = botResponse.substring(paramEnd + 1).trim();
                        }
                    } else {
                        botResponse = botResponse.substring(actionEnd + 1).trim();
                    }
                }
            } catch (Exception ex) {
                // Ignore parse errors
            }
        }

        // 5. Local keyword analyzer fallback (runs if Gemini fails or returns none)
        if ("none".equals(action)) {
            String lower = userMessage.toLowerCase();
            // Greeting with name detection — "Hi I am [name]" → welcome to dashboard
            if ((lower.contains("hi") || lower.contains("hello") || lower.contains("hey"))
                    && (lower.contains("i am") || lower.contains("i'm") || lower.contains("iam"))) {
                action = "navigate";
                param = "dashboard";
            } else if (lower.contains("dashboard") || lower.contains("home") || lower.contains("console")) {
                action = "navigate";
                param = "dashboard";
            } else if (lower.contains("discover")) {
                action = "navigate";
                param = "discover";
            } else if (lower.contains("trending")) {
                action = "navigate";
                param = "trending";
            } else if (lower.contains("playlist") || lower.contains("playlists")) {
                action = "navigate";
                param = "playlists";
            } else if (lower.contains("profile") || lower.contains("settings")) {
                action = "navigate";
                param = "profile";
            } else if (lower.contains("admin") || lower.contains("console")) {
                action = "navigate";
                param = "admin";
            } else if (lower.contains("play")) {
                action = "play_song";
                // Extract query from text (e.g. "play Arabic Kuthu" -> "Arabic Kuthu")
                int playIndex = lower.indexOf("play");
                if (playIndex != -1 && playIndex + 5 < lower.length()) {
                    param = userMessage.substring(playIndex + 5).trim();
                } else {
                    param = emotion;
                }
            } else if (lower.contains("pause") || lower.contains("stop")) {
                action = "pause";
            } else if (lower.contains("next") || lower.contains("skip")) {
                action = "skip_next";
            } else if (lower.contains("prev") || lower.contains("back")) {
                action = "skip_previous";
            } else if (lower.contains("volume up") || lower.contains("louder")) {
                action = "set_volume";
                param = "up";
            } else if (lower.contains("volume down") || lower.contains("quieter")) {
                action = "set_volume";
                param = "down";
            } else if (lower.contains("set volume to")) {
                action = "set_volume";
                param = lower.replace("set volume to", "").trim();
            } else if (lower.contains("like") || lower.contains("favorite")) {
                action = "like_song";
            } else if (lower.contains("scan") || lower.contains("mood") || lower.contains("webcam") || lower.contains("face")) {
                action = "scan_emotion";
            } else if (lower.contains("stats") || lower.contains("hours") || lower.contains("dominant")) {
                action = "get_stats";
            }
        }

        // 6. Query recommended songs from database matching this emotion
        List<Song> recommendedSongs = songRepository.findByEmotion(emotion);
        if (recommendedSongs.isEmpty()) {
            recommendedSongs = songRepository.findAll().stream().limit(3).toList();
        }

        // 7. Save Chat Log
        ChatHistory chatLog = new ChatHistory();
        chatLog.setUser(user);
        chatLog.setUserInput(userMessage);
        chatLog.setBotResponse(botResponse);
        chatLog.setSender("User");
        chatHistoryRepository.save(chatLog);

        // 8. Structure payload for response
        Map<String, Object> result = new HashMap<>();
        result.put("detectedEmotion", emotion);
        result.put("botResponse", botResponse);
        result.put("recommendedSongs", recommendedSongs);
        result.put("action", action);
        result.put("param", param);

        return result;
    }

    public List<ChatHistory> getHistory(User user) {
        return chatHistoryRepository.findByUserIdOrderByTimestampAsc(user.getId());
    }

    private String getFallbackChatResponse(String emotion, String userMessage) {
        String lower = userMessage.toLowerCase();
        // Greeting with name → welcome and navigate to dashboard
        if ((lower.contains("hi") || lower.contains("hello") || lower.contains("hey"))
                && (lower.contains("i am") || lower.contains("i'm") || lower.contains("iam"))) {
            // Extract spoken name (word after "i am" / "i'm")
            String[] tokens = lower.split("\\s+");
            String spokenName = "";
            for (int i = 0; i < tokens.length - 1; i++) {
                if (tokens[i].equals("am") || tokens[i].equals("i'm")) {
                    spokenName = tokens[i + 1].replaceAll("[^a-zA-Z]", "");
                    break;
                }
            }
            String displayName = spokenName.isEmpty() ? "there" : 
                Character.toUpperCase(spokenName.charAt(0)) + spokenName.substring(1);
            return "[ACTION:navigate] [PARAM:dashboard] Welcome back, " + displayName + "! Great to hear from you. Taking you to your dashboard now.";
        } else if (lower.contains("dashboard") || lower.contains("home")) {
            return "[ACTION:navigate] [PARAM:dashboard] Navigating to your main dashboard console.";
        } else if (lower.contains("profile") || lower.contains("settings")) {
            return "[ACTION:navigate] [PARAM:profile] Navigating to your account profile settings.";
        } else if (lower.contains("playlist")) {
            return "[ACTION:navigate] [PARAM:playlists] Opening your playlists library manager.";
        } else if (lower.contains("play")) {
            return "[ACTION:play_song] [PARAM:" + emotion + "] Playing some tunes to match your " + emotion + " vibe!";
        } else if (lower.contains("pause") || lower.contains("stop")) {
            return "[ACTION:pause] [PARAM:none] Pausing audio playback.";
        } else if (lower.contains("next") || lower.contains("skip")) {
            return "[ACTION:skip_next] [PARAM:none] Skipping to the next track.";
        } else if (lower.contains("prev") || lower.contains("back")) {
            return "[ACTION:skip_previous] [PARAM:none] Skipping back to the previous track.";
        } else if (lower.contains("volume up") || lower.contains("louder")) {
            return "[ACTION:set_volume] [PARAM:up] Adjusting volume level louder.";
        } else if (lower.contains("volume down") || lower.contains("quieter")) {
            return "[ACTION:set_volume] [PARAM:down] Adjusting volume level quieter.";
        } else if (lower.contains("like") || lower.contains("favorite")) {
            return "[ACTION:like_song] [PARAM:none] Adding the active track to your liked favorites catalog.";
        } else if (lower.contains("scan") || lower.contains("mood")) {
            return "[ACTION:scan_emotion] [PARAM:none] Opening your face recognition camera to scan expression emotions.";
        } else if (lower.contains("stats") || lower.contains("hours")) {
            return "[ACTION:get_stats] [PARAM:none] Here is a breakdown of your music session statistics.";
        }

        switch (emotion) {
            case "Happy":
                return "I'm glad to hear you are feeling happy! Let's play some upbeat songs to match your energy.";
            case "Sad":
                return "I hear you, and it's okay to feel down. I've got some comforting melodies that might help you feel better.";
            case "Relaxed":
                return "It sounds like you are feeling relaxed. Here are some calming tunes to accompany your peace of mind.";
            case "Excited":
                return "Awesome! You seem excited today. Let's play some energetic music to keep the momentum going!";
            case "Angry":
                return "It's natural to feel angry sometimes. Here are some songs to help you release that energy.";
            case "Fear":
                return "It's okay to feel anxious. Take a deep breath. Try listening to these relaxing melodies.";
            default:
                return "I hope you are having a pleasant day. How about some music to make it even better?";
        }
    }
}
