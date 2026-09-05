-- Seed Data for Emotion-Aware Music Generator
USE music_memory;

-- Seed Songs
INSERT INTO songs (title, artist, emotion, genre, song_url, thumbnail) VALUES
-- Happy Songs
('Arabic Kuthu', 'Anirudh Ravichander', 'Happy', 'Dance/Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=60'),
('Vaathi Coming', 'Anirudh Ravichander', 'Happy', 'Dance/Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&auto=format&fit=crop&q=60'),
('Happy', 'Pharrell Williams', 'Happy', 'Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=60'),

-- Sad Songs
('Kanave Kanave', 'Anirudh Ravichander', 'Sad', 'Melody/Sad', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3', 'https://images.unsplash.com/photo-1484755560695-a4c740285a15?w=300&auto=format&fit=crop&q=60'),
('Life of Ram', 'Pradeep Kumar', 'Sad', 'Melody/Indie', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'https://images.unsplash.com/photo-1446057032654-9d8885b76c2b?w=300&auto=format&fit=crop&q=60'),
('The Night We Met', 'Lord Huron', 'Sad', 'Indie Folk', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=300&auto=format&fit=crop&q=60'),

-- Relaxed Songs
('Vellai Pookal', 'A.R. Rahman', 'Relaxed', 'Classical/Melody', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=300&auto=format&fit=crop&q=60'),
('New York Nagaram', 'A.R. Rahman', 'Relaxed', 'Melody', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=300&auto=format&fit=crop&q=60'),
('Weightless', 'Marconi Union', 'Relaxed', 'Ambient', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=300&auto=format&fit=crop&q=60'),

-- Angry Songs
('Bad Boy', 'Heavy Metal Band', 'Angry', 'Metal/Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60'),
('Rage', 'Rock Crew', 'Angry', 'Rock', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&auto=format&fit=crop&q=60'),

-- Fear Songs
('Spooky Whispers', 'Halloween Ambient', 'Fear', 'Soundtrack', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=300&auto=format&fit=crop&q=60'),
('Shadows', 'Mystery FX', 'Fear', 'Ambient Horror', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 'https://images.unsplash.com/photo-1505672678657-cc7037095e60?w=300&auto=format&fit=crop&q=60'),

-- Excited Songs
('Dynamite', 'Excited Beat', 'Excited', 'Pop/K-Pop', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=300&auto=format&fit=crop&q=60'),
('Celebration', 'Funky Groove', 'Excited', 'Funk/Disco', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=300&auto=format&fit=crop&q=60'),

-- Neutral Songs
('Coffee Shop Lo-Fi', 'Lofi Generator', 'Neutral', 'Lo-Fi', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=300&auto=format&fit=crop&q=60'),
('Flow', 'Ambient Chill', 'Neutral', 'Chillout', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-17.mp3', 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&auto=format&fit=crop&q=60');
