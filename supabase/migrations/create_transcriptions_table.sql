-- Create schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS speechscribe;

-- Create transcriptions table
CREATE TABLE IF NOT EXISTS speechscribe.transcriptions (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL,
    text TEXT,
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT status_check CHECK (status IN ('processing', 'completed', 'error'))
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_transcriptions_user_id ON speechscribe.transcriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_transcriptions_created_at ON speechscribe.transcriptions(created_at DESC);

-- Set up Row Level Security (RLS)
ALTER TABLE speechscribe.transcriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own transcriptions"
    ON speechscribe.transcriptions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own transcriptions"
    ON speechscribe.transcriptions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transcriptions"
    ON speechscribe.transcriptions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transcriptions"
    ON speechscribe.transcriptions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Grant necessary privileges
GRANT USAGE ON SCHEMA speechscribe TO anon, authenticated;
GRANT ALL ON speechscribe.transcriptions TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA speechscribe TO anon, authenticated;
