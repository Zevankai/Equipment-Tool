-- Equipment Manager Database Schema
-- This script creates the necessary tables for the Owlbear Equipment Manager extension

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
    id SERIAL PRIMARY KEY,
    room_id VARCHAR(255) NOT NULL,
    character_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    equipment_data JSONB DEFAULT '{}' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique character per room
    UNIQUE(room_id, character_id)
);

-- Create index for faster room-based queries
CREATE INDEX IF NOT EXISTS idx_characters_room_id ON characters(room_id);

-- Create index for faster character lookup
CREATE INDEX IF NOT EXISTS idx_characters_room_character ON characters(room_id, character_id);

-- Create index for updated_at for sync operations
CREATE INDEX IF NOT EXISTS idx_characters_updated_at ON characters(updated_at);

-- Add trigger to automatically update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_characters_updated_at 
    BEFORE UPDATE ON characters 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();