const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔒 Setting up HTTPS for local development...');

try {
  // Create certificates directory
  const certDir = path.join(__dirname, '..', 'certs');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir);
  }
  
  // Create CA first
  console.log('🔑 Creating Certificate Authority...');
  execSync('npx mkcert create-ca', { 
    stdio: 'inherit',
    cwd: certDir 
  });
  
  // Generate certificates
  console.log('🔑 Generating SSL certificates...');
  execSync('npx mkcert create-cert --key key.pem --cert cert.pem --domains localhost 127.0.0.1 ::1', { 
    stdio: 'inherit',
    cwd: certDir 
  });
  
  console.log('✅ HTTPS setup complete!');
  console.log('📁 Certificates saved to:', certDir);
  console.log('🚀 Run: npm run dev:https');
  
} catch (error) {
  console.error('❌ Error setting up HTTPS:', error.message);
  console.log('💡 You can still use HTTP for development, but payment forms won\'t auto-fill');
}
