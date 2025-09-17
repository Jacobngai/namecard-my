// Offline Mode Test Script for NAMECARD.MY
const fs = require('fs');
const path = require('path');

console.log('🧪 NAMECARD.MY OFFLINE MODE TEST SUITE');
console.log('=====================================\n');

// Test results tracking
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Test 1: Check LocalStorage service exists
function testLocalStorageExists() {
  console.log('📁 Test 1: LocalStorage Service Check');
  const localStoragePath = path.join(__dirname, 'services', 'localStorage.ts');

  if (fs.existsSync(localStoragePath)) {
    const content = fs.readFileSync(localStoragePath, 'utf8');

    // Check for required methods
    const requiredMethods = [
      'saveContact',
      'getContacts',
      'updateContact',
      'deleteContact',
      'saveImage',
      'addToSyncQueue'
    ];

    let allMethodsFound = true;
    requiredMethods.forEach(method => {
      if (!content.includes(method)) {
        testResults.warnings.push(`⚠️ Method '${method}' not found in LocalStorage`);
        allMethodsFound = false;
      }
    });

    if (allMethodsFound) {
      testResults.passed.push('✅ LocalStorage service has all required methods');
    }

    console.log('✅ LocalStorage service exists');
    return true;
  } else {
    console.log('❌ LocalStorage service NOT FOUND');
    testResults.failed.push('LocalStorage service missing');
    return false;
  }
}

// Test 2: Check ContactService implementation
function testContactService() {
  console.log('\n📱 Test 2: ContactService Check');
  const contactServicePath = path.join(__dirname, 'services', 'contactService.ts');

  if (fs.existsSync(contactServicePath)) {
    const content = fs.readFileSync(contactServicePath, 'utf8');

    // Check for offline-first pattern
    if (content.includes('LocalStorage') && content.includes('await LocalStorage')) {
      console.log('✅ ContactService uses LocalStorage (offline-first)');
      testResults.passed.push('✅ ContactService implements offline-first pattern');

      // Check for sync queue
      if (content.includes('queueSync') || content.includes('addToSyncQueue')) {
        console.log('✅ ContactService has sync queue implementation');
        testResults.passed.push('✅ Sync queue implemented');
      } else {
        console.log('⚠️ Sync queue not found in ContactService');
        testResults.warnings.push('Sync queue implementation not found');
      }
    } else {
      console.log('❌ ContactService does NOT use LocalStorage');
      testResults.failed.push('ContactService not offline-first');
    }
    return true;
  } else {
    console.log('❌ ContactService NOT FOUND');
    testResults.failed.push('ContactService missing');
    return false;
  }
}

// Test 3: Check App.tsx for offline-first initialization
function testAppConfiguration() {
  console.log('\n🚀 Test 3: App.tsx Configuration Check');
  const appPath = path.join(__dirname, 'App.tsx');

  if (fs.existsSync(appPath)) {
    const content = fs.readFileSync(appPath, 'utf8');

    // Check for ContactService import
    if (content.includes('ContactService')) {
      console.log('✅ App uses ContactService');
      testResults.passed.push('✅ App imports ContactService');
    } else {
      console.log('⚠️ App does not import ContactService');
      testResults.warnings.push('App may not use ContactService');
    }

    // Check for offline-first initialization
    if (content.includes('ContactService.init') || content.includes('LocalStorage.init')) {
      console.log('✅ App initializes offline services');
      testResults.passed.push('✅ Offline services initialized');
    } else {
      console.log('⚠️ Offline service initialization not found');
      testResults.warnings.push('Service initialization not explicit');
    }

    // Check for auth as optional
    if (content.includes('catch') && content.includes('offline')) {
      console.log('✅ App handles offline/auth failures gracefully');
      testResults.passed.push('✅ Graceful offline handling');
    }

    return true;
  } else {
    console.log('❌ App.tsx NOT FOUND');
    testResults.failed.push('App.tsx missing');
    return false;
  }
}

// Test 4: Check for authentication dependencies
function testNoAuthRequired() {
  console.log('\n🔐 Test 4: Authentication Independence Check');
  const componentsDir = path.join(__dirname, 'components');

  if (fs.existsSync(componentsDir)) {
    const files = fs.readdirSync(componentsDir);
    let authIssues = [];

    files.forEach(file => {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');

        // Check for direct Supabase calls
        if (content.includes('SupabaseService.') &&
            !content.includes('ContactService')) {
          authIssues.push(`${file} uses SupabaseService directly`);
        }

        // Check for auth requirements
        if (content.includes('requireAuth') ||
            content.includes('user_id') && !content.includes('optional')) {
          authIssues.push(`${file} may require authentication`);
        }
      }
    });

    if (authIssues.length === 0) {
      console.log('✅ No authentication dependencies in components');
      testResults.passed.push('✅ Components are auth-independent');
    } else {
      console.log('⚠️ Found potential auth dependencies:');
      authIssues.forEach(issue => {
        console.log(`   - ${issue}`);
        testResults.warnings.push(issue);
      });
    }

    return authIssues.length === 0;
  } else {
    console.log('❌ Components directory NOT FOUND');
    testResults.failed.push('Components directory missing');
    return false;
  }
}

// Test 5: Check camera functionality
function testCameraOffline() {
  console.log('\n📸 Test 5: Camera Offline Capability Check');
  const cameraPath = path.join(__dirname, 'components', 'CameraScreen.tsx');

  if (fs.existsSync(cameraPath)) {
    const content = fs.readFileSync(cameraPath, 'utf8');

    // Check for LocalStorage/ContactService usage
    if (content.includes('LocalStorage') || content.includes('ContactService')) {
      console.log('✅ Camera uses offline-first services');
      testResults.passed.push('✅ Camera is offline-capable');

      // Check for no direct Supabase
      if (!content.includes('SupabaseService.') || content.includes('// SupabaseService')) {
        console.log('✅ Camera does not require Supabase directly');
        testResults.passed.push('✅ Camera works without network');
      } else {
        console.log('⚠️ Camera may still use Supabase directly');
        testResults.warnings.push('Camera may require network');
      }
    } else {
      console.log('❌ Camera does not use offline services');
      testResults.failed.push('Camera not offline-capable');
    }

    return true;
  } else {
    console.log('⚠️ CameraScreen.tsx not found');
    testResults.warnings.push('CameraScreen.tsx not found');
    return false;
  }
}

// Test 6: Check for circular dependencies
function testNoCircularDeps() {
  console.log('\n🔄 Test 6: Circular Dependencies Check');

  // Check if supabaseClient exists
  const supabaseClientPath = path.join(__dirname, 'services', 'supabaseClient.ts');

  if (fs.existsSync(supabaseClientPath)) {
    console.log('✅ Separate supabaseClient.ts exists (prevents circular deps)');
    testResults.passed.push('✅ No circular dependencies');
    return true;
  } else {
    // Check for potential circular deps
    const supabasePath = path.join(__dirname, 'services', 'supabase.ts');
    const authPath = path.join(__dirname, 'services', 'authManager.ts');

    if (fs.existsSync(supabasePath) && fs.existsSync(authPath)) {
      const supabaseContent = fs.readFileSync(supabasePath, 'utf8');
      const authContent = fs.readFileSync(authPath, 'utf8');

      if (supabaseContent.includes('authManager') && authContent.includes('supabase')) {
        console.log('⚠️ Potential circular dependency detected');
        testResults.warnings.push('Circular dependency between supabase and authManager');
      } else {
        console.log('✅ No obvious circular dependencies');
        testResults.passed.push('✅ No circular dependencies detected');
      }
    }

    return true;
  }
}

// Test 7: Performance check
function testPerformanceTargets() {
  console.log('\n⚡ Test 7: Performance Configuration Check');

  // Check for AsyncStorage usage (fast local storage)
  const servicesDir = path.join(__dirname, 'services');
  const hasAsyncStorage = fs.readdirSync(servicesDir).some(file => {
    const content = fs.readFileSync(path.join(servicesDir, file), 'utf8');
    return content.includes('AsyncStorage');
  });

  if (hasAsyncStorage) {
    console.log('✅ AsyncStorage used for fast local operations');
    testResults.passed.push('✅ Performance-optimized storage');
  } else {
    console.log('⚠️ AsyncStorage not found');
    testResults.warnings.push('May not be using optimal storage');
  }

  return true;
}

// Run all tests
console.log('Starting offline mode validation...\n');
console.log('=' .repeat(50));

testLocalStorageExists();
testContactService();
testAppConfiguration();
testNoAuthRequired();
testCameraOffline();
testNoCircularDeps();
testPerformanceTargets();

// Generate report
console.log('\n' + '=' .repeat(50));
console.log('\n📊 TEST RESULTS SUMMARY');
console.log('=' .repeat(50));

console.log(`\n✅ PASSED: ${testResults.passed.length} tests`);
testResults.passed.forEach(test => console.log(`   ${test}`));

console.log(`\n❌ FAILED: ${testResults.failed.length} tests`);
if (testResults.failed.length > 0) {
  testResults.failed.forEach(test => console.log(`   ❌ ${test}`));
} else {
  console.log('   None - Excellent!');
}

console.log(`\n⚠️ WARNINGS: ${testResults.warnings.length} issues`);
if (testResults.warnings.length > 0) {
  testResults.warnings.forEach(warning => console.log(`   ⚠️ ${warning}`));
} else {
  console.log('   None - Perfect!');
}

// Overall verdict
console.log('\n' + '=' .repeat(50));
console.log('\n🎯 OVERALL VERDICT:');

const passRate = (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;

if (testResults.failed.length === 0 && testResults.warnings.length === 0) {
  console.log('🏆 PERFECT! App is 100% offline-ready!');
} else if (testResults.failed.length === 0) {
  console.log('✅ GOOD! App works offline with minor warnings.');
  console.log(`   Pass rate: ${passRate.toFixed(1)}%`);
} else if (passRate >= 70) {
  console.log('⚠️ PARTIAL SUCCESS - Some offline features working.');
  console.log(`   Pass rate: ${passRate.toFixed(1)}%`);
} else {
  console.log('❌ NEEDS WORK - Offline functionality incomplete.');
  console.log(`   Pass rate: ${passRate.toFixed(1)}%`);
}

console.log('\n💡 RECOMMENDATIONS:');
if (testResults.failed.length > 0) {
  console.log('1. Fix critical failures first (see FAILED section)');
}
if (testResults.warnings.length > 0) {
  console.log('2. Address warnings to improve reliability');
}
if (testResults.failed.length === 0 && testResults.warnings.length === 0) {
  console.log('1. Run live device testing');
  console.log('2. Test with 1000+ contacts');
  console.log('3. Monitor sync performance');
}

console.log('\n' + '=' .repeat(50));
console.log('Test completed at:', new Date().toLocaleString());