-- Create publication_files table for uploaded images/videos
CREATE TABLE IF NOT EXISTS publication_files (
    id TEXT PRIMARY KEY,
    publication_id TEXT NOT NULL,
    type TEXT DEFAULT 'image',
    data TEXT DEFAULT '',
    filename TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (publication_id) REFERENCES publications(id)
);
CREATE INDEX IF NOT EXISTS idx_publication_files_pub_id ON publication_files(publication_id);
