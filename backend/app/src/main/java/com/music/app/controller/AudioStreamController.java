package com.music.app.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.*;

/**
 * Backend audio proxy — forwards audio bytes from external CDN URLs (e.g. JioSaavn CDN)
 * to the browser, completely bypassing any CORS restrictions the CDN may enforce.
 *
 * Frontend calls:  GET /api/audio/stream?url=<percent-encoded CDN URL>
 */
@RestController
@RequestMapping("/api/audio")
@CrossOrigin(origins = "*")
public class AudioStreamController {

    @GetMapping("/stream")
    public void streamAudio(@RequestParam String url, HttpServletResponse response) {
        try {
            String decodedUrl = URLDecoder.decode(url, "UTF-8");
            URL audioUrl = new URL(decodedUrl);
            HttpURLConnection conn = (HttpURLConnection) audioUrl.openConnection();
            conn.setRequestProperty("User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
                    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            conn.setRequestProperty("Accept", "audio/*,*/*;q=0.9");
            conn.setRequestProperty("Range", "bytes=0-");
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(45000);
            conn.connect();

            int status = conn.getResponseCode();
            // Follow redirects manually (HttpURLConnection doesn't always follow https→https)
            if (status == 301 || status == 302 || status == 303 || status == 307 || status == 308) {
                String redirectUrl = conn.getHeaderField("Location");
                if (redirectUrl != null) {
                    conn.disconnect();
                    conn = (HttpURLConnection) new URL(redirectUrl).openConnection();
                    conn.setRequestProperty("User-Agent",
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
                    conn.setConnectTimeout(8000);
                    conn.setReadTimeout(45000);
                    conn.connect();
                }
            }

            // Content type
            String contentType = conn.getContentType();
            if (contentType != null && (contentType.startsWith("audio/") || contentType.startsWith("video/"))) {
                response.setContentType(contentType);
            } else {
                // Detect by URL extension
                String lower = decodedUrl.toLowerCase();
                if (lower.contains(".m4a") || lower.contains("m4a")) {
                    response.setContentType("audio/mp4");
                } else if (lower.contains(".aac")) {
                    response.setContentType("audio/aac");
                } else {
                    response.setContentType("audio/mpeg");
                }
            }

            long contentLength = conn.getContentLengthLong();
            if (contentLength > 0) {
                response.setHeader("Content-Length", String.valueOf(contentLength));
            }

            response.setHeader("Accept-Ranges", "bytes");
            response.setHeader("Access-Control-Allow-Origin", "*");
            response.setHeader("Cache-Control", "no-cache");

            // Stream audio bytes to client
            try (InputStream is = conn.getInputStream();
                 OutputStream os = response.getOutputStream()) {
                byte[] buffer = new byte[16384];
                int bytesRead;
                while ((bytesRead = is.read(buffer)) != -1) {
                    os.write(buffer, 0, bytesRead);
                }
                os.flush();
            }
        } catch (IOException e) {
            if (!response.isCommitted()) {
                response.setStatus(HttpServletResponse.SC_BAD_GATEWAY);
            }
            System.err.println("[AudioProxy] Stream failed for url=" + url + " → " + e.getMessage());
        }
    }
}
