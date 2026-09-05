package com.music.app.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.music.app.entity.User;
import com.music.app.entity.EmotionHistory;
import com.music.app.repository.EmotionHistoryRepository;

import java.util.List;
import java.util.Locale;

@Service
public class EmotionService {

    private final GeminiService geminiService;
    private final EmotionHistoryRepository emotionHistoryRepository;

    @Autowired
    public EmotionService(GeminiService geminiService, EmotionHistoryRepository emotionHistoryRepository) {
        this.geminiService = geminiService;
        this.emotionHistoryRepository = emotionHistoryRepository;
    }

    public String detectEmotion(User user, String text) {
        String emotion = "Neutral";
        try {
            String prompt = "You are an emotion detector. Classify the user text into exactly one of these emotions: " +
                    "Happy, Sad, Angry, Fear, Excited, Relaxed, Neutral. " +
                    "Response must contain ONLY the emotion name (first letter capitalized, rest lowercase, no punctuation, no explanation). " +
                    "Input text: \"" + text + "\"";

            String result = geminiService.generate(prompt);
            
            // Clean up model response
            result = result.replaceAll("[^a-zA-Z]", "").trim();
            
            // Validate it is one of the valid emotions
            if (isValidEmotion(result)) {
                emotion = capitalize(result);
            } else {
                emotion = detectLocalFallback(text);
            }
        } catch (Exception e) {
            // Fall back to local rules-based keyword matching
            emotion = detectLocalFallback(text);
        }

        // Save history log
        EmotionHistory history = new EmotionHistory();
        history.setUser(user);
        history.setUserInput(text);
        history.setDetectedEmotion(emotion);
        emotionHistoryRepository.save(history);

        return emotion;
    }

    public List<EmotionHistory> getHistory(User user) {
        return emotionHistoryRepository.findByUserIdOrderByDetectedAtDesc(user.getId());
    }

    private boolean isValidEmotion(String val) {
        String lower = val.toLowerCase();
        return lower.equals("happy") || lower.equals("sad") || lower.equals("angry") ||
               lower.equals("fear") || lower.equals("excited") || lower.equals("relaxed") ||
               lower.equals("neutral");
    }

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }

    private String detectLocalFallback(String text) {
        String clean = text.toLowerCase(Locale.ROOT);
        if (clean.contains("happy") || clean.contains("joy") || clean.contains("glad") || 
            clean.contains("cheerful") || clean.contains("smile") || clean.contains("good") || 
            clean.contains("great") || clean.contains("awesome") || clean.contains("wonderful")) {
            return "Happy";
        }
        if (clean.contains("sad") || clean.contains("unhappy") || clean.contains("cry") || 
            clean.contains("lonely") || clean.contains("depressed") || clean.contains("sorrow") || 
            clean.contains("pain") || clean.contains("hurt") || clean.contains("grief") || clean.contains("stress")) {
            return "Sad";
        }
        if (clean.contains("relax") || clean.contains("calm") || clean.contains("peace") || 
            clean.contains("chill") || clean.contains("sleep") || clean.contains("soothe") || 
            clean.contains("rest") || clean.contains("quiet") || clean.contains("comfy")) {
            return "Relaxed";
        }
        if (clean.contains("excit") || clean.contains("thrill") || clean.contains("hype") || 
            clean.contains("cant wait") || clean.contains("amazing") || clean.contains("energetic")) {
            return "Excited";
        }
        if (clean.contains("angry") || clean.contains("mad") || clean.contains("furious") || 
            clean.contains("hate") || clean.contains("annoy") || clean.contains("rage") || 
            clean.contains("irritate") || clean.contains("pissed")) {
            return "Angry";
        }
        if (clean.contains("fear") || clean.contains("scared") || clean.contains("afraid") || 
            clean.contains("frighten") || clean.contains("terrified") || clean.contains("panic") || 
            clean.contains("spooky") || clean.contains("creepy")) {
            return "Fear";
        }
        return "Neutral";
    }
}
