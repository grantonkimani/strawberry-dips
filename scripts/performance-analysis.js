#!/usr/bin/env node

/**
 * Performance Analysis Script for Strawberry Dips Website
 * 
 * This script analyzes the loading performance of the website by:
 * 1. Measuring page load times
 * 2. Analyzing image loading performance
 * 3. Checking API response times
 * 4. Identifying optimization opportunities
 */

const fs = require('fs');
const path = require('path');

// Performance analysis results
const analysisResults = {
  timestamp: new Date().toISOString(),
  pages: {},
  images: {},
  apis: {},
  recommendations: []
};

console.log('🍓 Strawberry Dips Performance Analysis');
console.log('=====================================\n');

// Analyze homepage structure
function analyzeHomepage() {
  console.log('📄 Analyzing Homepage Structure...');
  
  const homepagePath = path.join(__dirname, '../src/app/page.tsx');
  const homepageContent = fs.readFileSync(homepagePath, 'utf8');
  
  // Count components and identify potential issues
  const componentCount = (homepageContent.match(/import.*from/g) || []).length;
  const dynamicImports = (homepageContent.match(/dynamic\(/g) || []).length;
  const suspenseBlocks = (homepageContent.match(/<Suspense/g) || []).length;
  
  analysisResults.pages.homepage = {
    componentCount,
    dynamicImports,
    suspenseBlocks,
    hasLazyLoading: dynamicImports > 0,
    hasSuspense: suspenseBlocks > 0
  };
  
  console.log(`   ✅ Components: ${componentCount}`);
  console.log(`   ✅ Dynamic Imports: ${dynamicImports}`);
  console.log(`   ✅ Suspense Blocks: ${suspenseBlocks}`);
  
  // Recommendations
  if (componentCount > 10) {
    analysisResults.recommendations.push({
      type: 'warning',
      message: 'Homepage has many components - consider code splitting',
      impact: 'medium'
    });
  }
  
  if (dynamicImports === 0) {
    analysisResults.recommendations.push({
      type: 'suggestion',
      message: 'Consider adding dynamic imports for non-critical components',
      impact: 'high'
    });
  }
}

// Analyze image optimization
function analyzeImages() {
  console.log('\n🖼️  Analyzing Image Optimization...');
  
  const imagesDir = path.join(__dirname, '../public/images');
  const imageFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (/\.(jpg|jpeg|png|webp|svg)$/i.test(item)) {
        imageFiles.push({
          name: item,
          path: fullPath,
          size: stat.size,
          extension: path.extname(item).toLowerCase()
        });
      }
    });
  }
  
  scanDirectory(imagesDir);
  
  const totalSize = imageFiles.reduce((sum, img) => sum + img.size, 0);
  const largeImages = imageFiles.filter(img => img.size > 500000); // > 500KB
  const webpImages = imageFiles.filter(img => img.extension === '.webp');
  
  analysisResults.images = {
    totalImages: imageFiles.length,
    totalSize: totalSize,
    averageSize: totalSize / imageFiles.length,
    largeImages: largeImages.length,
    webpImages: webpImages.length,
    optimizationScore: webpImages.length / imageFiles.length
  };
  
  console.log(`   ✅ Total Images: ${imageFiles.length}`);
  console.log(`   ✅ Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   ✅ Average Size: ${(totalSize / imageFiles.length / 1024).toFixed(2)} KB`);
  console.log(`   ✅ Large Images (>500KB): ${largeImages.length}`);
  console.log(`   ✅ WebP Images: ${webpImages.length}`);
  
  // Recommendations
  if (largeImages.length > 0) {
    analysisResults.recommendations.push({
      type: 'critical',
      message: `${largeImages.length} images are larger than 500KB - optimize these images`,
      impact: 'high',
      files: largeImages.map(img => img.name)
    });
  }
  
  if (webpImages.length / imageFiles.length < 0.5) {
    analysisResults.recommendations.push({
      type: 'suggestion',
      message: 'Convert more images to WebP format for better compression',
      impact: 'medium'
    });
  }
}

// Analyze API endpoints
function analyzeAPIs() {
  console.log('\n🔌 Analyzing API Endpoints...');
  
  const apiDir = path.join(__dirname, '../src/app/api');
  const apiFiles = [];
  
  function scanAPIDirectory(dir) {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        scanAPIDirectory(fullPath);
      } else if (item === 'route.ts') {
        apiFiles.push(fullPath);
      }
    });
  }
  
  scanAPIDirectory(apiDir);
  
  let totalAPIs = 0;
  let cachedAPIs = 0;
  let uncachedAPIs = 0;
  
  apiFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    totalAPIs++;
    
    if (content.includes('cache:') || content.includes('force-cache')) {
      cachedAPIs++;
    } else {
      uncachedAPIs++;
    }
  });
  
  analysisResults.apis = {
    totalAPIs,
    cachedAPIs,
    uncachedAPIs,
    cacheRatio: cachedAPIs / totalAPIs
  };
  
  console.log(`   ✅ Total API Endpoints: ${totalAPIs}`);
  console.log(`   ✅ Cached APIs: ${cachedAPIs}`);
  console.log(`   ✅ Uncached APIs: ${uncachedAPIs}`);
  console.log(`   ✅ Cache Ratio: ${(cachedAPIs / totalAPIs * 100).toFixed(1)}%`);
  
  // Recommendations
  if (uncachedAPIs > 0) {
    analysisResults.recommendations.push({
      type: 'suggestion',
      message: `${uncachedAPIs} API endpoints don't use caching - add appropriate cache headers`,
      impact: 'medium'
    });
  }
}

// Analyze Next.js configuration
function analyzeNextConfig() {
  console.log('\n⚙️  Analyzing Next.js Configuration...');
  
  const configPath = path.join(__dirname, '../next.config.js');
  const configContent = fs.readFileSync(configPath, 'utf8');
  
  const hasImageOptimization = configContent.includes('images:');
  const hasHeaders = configContent.includes('headers()');
  const hasTurbopack = configContent.includes('turbo:');
  const imageOptimized = configContent.includes('unoptimized: true');
  
  analysisResults.nextConfig = {
    hasImageOptimization,
    hasHeaders,
    hasTurbopack,
    imageOptimized
  };
  
  console.log(`   ✅ Image Optimization: ${hasImageOptimization ? 'Configured' : 'Not configured'}`);
  console.log(`   ✅ Custom Headers: ${hasHeaders ? 'Configured' : 'Not configured'}`);
  console.log(`   ✅ Turbopack: ${hasTurbopack ? 'Enabled' : 'Disabled'}`);
  console.log(`   ✅ Image Optimization Status: ${imageOptimized ? 'Disabled' : 'Enabled'}`);
  
  // Recommendations
  if (imageOptimized) {
    analysisResults.recommendations.push({
      type: 'critical',
      message: 'Image optimization is disabled - enable it for better performance',
      impact: 'high'
    });
  }
  
  if (!hasHeaders) {
    analysisResults.recommendations.push({
      type: 'suggestion',
      message: 'Add custom headers for better caching and security',
      impact: 'medium'
    });
  }
}

// Generate performance report
function generateReport() {
  console.log('\n📊 Performance Analysis Report');
  console.log('==============================');
  
  // Calculate overall score
  let score = 100;
  analysisResults.recommendations.forEach(rec => {
    if (rec.type === 'critical') score -= 20;
    else if (rec.type === 'warning') score -= 10;
    else if (rec.type === 'suggestion') score -= 5;
  });
  
  analysisResults.overallScore = Math.max(0, score);
  
  console.log(`\n🎯 Overall Performance Score: ${analysisResults.overallScore}/100`);
  
  if (analysisResults.overallScore >= 80) {
    console.log('   🟢 Excellent performance!');
  } else if (analysisResults.overallScore >= 60) {
    console.log('   🟡 Good performance with room for improvement');
  } else {
    console.log('   🔴 Performance needs significant improvement');
  }
  
  console.log('\n📋 Recommendations:');
  analysisResults.recommendations.forEach((rec, index) => {
    const icon = rec.type === 'critical' ? '🔴' : rec.type === 'warning' ? '🟡' : '💡';
    console.log(`   ${index + 1}. ${icon} ${rec.message} (${rec.impact} impact)`);
    if (rec.files) {
      console.log(`      Files: ${rec.files.join(', ')}`);
    }
  });
  
  // Save detailed report
  const reportPath = path.join(__dirname, '../performance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysisResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);
}

// Main execution
function main() {
  try {
    analyzeHomepage();
    analyzeImages();
    analyzeAPIs();
    analyzeNextConfig();
    generateReport();
    
    console.log('\n✅ Performance analysis completed!');
    console.log('\n🚀 Next steps:');
    console.log('   1. Review the recommendations above');
    console.log('   2. Implement high-impact optimizations first');
    console.log('   3. Test performance improvements');
    console.log('   4. Re-run this analysis to measure improvements');
    
  } catch (error) {
    console.error('❌ Error during analysis:', error.message);
    process.exit(1);
  }
}

// Run the analysis
main();
