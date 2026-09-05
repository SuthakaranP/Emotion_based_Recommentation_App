package com.music.app;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.music.app.entity.Song;
import com.music.app.repository.SongRepository;
import java.util.List;

@SpringBootApplication
public class AppApplication {

	public static void main(String[] args) {
		SpringApplication.run(AppApplication.class, args);
	}

	@Bean
	public CommandLineRunner seedDatabase(SongRepository songRepository) {
		return args -> {
			if (songRepository.count() == 0) {
				System.out.println("Seeding default songs into database with language tags...");
				List<Song> songs = List.of(
					// ── Happy Songs ──────────────────────────────────────────────
					new Song(null, "Arabic Kuthu", "Anirudh Ravichander", "Happy", "Dance/Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
						"https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60",
						"Tamil", 280000L, "local", "local_happy_1"),
					new Song(null, "Vaathi Coming", "Anirudh Ravichander", "Happy", "Dance/Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
						"https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60",
						"Tamil", 210000L, "local", "local_happy_2"),
					new Song(null, "Butta Bomma", "Armaan Malik", "Happy", "Melody/Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
						"https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=300&auto=format&fit=crop&q=60",
						"Telugu", 248000L, "local", "local_happy_telugu_1"),
					new Song(null, "Chammak Challo", "Akon / Vishal-Shekhar", "Happy", "Dance/Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
						"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60",
						"Hindi", 226000L, "local", "local_happy_3"),
					new Song(null, "Happy", "Pharrell Williams", "Happy", "Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
						"https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60",
						"English", 233000L, "local", "local_happy_4"),

					// ── Sad Songs ────────────────────────────────────────────────
					new Song(null, "Kanave Kanave", "Anirudh Ravichander", "Sad", "Melody/Sad",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
						"https://images.unsplash.com/photo-1484755560695-a4c740285a15?w=300&auto=format&fit=crop&q=60",
						"Tamil", 290000L, "local", "local_sad_1"),
					new Song(null, "Life of Ram", "Pradeep Kumar", "Sad", "Melody/Indie",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
						"https://images.unsplash.com/photo-1446057032654-9d8885b76c2b?w=300&auto=format&fit=crop&q=60",
						"Tamil", 340000L, "local", "local_sad_2"),
					new Song(null, "Samajavaragamana", "Sid Sriram", "Sad", "Carnatic Fusion",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
						"https://images.unsplash.com/photo-1471478331149-c72f17e33c73?w=300&auto=format&fit=crop&q=60",
						"Telugu", 268000L, "local", "local_sad_telugu_1"),
					new Song(null, "Tum Hi Ho", "Arijit Singh", "Sad", "Bollywood/Melody",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3",
						"https://images.unsplash.com/photo-1446057032654-9d8885b76c2b?w=300&auto=format&fit=crop&q=60",
						"Hindi", 260000L, "local", "local_sad_3"),
					new Song(null, "The Night We Met", "Lord Huron", "Sad", "Indie Folk",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
						"https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60",
						"English", 208000L, "local", "local_sad_4"),

					// ── Relaxed Songs ────────────────────────────────────────────
					new Song(null, "Vellai Pookal", "A.R. Rahman", "Relaxed", "Classical/Melody",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
						"https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=60",
						"Tamil", 300000L, "local", "local_relaxed_1"),
					new Song(null, "Inkem Inkem Inkem Kaavaale", "Sid Sriram", "Relaxed", "Melody",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
						"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=60",
						"Telugu", 320000L, "local", "local_relaxed_telugu_1"),
					new Song(null, "Kabira", "Tochi Raina / Rekha Bhardwaj", "Relaxed", "Sufi/Melody",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
						"https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=60",
						"Hindi", 251000L, "local", "local_relaxed_2"),
					new Song(null, "Weightless", "Marconi Union", "Relaxed", "Ambient",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
						"https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300&auto=format&fit=crop&q=60",
						"English", 480000L, "local", "local_relaxed_3"),

					// ── Excited Songs ────────────────────────────────────────────
					new Song(null, "Dynamite", "BTS", "Excited", "Pop/K-Pop",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
						"https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60",
						"English", 200000L, "local", "local_excited_1"),
					new Song(null, "Naatu Naatu", "M.M. Keeravani", "Excited", "Folk/Dance",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
						"https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=300&auto=format&fit=crop&q=60",
						"Telugu", 270000L, "local", "local_excited_telugu_1"),

					// ── Angry Songs ──────────────────────────────────────────────
					new Song(null, "Rage of Rock", "Rock Crew", "Angry", "Rock",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
						"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=60",
						"English", 195000L, "local", "local_angry_1"),
					new Song(null, "Kondapalli Raja Theme", "S.A. Rajkumar", "Angry", "Action",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
						"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=60",
						"Telugu", 190000L, "local", "local_angry_telugu_1"),

					// ── Fear Songs ───────────────────────────────────────────────
					new Song(null, "Spooky Whispers", "Halloween Ambient", "Fear", "Soundtrack",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
						"https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&auto=format&fit=crop&q=60",
						"English", 240000L, "local", "local_fear_1"),

					// ── Neutral Songs ────────────────────────────────────────────
					new Song(null, "Coffee Shop Lo-Fi", "Lofi Generator", "Neutral", "Lo-Fi",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3",
						"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60",
						"English", 180000L, "local", "local_neutral_1"),
					new Song(null, "Nee Chupulatho", "Devi Sri Prasad", "Neutral", "Melody",
						"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3",
						"https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60",
						"Telugu", 210000L, "local", "local_neutral_telugu_1")
				);
				songRepository.saveAll(songs);
				System.out.println("Successfully seeded " + songs.size() + " songs with multi-language tags.");
			}
		};
	}
}
