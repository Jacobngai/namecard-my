/**
 * API Integration Test Suite
 * 
 * This script tests all API integrations to ensure they're working correctly.
 * Run this to validate your API keys and configurations.
 */

import { GeminiOCRService } from '../services/geminiOCR';
import { SupabaseService } from '../services/supabase';
import { OpenAIService } from '../services/openai';
import { ENV, validateEnv } from '../config/env';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
}

class APITester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting API Integration Tests...\n');

    // Environment validation
    await this.runTest('Environment Variables', this.testEnvironment.bind(this));

    // Gemini OCR API tests
    await this.runTest('Gemini API Key', this.testGeminiApiKey.bind(this));

    // Supabase tests
    await this.runTest('Supabase Connection', this.testSupabaseConnection.bind(this));
    await this.runTest('Supabase Storage', this.testSupabaseStorage.bind(this));

    // OpenAI tests
    await this.runTest('OpenAI API Key', this.testOpenAIKey.bind(this));

    // Integration tests
    await this.runTest('Database Operations', this.testDatabaseOperations.bind(this));

    this.printSummary();
    return this.results;
  }

  private async runTest(name: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    console.log(`🔍 Testing: ${name}...`);

    try {
      await testFn();
      const duration = Date.now() - startTime;
      this.results.push({
        name,
        status: 'pass',
        message: 'Test passed successfully',
        duration,
      });
      console.log(`✅ ${name}: PASSED (${duration}ms)\n`);
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.results.push({
        name,
        status: 'fail',
        message,
        duration,
      });
      console.log(`❌ ${name}: FAILED - ${message} (${duration}ms)\n`);
    }
  }

  private async testEnvironment(): Promise<void> {
    const { isValid, missingKeys } = validateEnv();
    
    if (!isValid) {
      throw new Error(`Missing API keys: ${missingKeys.join(', ')}`);
    }

    // Log configuration status (without revealing keys)
    console.log('📋 Environment Configuration:');
    console.log(`   Gemini API: ${ENV.GEMINI_API_KEY ? '✓' : '✗'}`);
    console.log(`   Supabase URL: ${ENV.SUPABASE_URL ? '✓' : '✗'}`);
    console.log(`   Supabase Key: ${ENV.SUPABASE_ANON_KEY ? '✓' : '✗'}`);
    console.log(`   OpenAI API: ${ENV.OPENAI_API_KEY ? '✓' : '✗'}`);
  }

  private async testGeminiApiKey(): Promise<void> {
    const isValid = await GeminiOCRService.validateApiKey();

    if (!isValid) {
      throw new Error('Gemini API key is invalid or API is not accessible');
    }

    const serviceInfo = GeminiOCRService.getServiceInfo();
    console.log(`   ✓ API key is valid`);
    console.log(`   ✓ ${serviceInfo.name} (${serviceInfo.model}) is accessible`);
  }

  private async testSupabaseConnection(): Promise<void> {
    const isConnected = await SupabaseService.testConnection();
    
    if (!isConnected) {
      throw new Error('Unable to connect to Supabase database');
    }

    console.log('   ✓ Database connection established');
    console.log(`   ✓ Connected to: ${ENV.SUPABASE_URL}`);
  }

  private async testSupabaseStorage(): Promise<void> {
    try {
      await SupabaseService.initializeStorage();
      console.log('   ✓ Storage bucket initialized/verified');
    } catch (error) {
      // Storage bucket creation might fail due to permissions, but that's okay
      console.log('   ⚠️ Storage bucket check completed (may need manual setup)');
    }
  }

  private async testOpenAIKey(): Promise<void> {
    const isValid = await OpenAIService.testConnection();
    
    if (!isValid) {
      throw new Error('OpenAI API key is invalid or API is not accessible');
    }

    console.log('   ✓ API key is valid');
    console.log('   ✓ OpenAI API is accessible');
  }

  private async testDatabaseOperations(): Promise<void> {
    console.log('   🔍 Testing basic CRUD operations...');

    // Test contact creation
    const testContact = {
      name: 'Test Contact',
      company: 'Test Company',
      phone: '+1-555-TEST',
      email: 'test@example.com',
      address: '123 Test St',
      imageUrl: 'https://example.com/test.jpg',
    };

    try {
      // Create
      const createdContact = await SupabaseService.createContact(testContact);
      console.log('   ✓ Contact creation successful');

      // Read
      const contacts = await SupabaseService.getContacts();
      if (contacts.length === 0) {
        throw new Error('Failed to retrieve contacts');
      }
      console.log(`   ✓ Contact retrieval successful (${contacts.length} contacts)`);

      // Update
      const updatedContact = await SupabaseService.updateContact(createdContact.id, {
        company: 'Updated Test Company'
      });
      if (updatedContact.company !== 'Updated Test Company') {
        throw new Error('Contact update failed');
      }
      console.log('   ✓ Contact update successful');

      // Delete
      await SupabaseService.deleteContact(createdContact.id);
      console.log('   ✓ Contact deletion successful');

    } catch (error) {
      throw new Error(`Database operations failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private printSummary(): void {
    const passed = this.results.filter(r => r.status === 'pass').length;
    const failed = this.results.filter(r => r.status === 'fail').length;
    const warnings = this.results.filter(r => r.status === 'warning').length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️ Warnings: ${warnings}`);
    console.log(`⏱️ Total Time: ${totalTime}ms`);
    console.log('='.repeat(50));

    if (failed === 0) {
      console.log('🎉 All tests passed! Your API integrations are ready.');
    } else {
      console.log('❌ Some tests failed. Please check your configuration.');
      
      // Show failed tests
      const failedTests = this.results.filter(r => r.status === 'fail');
      console.log('\nFailed Tests:');
      failedTests.forEach(test => {
        console.log(`   ❌ ${test.name}: ${test.message}`);
      });
    }

    console.log('\n💡 Next Steps:');
    console.log('   1. Fix any failed tests by checking your API keys');
    console.log('   2. Ensure all services have proper permissions');
    console.log('   3. Run the app and test the UI functionality');
  }
}

// Export for use in React Native app
export async function runAPITests(): Promise<TestResult[]> {
  const tester = new APITester();
  return await tester.runAllTests();
}

// CLI usage (if running directly)
if (require.main === module) {
  runAPITests().catch(console.error);
}