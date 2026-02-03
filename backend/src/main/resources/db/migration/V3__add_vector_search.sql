-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to projects table (GigaChat Embeddings model produces 1024-dimensional vectors)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS embedding vector(1024);

-- Create an index for faster similarity search (optional, but recommended for production)
-- Using ivfflat for approximate nearest neighbor search
-- Note: For small datasets, you can skip the index and use exact search
-- CREATE INDEX IF NOT EXISTS projects_embedding_idx ON projects USING ivfflat (embedding vector_l2_ops) WITH (lists = 100);

-- For now, we'll use exact search without index as requested
COMMENT ON COLUMN projects.embedding IS 'Text embedding vector for semantic search (1024 dimensions from GigaChat)';
