-- Initialization script for PostgreSQL
-- Runs automatically on first container start

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom enum types (if needed in future)
-- CREATE TYPE mood_value AS ENUM ('happy', 'sad', 'excited', 'calm', 'loving');

-- Grant permissions (Prisma handles schema creation)
-- This script ensures extensions and initial setup are ready

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'Nuestro Espacio database initialized successfully';
END $$;
