-- Function to increment manga views
CREATE OR REPLACE FUNCTION increment_manga_views(manga_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE manga
  SET views = views + 1
  WHERE id = manga_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment chapter views
CREATE OR REPLACE FUNCTION increment_chapter_views(chapter_id INT)
RETURNS VOID AS $$
BEGIN
  UPDATE chapters
  SET views = views + 1
  WHERE id = chapter_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get user library
CREATE OR REPLACE FUNCTION get_user_library(user_uuid UUID)
RETURNS TABLE (
  id INT,
  manga_id INT,
  title TEXT,
  cover TEXT,
  status TEXT,
  is_favorite BOOLEAN,
  progress INT,
  rating INT,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    um.id,
    m.id AS manga_id,
    m.title,
    m.cover,
    um.status::TEXT,
    um.is_favorite,
    um.progress,
    um.rating,
    um.updated_at
  FROM user_manga um
  JOIN manga m ON um.manga_id = m.id
  JOIN users u ON um.user_id = u.id
  WHERE u.uuid = user_uuid
  ORDER BY um.updated_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to get user reading history
CREATE OR REPLACE FUNCTION get_user_reading_history(user_uuid UUID, limit_count INT DEFAULT 10)
RETURNS TABLE (
  id INT,
  chapter_id INT,
  manga_id INT,
  manga_title TEXT,
  chapter_number TEXT,
  chapter_title TEXT,
  progress INT,
  is_completed BOOLEAN,
  last_read_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id,
    c.id AS chapter_id,
    m.id AS manga_id,
    m.title AS manga_title,
    c.number AS chapter_number,
    c.title AS chapter_title,
    ur.progress,
    ur.is_completed,
    ur.last_read_at
  FROM user_reads ur
  JOIN chapters c ON ur.chapter_id = c.id
  JOIN manga m ON c.manga_id = m.id
  JOIN users u ON ur.user_id = u.id
  WHERE u.uuid = user_uuid
  ORDER BY ur.last_read_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get popular manga
CREATE OR REPLACE FUNCTION get_popular_manga(limit_count INT DEFAULT 10)
RETURNS SETOF manga AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM manga
  ORDER BY views DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest updated manga
CREATE OR REPLACE FUNCTION get_latest_updated_manga(limit_count INT DEFAULT 10)
RETURNS TABLE (
  id INT,
  title TEXT,
  cover TEXT,
  updated_at TIMESTAMPTZ,
  latest_chapter TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.title,
    m.cover,
    m.updated_at,
    (
      SELECT c.number
      FROM chapters c
      WHERE c.manga_id = m.id
      ORDER BY c.upload_date DESC
      LIMIT 1
    ) AS latest_chapter
  FROM manga m
  ORDER BY m.updated_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

