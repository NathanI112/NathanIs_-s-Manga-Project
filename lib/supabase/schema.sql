-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE manga_status AS ENUM ('ongoing', 'completed', 'hiatus', 'cancelled');
CREATE TYPE reading_status AS ENUM ('reading', 'completed', 'on_hold', 'dropped', 'plan_to_read');
CREATE TYPE comment_status AS ENUM ('active', 'deleted', 'hidden');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  role user_role DEFAULT 'user' NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_banned BOOLEAN DEFAULT FALSE NOT NULL,
  ban_reason TEXT,
  preferences JSONB,
  favorite_genres TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create manga table
CREATE TABLE manga (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  title TEXT NOT NULL,
  alternative_titles TEXT[],
  description TEXT,
  author TEXT,
  artist TEXT,
  cover TEXT,
  banner TEXT,
  status manga_status DEFAULT 'ongoing' NOT NULL,
  release_year INTEGER,
  genres TEXT[],
  tags TEXT[],
  is_adult BOOLEAN DEFAULT FALSE NOT NULL,
  rating INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create chapters table
CREATE TABLE chapters (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  manga_id INTEGER NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  number TEXT NOT NULL,
  title TEXT,
  pages INTEGER DEFAULT 0,
  page_urls TEXT[],
  views INTEGER DEFAULT 0,
  upload_date TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_published BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create user_manga table (library)
CREATE TABLE user_manga (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id INTEGER NOT NULL REFERENCES manga(id) ON DELETE CASCADE,
  status reading_status DEFAULT 'plan_to_read' NOT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  rating INTEGER,
  progress INTEGER DEFAULT 0,
  start_date TIMESTAMP WITH TIME ZONE,
  finish_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, manga_id)
);

-- Create user_reads table
CREATE TABLE user_reads (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chapter_id INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  is_completed BOOLEAN DEFAULT FALSE,
  last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, chapter_id)
);

-- Create comments table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  uuid UUID DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  status comment_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create comment_likes table
CREATE TABLE comment_likes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, comment_id)
);

-- Create user_activities table
CREATE TABLE user_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  manga_id INTEGER REFERENCES manga(id) ON DELETE CASCADE,
  chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
  comment_id INTEGER REFERENCES comments(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_manga ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- Public access policies
CREATE POLICY "Public manga access" ON manga FOR SELECT USING (true);
CREATE POLICY "Public chapters access" ON chapters FOR SELECT USING (is_published = true);
CREATE POLICY "Public comments access" ON comments FOR SELECT USING (status = 'active');

-- User-specific policies
DROP POLICY IF EXISTS "Public users access" ON users;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;
DROP POLICY IF EXISTS "Auth service can create users" ON users;
DROP POLICY IF EXISTS "Anyone can insert users" ON users;

-- Allow authenticated users to read their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid()::text = uuid::text);

-- Allow authenticated users to update their own data
CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (auth.uid()::text = uuid::text);

-- Allow anyone to insert users (we'll control this at the application level)
CREATE POLICY "Anyone can insert users" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can read their library" ON user_manga FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can manage their library" ON user_manga FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users can read their reading history" ON user_reads FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can manage their reading history" ON user_reads FOR ALL USING (user_id = auth.uid()::text);

CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their comments" ON comments FOR UPDATE USING (user_id = auth.uid()::text);

CREATE POLICY "Users can manage their likes" ON comment_likes FOR ALL USING (user_id = auth.uid()::text);
CREATE POLICY "Users can view their activities" ON user_activities FOR SELECT USING (user_id = auth.uid()::text);

-- Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_manga_updated_at BEFORE UPDATE ON manga FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON chapters FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_manga_updated_at BEFORE UPDATE ON user_manga FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_user_reads_updated_at BEFORE UPDATE ON user_reads FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Sample data for testing
INSERT INTO manga (title, alternative_titles, description, author, genres, cover, status, views, rating) VALUES
('One Piece', ARRAY['ワンピース'], 'Follows the adventures of Monkey D. Luffy and his pirate crew.', 'Eiichiro Oda', ARRAY['Action', 'Adventure', 'Comedy', 'Fantasy'], '/placeholder.svg?height=400&width=300&text=One+Piece', 'ongoing', 1000000, 4.9),
('Naruto', ARRAY['ナルト'], 'The story of Naruto Uzumaki, a young ninja.', 'Masashi Kishimoto', ARRAY['Action', 'Adventure', 'Fantasy'], '/placeholder.svg?height=400&width=300&text=Naruto', 'completed', 900000, 4.7),
('Attack on Titan', ARRAY['進撃の巨人', 'Shingeki no Kyojin'], 'The story follows Eren Yeager, who vows to exterminate the Titans.', 'Hajime Isayama', ARRAY['Action', 'Drama', 'Fantasy', 'Horror'], '/placeholder.svg?height=400&width=300&text=Attack+on+Titan', 'completed', 850000, 4.8),
('My Hero Academia', ARRAY['僕のヒーローアカデミア', 'Boku no Hero Academia'], 'The story of a boy born without superpowers in a world where they are the norm.', 'Kohei Horikoshi', ARRAY['Action', 'Comedy', 'School', 'Shounen', 'Super Power'], '/placeholder.svg?height=400&width=300&text=My+Hero+Academia', 'ongoing', 750000, 4.6),
('Demon Slayer', ARRAY['鬼滅の刃', 'Kimetsu no Yaiba'], 'Tanjiro Kamado''s journey to cure his sister and avenge his family.', 'Koyoharu Gotouge', ARRAY['Action', 'Demons', 'Historical', 'Shounen', 'Supernatural'], '/placeholder.svg?height=400&width=300&text=Demon+Slayer', 'completed', 800000, 4.8);

-- Add chapters for each manga
INSERT INTO chapters (manga_id, number, title, pages, views) VALUES
(1, '1', 'Romance Dawn', 45, 500000),
(1, '2', 'They Call Him Luffy', 40, 450000),
(1, '1084', 'Egghead Incident', 50, 300000),
(2, '1', 'Uzumaki Naruto', 45, 400000),
(2, '2', 'Konohamaru!', 40, 350000),
(2, '700', 'Naruto Uzumaki', 50, 500000),
(3, '1', 'To You, 2000 Years From Now', 45, 350000),
(3, '2', 'That Day', 40, 300000),
(3, '139', 'Toward the Tree', 50, 400000),
(4, '1', 'Izuku Midoriya: Origin', 45, 300000),
(4, '2', 'What It Takes to Be a Hero', 40, 250000),
(4, '420', 'The Final Act', 50, 200000),
(5, '1', 'Cruelty', 45, 350000),
(5, '2', 'Human and Demon', 40, 300000),
(5, '205', 'Life Shining Across the Years', 50, 400000);

