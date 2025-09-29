-- Admin users table only (for existing Supabase projects)
-- Run this if you already have the products table

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default admin user (password: admin123)
-- Note: In production, use a proper password hashing library
INSERT INTO admin_users (username, password_hash, email, full_name) 
VALUES ('admin', '$2b$10$rQZ8K9mN2pL3vX7yE1wBCO8vF5gH2jK6nM9pQ4rS7tU1vW3xY5zA8bC', 'admin@strawberrydips.com', 'Administrator')
ON CONFLICT (username) DO NOTHING;
