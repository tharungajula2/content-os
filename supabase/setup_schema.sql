-- Create tables for Content OS

-- TABLE 1: videos
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    topic_code TEXT,
    format_type TEXT NOT NULL,
    status TEXT NOT NULL,
    priority TEXT NOT NULL,
    concept_summary TEXT,
    hook_idea TEXT,
    best_example TEXT,
    script_notes TEXT,
    script_final TEXT,
    verification_accuracy INT,
    verification_pedagogy INT,
    verification_notes TEXT,
    youtube_url TEXT,
    final_title TEXT,
    tags TEXT[],
    analytics_notes TEXT,
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    target_date DATE,
    published_at TIMESTAMPTZ,
    approved_by_1 BOOLEAN DEFAULT FALSE,
    approved_by_2 BOOLEAN DEFAULT FALSE
);

-- TABLE 2: video_comments
CREATE TABLE IF NOT EXISTS video_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    user_email TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 3: video_links
CREATE TABLE IF NOT EXISTS video_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    video_id UUID REFERENCES videos(id) ON DELETE CASCADE NOT NULL,
    url TEXT NOT NULL,
    description TEXT,
    added_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLE 4: gamification
CREATE TABLE IF NOT EXISTS gamification (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_email TEXT NOT NULL UNIQUE,
    xp_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    total_published INT DEFAULT 0,
    last_publish_date DATE
);

-- Enable Row Level Security (RLS)
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Full access for authenticated users on videos" ON videos
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users on video_comments" ON video_comments
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users on video_links" ON video_links
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Full access for authenticated users on gamification" ON gamification
    FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
