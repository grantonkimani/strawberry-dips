'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { 
  Settings, 
  Store, 
  CreditCard, 
  Mail, 
  User, 
  Shield, 
  Save,
  Eye,
  EyeOff,
  TestTube,
  Globe,
  Database,
  Bell
} from 'lucide-react';

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

export default function SettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>({
    // Store Information
    storeName: 'Strawberry Dips',
    storeEmail: 'info@strawberrydips.com',
    storePhone: '+254 700 000 000',
    storeAddress: 'Nairobi, Kenya',
    storeDescription: 'Premium strawberry dips and desserts',
    storeLogo: '',
    
    // Payment Settings
    intasendPublishableKey: '',
    intasendSecretKey: '',
    intasendTestMode: true,
    
    // Email Settings
    gmailUser: '',
    gmailPass: '',
    siteUrl: 'https://strawberrydips.shop',
    
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
    debugMode: false,
    analyticsEnabled: true,
  });

  const [activeTab, setActiveTab] = useState('store');
  const [showSecrets, setShowSecrets] = useState<{[key: string]: boolean}>({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null);

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'payments', label: 'Payments', icon: CreditCard },
    { id: 'email', label: 'Email', icon: Mail },
    { id: 'admin', label: 'Admin', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'general', label: 'General', icon: Settings },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        setToast({ message: 'Settings saved successfully!', type: 'success' });
      } else {
        setToast({ message: 'Failed to save settings', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Error saving settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderStoreInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Name
          </label>
          <input
            type="text"
            value={settings.storeName}
            onChange={(e) => setSettings({...settings, storeName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Email
          </label>
          <input
            type="email"
            value={settings.storeEmail}
            onChange={(e) => setSettings({...settings, storeEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Phone
          </label>
          <input
            type="tel"
            value={settings.storePhone}
            onChange={(e) => setSettings({...settings, storePhone: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Store Address
          </label>
          <input
            type="text"
            value={settings.storeAddress}
            onChange={(e) => setSettings({...settings, storeAddress: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Store Description
        </label>
        <textarea
          value={settings.storeDescription}
          onChange={(e) => setSettings({...settings, storeDescription: e.target.value})}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      {/* IntaSend Settings */}
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <CreditCard className="h-5 w-5 mr-2" />
          IntaSend (M-Pesa) Settings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Publishable Key
            </label>
            <div className="relative">
              <input
                type={showSecrets.intasendPublishable ? 'text' : 'password'}
                value={settings.intasendPublishableKey}
                onChange={(e) => setSettings({...settings, intasendPublishableKey: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('intasendPublishable')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showSecrets.intasendPublishable ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Secret Key
            </label>
            <div className="relative">
              <input
                type={showSecrets.intasendSecret ? 'text' : 'password'}
                value={settings.intasendSecretKey}
                onChange={(e) => setSettings({...settings, intasendSecretKey: e.target.value})}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => toggleSecretVisibility('intasendSecret')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showSecrets.intasendSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.intasendTestMode}
              onChange={(e) => setSettings({...settings, intasendTestMode: e.target.checked})}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Test Mode</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderEmailSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gmail User
          </label>
          <input
            type="email"
            value={settings.gmailUser}
            onChange={(e) => setSettings({...settings, gmailUser: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gmail App Password
          </label>
          <div className="relative">
            <input
              type={showSecrets.gmailPass ? 'text' : 'password'}
              value={settings.gmailPass}
              onChange={(e) => setSettings({...settings, gmailPass: e.target.value})}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => toggleSecretVisibility('gmailPass')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showSecrets.gmailPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Site URL
          </label>
          <input
            type="url"
            value={settings.siteUrl}
            onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderAdminSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Email
          </label>
          <input
            type="email"
            value={settings.adminEmail}
            onChange={(e) => setSettings({...settings, adminEmail: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Admin Password
          </label>
          <div className="relative">
            <input
              type={showSecrets.adminPassword ? 'text' : 'password'}
              value={settings.adminPassword}
              onChange={(e) => setSettings({...settings, adminPassword: e.target.value})}
              className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Leave blank to keep current password"
            />
            <button
              type="button"
              onClick={() => toggleSecretVisibility('adminPassword')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2"
            >
              {showSecrets.adminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="5"
            max="120"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({...settings, sessionTimeout: parseInt(e.target.value)})}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Email Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => setSettings({...settings, emailNotifications: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Enable Email Notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.orderConfirmationEmail}
                onChange={(e) => setSettings({...settings, orderConfirmationEmail: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Order Confirmation Emails</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.statusUpdateEmail}
                onChange={(e) => setSettings({...settings, statusUpdateEmail: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Status Update Emails</span>
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">System Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.smsNotifications}
                onChange={(e) => setSettings({...settings, smsNotifications: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">SMS Notifications</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.lowStockAlert}
                onChange={(e) => setSettings({...settings, lowStockAlert: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Low Stock Alerts</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">System Settings</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintenance Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.debugMode}
                onChange={(e) => setSettings({...settings, debugMode: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Debug Mode</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.analyticsEnabled}
                onChange={(e) => setSettings({...settings, analyticsEnabled: e.target.checked})}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Analytics Enabled</span>
            </label>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Database & API</h3>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center">
                <Database className="h-4 w-4 mr-2" />
                <span>Supabase Database: Connected</span>
              </div>
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <span>API Status: Active</span>
              </div>
              <div className="flex items-center">
                <TestTube className="h-4 w-4 mr-2" />
                <span>Test Mode: {settings.intasendTestMode ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'store':
        return renderStoreInfo();
      case 'payments':
        return renderPaymentSettings();
      case 'email':
        return renderEmailSettings();
      case 'admin':
        return renderAdminSettings();
      case 'notifications':
        return renderNotificationSettings();
      case 'general':
        return renderGeneralSettings();
      default:
        return renderStoreInfo();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Manage your store configuration, payment settings, and system preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {(() => {
                  const activeTabData = tabs.find(tab => tab.id === activeTab);
                  const Icon = activeTabData?.icon;
                  return (
                    <>
                      {Icon && <Icon className="h-5 w-5 mr-2" />}
                      {activeTabData?.label}
                    </>
                  );
                })()}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderTabContent()}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={loading}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
