import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { withAdminAuth } from '@/lib/auth-middleware';

// Settings schema for database
interface StoreSettings {
  // Store Information
  storeName: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  storeDescription: string;
  storeLogo: string;
  
  // Payment Settings
  intasendPublishableKey: string;
  intasendSecretKey: string;
  intasendTestMode: boolean;
  
  // Email Settings
  gmailUser: string;
  gmailPass: string;
  siteUrl: string;
  
  // Admin Settings
  adminEmail: string;
  adminPassword: string;
  sessionTimeout: number;
  
  // Notification Settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  orderConfirmationEmail: boolean;
  statusUpdateEmail: boolean;
  lowStockAlert: boolean;
  
  // General Settings
  maintenanceMode: boolean;
  debugMode: boolean;
  analyticsEnabled: boolean;
}

// Default settings
const DEFAULT_SETTINGS: StoreSettings = {
  // Store Information
  storeName: 'Strawberry Dips',
  storeEmail: 'info@strawberrydips.com',
  storePhone: '+254 700 000 000',
  storeAddress: 'Nairobi, Kenya',
  storeDescription: 'Premium strawberry dips and desserts',
  storeLogo: '',
  
  // Payment Settings
  intasendPublishableKey: process.env.INTASEND_PUBLISHABLE_KEY || '',
  intasendSecretKey: process.env.INTASEND_SECRET_KEY || '',
  intasendTestMode: process.env.INTASEND_TEST_MODE === 'true',
  
  // Email Settings
  gmailUser: process.env.GMAIL_USER || '',
  gmailPass: process.env.GMAIL_PASS || '',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://strawberrydips.shop',
  
  // Admin Settings
  adminEmail: 'admin@strawberrydips.com',
  adminPassword: '',
  sessionTimeout: 30,
  
  // Notification Settings
  emailNotifications: true,
  smsNotifications: false,
  orderConfirmationEmail: true,
  statusUpdateEmail: true,
  lowStockAlert: true,
  
  // General Settings
  maintenanceMode: false,
  debugMode: process.env.NODE_ENV === 'development',
  analyticsEnabled: true,
};

// GET /api/admin/settings
async function getSettings(request: NextRequest) {
  try {
    // Check if settings table exists, if not return default settings
    const { data: settings, error } = await supabase
      .from('store_settings')
      .select('*')
      .single();

    if (error) {
      // If table doesn't exist or no settings found, return default settings
      console.log('Settings table not found or empty, returning default settings');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    // Merge with default settings to ensure all fields are present
    const mergedSettings = { ...DEFAULT_SETTINGS, ...settings };
    
    return NextResponse.json(mergedSettings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// PUT /api/admin/settings
async function updateSettings(request: NextRequest) {
  try {
    const settings: StoreSettings = await request.json();

    // Validate required fields
    if (!settings.storeName || !settings.storeEmail) {
      return NextResponse.json(
        { error: 'Store name and email are required' },
        { status: 400 }
      );
    }

    // Create or update settings in database
    const { data, error } = await supabase
      .from('store_settings')
      .upsert({
        id: 'main', // Single settings record
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving settings:', error);
      return NextResponse.json(
        { error: 'Failed to save settings' },
        { status: 500 }
      );
    }

    // Update environment variables if needed (for development)
    if (process.env.NODE_ENV === 'development') {
      // Note: In production, these would need to be updated in the deployment platform
      console.log('Settings updated successfully');
    }

    return NextResponse.json({ 
      message: 'Settings saved successfully',
      settings: data 
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}

// Protected admin endpoints
export const GET = withAdminAuth(getSettings);
export const PUT = withAdminAuth(updateSettings);

