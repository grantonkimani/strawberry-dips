-- Store Settings Schema
-- This table stores all store configuration settings

CREATE TABLE IF NOT EXISTS store_settings (
  id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
  
  -- Store Information
  store_name VARCHAR(255) NOT NULL DEFAULT 'Strawberry Dips',
  store_email VARCHAR(255) NOT NULL DEFAULT 'info@strawberrydips.com',
  store_phone VARCHAR(20) DEFAULT '+254 700 000 000',
  store_address TEXT DEFAULT 'Nairobi, Kenya',
  store_description TEXT DEFAULT 'Premium strawberry dips and desserts',
  store_logo VARCHAR(500) DEFAULT '',
  
  -- Payment Settings
  intasend_publishable_key VARCHAR(500) DEFAULT '',
  intasend_secret_key VARCHAR(500) DEFAULT '',
  intasend_test_mode BOOLEAN DEFAULT true,
  
  -- Email Settings
  gmail_user VARCHAR(255) DEFAULT '',
  gmail_pass VARCHAR(500) DEFAULT '',
  site_url VARCHAR(500) DEFAULT 'https://strawberrydips.shop',
  
  -- Admin Settings
  admin_email VARCHAR(255) DEFAULT 'admin@strawberrydips.com',
  admin_password VARCHAR(500) DEFAULT '',
  session_timeout INTEGER DEFAULT 30,
  
  -- Notification Settings
  email_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  order_confirmation_email BOOLEAN DEFAULT true,
  status_update_email BOOLEAN DEFAULT true,
  low_stock_alert BOOLEAN DEFAULT true,
  
  -- General Settings
  maintenance_mode BOOLEAN DEFAULT false,
  debug_mode BOOLEAN DEFAULT false,
  analytics_enabled BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings if not exists
INSERT INTO store_settings (id) 
VALUES ('main')
ON CONFLICT (id) DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_store_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS store_settings_updated_at ON store_settings;
CREATE TRIGGER store_settings_updated_at
  BEFORE UPDATE ON store_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_store_settings_updated_at();

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_settings_id ON store_settings(id);
