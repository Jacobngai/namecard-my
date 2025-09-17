// Simple test script for Gemini API
const GEMINI_API_KEY = 'AIzaSyD5XdQMEppG55KMPIK2xhe4M7Rd04J9jFE';

async function testGeminiAPI() {
  console.log('🚀 Testing Gemini 2.0 Flash API...\n');

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: 'Say "API test successful!" in exactly 3 words.' }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 100
          }
        })
      }
    );

    if (response.ok) {
      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
      console.log('✅ Gemini API is working!');
      console.log('📝 Response:', responseText);
      console.log('\n🎯 API Configuration:');
      console.log('   - Model: gemini-2.0-flash-exp');
      console.log('   - Endpoint: Working');
      console.log('   - API Key: Valid');
    } else {
      const error = await response.text();
      console.error('❌ API request failed:', response.status);
      console.error('Error:', error);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
}

testGeminiAPI();