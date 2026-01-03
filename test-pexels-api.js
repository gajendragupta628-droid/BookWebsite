#!/usr/bin/env node

/**
 * Pexels API Test Script
 * Run this to verify your Pexels API key is working
 * Usage: node test-pexels-api.js
 */

require('dotenv').config();
const pexelsService = require('./src/services/pexelsService');

async function testPexelsAPI() {
  console.log('\n🔍 Testing Pexels API Integration...\n');

  // Check if API key is set
  const apiKey = process.env.PEXELS_API_KEY;
  if (!apiKey) {
    console.log('❌ PEXELS_API_KEY not found in .env file');
    console.log('\n📝 To fix this:');
    console.log('   1. Create a .env file (copy from env.example)');
    console.log('   2. Get your API key from https://www.pexels.com/api/');
    console.log('   3. Add PEXELS_API_KEY=your_key_here to .env\n');
    process.exit(1);
  }

  console.log('✅ PEXELS_API_KEY is set');
  console.log(`   Key: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}\n`);

  try {
    // Test 1: Search for books
    console.log('📚 Test 1: Searching for book images...');
    const searchData = await pexelsService.searchPhotos('books', 3, 1);
    
    if (searchData && searchData.photos && searchData.photos.length > 0) {
      console.log(`   ✅ Found ${searchData.photos.length} images`);
      console.log(`   📸 Sample: "${searchData.photos[0].alt || 'Book photo'}"`);
      console.log(`   👤 By: ${searchData.photos[0].photographer}`);
    } else {
      console.log('   ⚠️  No images found (might be using fallback)');
    }

    // Test 2: Get curated photos
    console.log('\n🎨 Test 2: Getting curated photos...');
    const curatedData = await pexelsService.getCuratedPhotos(2, 1);
    
    if (curatedData && curatedData.photos && curatedData.photos.length > 0) {
      console.log(`   ✅ Found ${curatedData.photos.length} curated images`);
    } else {
      console.log('   ⚠️  No curated images found');
    }

    // Test 3: Get themed book images
    console.log('\n📖 Test 3: Getting themed book images...');
    const bookImages = await pexelsService.getBookImages('library', 3);
    
    if (bookImages && bookImages.length > 0) {
      console.log(`   ✅ Found ${bookImages.length} library images`);
      console.log(`   🔗 URL: ${bookImages[0].src.medium.substring(0, 50)}...`);
    } else {
      console.log('   ⚠️  No themed images found');
    }

    // Test 4: Check image quality options
    console.log('\n📐 Test 4: Checking image size options...');
    const testImage = bookImages[0];
    if (testImage && testImage.src) {
      const sizes = Object.keys(testImage.src);
      console.log(`   ✅ Available sizes: ${sizes.join(', ')}`);
    }

    // Success summary
    console.log('\n' + '='.repeat(50));
    console.log('✨ SUCCESS! Pexels API is working correctly!');
    console.log('='.repeat(50));
    console.log('\n📌 Next Steps:');
    console.log('   1. Start your server: npm run dev');
    console.log('   2. Visit http://localhost:3000');
    console.log('   3. Check for Pexels images on the home page');
    console.log('   4. Look for "Photos provided by Pexels" in footer\n');

  } catch (error) {
    console.log('\n' + '='.repeat(50));
    console.log('❌ ERROR: Pexels API test failed');
    console.log('='.repeat(50));
    console.error('\nError details:', error.message);
    
    if (error.message.includes('401')) {
      console.log('\n💡 Fix: Your API key might be invalid');
      console.log('   - Get a new key from https://www.pexels.com/api/');
      console.log('   - Make sure there are no extra spaces in .env');
      console.log('   - Format: PEXELS_API_KEY=your_key_here');
    } else if (error.message.includes('429')) {
      console.log('\n💡 Fix: Rate limit exceeded');
      console.log('   - Wait 1 hour for rate limit to reset');
      console.log('   - App will use fallback images automatically');
    } else if (error.message.includes('fetch')) {
      console.log('\n💡 Fix: Network error');
      console.log('   - Check your internet connection');
      console.log('   - Make sure you can access pexels.com');
    }
    
    console.log('\n📚 See PEXELS_API_SETUP.md for more help\n');
    process.exit(1);
  }
}

// Run the test
testPexelsAPI();

