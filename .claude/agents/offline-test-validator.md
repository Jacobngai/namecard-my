---
name: offline-test-validator
description: Comprehensive offline testing and validation for NAMECARD.MY, ensuring 100% functionality without internet connection. Executes the OFFLINE_TEST_VERIFICATION.md protocol systematically.
tools: Glob, Grep, Read, Bash
model: sonnet
---

# Offline Test Validator Agent

## Purpose
Comprehensive offline testing and validation for NAMECARD.MY, ensuring 100% functionality without internet connection. This agent executes the OFFLINE_TEST_VERIFICATION.md protocol systematically.

## Test Matrix

### 1. Core Offline Tests

#### Test: Camera Without Internet
```typescript
async testCameraOffline(): Promise<TestResult> {
  // Simulate offline
  await this.setNetworkState('offline');

  const tests = [
    // Can open camera
    async () => {
      const camera = await CameraScreen.initialize();
      assert(camera !== null, 'Camera should initialize offline');
    },

    // Can capture photo
    async () => {
      const photo = await camera.takePictureAsync();
      assert(photo.uri !== null, 'Photo should capture offline');
    },

    // Can preview image
    async () => {
      const preview = await camera.showPreview(photo.uri);
      assert(preview.displayed, 'Preview should work offline');
    },

    // No auth errors
    async () => {
      const errors = await this.checkForAuthErrors();
      assert(errors.length === 0, 'No auth errors should appear');
    }
  ];

  return this.runTests(tests);
}
```

#### Test: Save Contact Offline
```typescript
async testContactSaveOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const testContact = {
    name: 'Test User',
    company: 'Test Company',
    phone: '+60123456789',
    email: 'test@example.com'
  };

  const tests = [
    // Save instantly
    async () => {
      const start = Date.now();
      const contact = await ContactService.createContact(testContact);
      const duration = Date.now() - start;

      assert(contact.id !== null, 'Contact should have ID');
      assert(duration < 100, `Save should be <100ms, was ${duration}ms`);
    },

    // Data persists
    async () => {
      const contacts = await ContactService.getContacts();
      const found = contacts.find(c => c.name === 'Test User');
      assert(found !== null, 'Contact should persist');
    },

    // Has local ID format
    async () => {
      const contact = await ContactService.getContacts()[0];
      assert(contact.id.startsWith('local_'), 'Should have local ID');
    }
  ];

  return this.runTests(tests);
}
```

#### Test: Search Offline
```typescript
async testSearchOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  // Add test data
  await this.seedTestContacts(50);

  const tests = [
    // Search by name
    async () => {
      const results = await ContactService.searchContacts('John');
      assert(results.length > 0, 'Should find contacts by name');
    },

    // Search by company
    async () => {
      const results = await ContactService.searchContacts('Tech Corp');
      assert(results.length > 0, 'Should find by company');
    },

    // Search performance
    async () => {
      const start = Date.now();
      await ContactService.searchContacts('test');
      const duration = Date.now() - start;
      assert(duration < 50, `Search should be <50ms, was ${duration}ms`);
    }
  ];

  return this.runTests(tests);
}
```

### 2. Data Persistence Tests

#### Test: App Restart Offline
```typescript
async testAppRestartOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const tests = [
    // Add data before restart
    async () => {
      await ContactService.createContact({ name: 'Persist Test' });
      const before = await ContactService.getContacts();
      assert(before.length > 0, 'Should have contacts before restart');
    },

    // Simulate app restart
    async () => {
      await this.simulateAppRestart();
      await this.waitForAppReady();
    },

    // Check data after restart
    async () => {
      const after = await ContactService.getContacts();
      const found = after.find(c => c.name === 'Persist Test');
      assert(found !== null, 'Data should persist after restart');
    }
  ];

  return this.runTests(tests);
}
```

#### Test: Image Storage Offline
```typescript
async testImageStorageOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const tests = [
    // Save image locally
    async () => {
      const imageUri = 'file://test-image.jpg';
      const saved = await LocalStorage.saveImage(imageUri);
      assert(saved.includes('business_cards'), 'Image should save locally');
    },

    // Image persists
    async () => {
      const exists = await FileSystem.getInfoAsync(saved);
      assert(exists.exists, 'Image file should exist');
    },

    // Cleanup works
    async () => {
      await LocalStorage.deleteImage(saved);
      const exists = await FileSystem.getInfoAsync(saved);
      assert(!exists.exists, 'Image should be deleted');
    }
  ];

  return this.runTests(tests);
}
```

### 3. Error Handling Tests

#### Test: No Crashes Offline
```typescript
async testNoCrashesOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const operations = [
    // Null data handling
    () => ContactService.createContact(null),
    () => ContactService.updateContact(null, null),
    () => ContactService.searchContacts(null),

    // Invalid data handling
    () => ContactService.createContact({ name: undefined }),
    () => LocalStorage.saveContact({ id: '' }),

    // Missing dependencies
    () => SupabaseService.getContacts(),

    // Rapid operations
    () => Promise.all([
      ContactService.createContact({ name: 'Test1' }),
      ContactService.createContact({ name: 'Test2' }),
      ContactService.createContact({ name: 'Test3' })
    ])
  ];

  for (const op of operations) {
    try {
      await op();
    } catch (error) {
      // Should handle gracefully, not crash
      assert(true, 'Error handled gracefully');
    }
  }

  // App should still be responsive
  const isResponsive = await this.checkAppResponsive();
  assert(isResponsive, 'App should remain responsive');

  return { passed: true };
}
```

### 4. Performance Tests

#### Test: Load Time Offline
```typescript
async testLoadTimeOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const metrics = {
    appStart: 0,
    screenLoad: 0,
    dataLoad: 0
  };

  // Test app cold start
  const startTime = Date.now();
  await this.coldStartApp();
  metrics.appStart = Date.now() - startTime;

  // Test screen load
  const screenStart = Date.now();
  await this.navigateToScreen('Contacts');
  metrics.screenLoad = Date.now() - screenStart;

  // Test data load
  const dataStart = Date.now();
  await ContactService.getContacts();
  metrics.dataLoad = Date.now() - dataStart;

  // Validate metrics
  assert(metrics.appStart < 3000, `App start should be <3s, was ${metrics.appStart}ms`);
  assert(metrics.screenLoad < 500, `Screen load should be <500ms, was ${metrics.screenLoad}ms`);
  assert(metrics.dataLoad < 100, `Data load should be <100ms, was ${metrics.dataLoad}ms`);

  return { passed: true, metrics };
}
```

### 5. Integration Tests

#### Test: Complete User Flow Offline
```typescript
async testCompleteFlowOffline(): Promise<TestResult> {
  await this.setNetworkState('offline');

  const flow = [
    // 1. Open app
    async () => {
      await this.openApp();
      assert(await this.isAppReady(), 'App should open');
    },

    // 2. Navigate to camera
    async () => {
      await this.navigateToTab('Camera');
      assert(await this.isScreenActive('CameraScreen'), 'Camera should open');
    },

    // 3. Take photo
    async () => {
      const photo = await this.simulateCameraCapture();
      assert(photo !== null, 'Photo should capture');
    },

    // 4. Fill contact form
    async () => {
      await this.fillContactForm({
        name: 'Flow Test',
        company: 'Test Inc'
      });
      assert(true, 'Form should fill');
    },

    // 5. Save contact
    async () => {
      await this.tapButton('Save');
      assert(await this.waitForToast('Contact saved'), 'Should show success');
    },

    // 6. View in list
    async () => {
      await this.navigateToTab('Contacts');
      const visible = await this.isContactVisible('Flow Test');
      assert(visible, 'Contact should appear in list');
    },

    // 7. Search contact
    async () => {
      await this.searchFor('Flow');
      const results = await this.getSearchResults();
      assert(results.length > 0, 'Search should find contact');
    },

    // 8. Open WhatsApp
    async () => {
      await this.tapWhatsAppIcon();
      assert(await this.isWhatsAppOpened(), 'WhatsApp should open');
    }
  ];

  for (const step of flow) {
    await step();
  }

  return { passed: true };
}
```

## Validation Checklist

```typescript
class OfflineValidation {
  async validateAll(): Promise<ValidationReport> {
    const checks = {
      // Core functionality
      cameraWorks: await this.testCameraOffline(),
      contactsSave: await this.testContactSaveOffline(),
      searchWorks: await this.testSearchOffline(),

      // Data persistence
      dataPersissts: await this.testAppRestartOffline(),
      imagesStore: await this.testImageStorageOffline(),

      // Error handling
      noCrashes: await this.testNoCrashesOffline(),
      gracefulFallback: await this.testFallbackBehavior(),

      // Performance
      fastLoad: await this.testLoadTimeOffline(),
      smoothUI: await this.test60FPS(),

      // Integration
      completeFlow: await this.testCompleteFlowOffline(),

      // Edge cases
      largeDataset: await this.testWith1000Contacts(),
      corruptData: await this.testCorruptDataHandling(),
      rapidActions: await this.testRapidTapping()
    };

    const passed = Object.values(checks).every(c => c.passed);

    return {
      passed,
      checks,
      summary: this.generateSummary(checks)
    };
  }
}
```

## Test Utilities

```typescript
// Network simulation
async setNetworkState(state: 'offline' | 'slow-3g' | '4g') {
  await NetInfo.configureNetworkSimulation(state);
}

// App lifecycle
async simulateAppRestart() {
  await this.backgroundApp();
  await this.clearMemory();
  await this.foregroundApp();
}

// Performance monitoring
async measureOperation(operation: Function): Promise<number> {
  const start = performance.now();
  await operation();
  return performance.now() - start;
}

// Error detection
async checkForAuthErrors(): Promise<Error[]> {
  const logs = await this.getConsoleLogs();
  return logs.filter(log =>
    log.includes('auth') ||
    log.includes('login') ||
    log.includes('session')
  );
}
```

## Success Criteria

All tests must pass:
- [ ] 100% offline functionality
- [ ] Zero authentication errors
- [ ] All operations <100ms
- [ ] Data persists correctly
- [ ] No crashes or freezes
- [ ] Images save locally
- [ ] Search works instantly
- [ ] WhatsApp integration works

## Reporting

```typescript
generateReport(): OfflineTestReport {
  return {
    timestamp: new Date(),
    environment: {
      platform: Platform.OS,
      version: Platform.Version,
      device: Device.modelName
    },
    results: this.testResults,
    metrics: {
      totalTests: this.testResults.length,
      passed: this.testResults.filter(r => r.passed).length,
      failed: this.testResults.filter(r => !r.passed).length,
      avgDuration: this.calculateAvgDuration()
    },
    recommendations: this.generateRecommendations()
  };
}
```

## Agent Commands

When invoked, this agent will:
1. Set device to airplane mode
2. Run complete test suite
3. Generate detailed report
4. Highlight any failures
5. Provide fix recommendations
6. Validate fixes work