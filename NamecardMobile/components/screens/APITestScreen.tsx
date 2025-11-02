import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui/Button';
import { runAPITests } from '../../scripts/testAPIs';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration: number;
}

export function APITestScreen({ onBack }: { onBack: () => void }) {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [hasRun, setHasRun] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      console.log('🧪 Starting API tests from UI...');
      const testResults = await runAPITests();
      setResults(testResults);
      setHasRun(true);
      
      const failed = testResults.filter(r => r.status === 'fail').length;
      if (failed === 0) {
        Alert.alert(
          'Tests Complete! 🎉',
          'All API integrations are working correctly.',
          [{ text: 'Great!' }]
        );
      } else {
        Alert.alert(
          'Tests Complete ⚠️',
          `${failed} test(s) failed. Check the results below.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Test runner failed:', error);
      Alert.alert(
        'Test Error',
        'Failed to run tests. Check console for details.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <Ionicons name="checkmark-circle" size={24} color="#10B981" />;
      case 'fail':
        return <Ionicons name="close-circle" size={24} color="#EF4444" />;
      case 'warning':
        return <Ionicons name="warning" size={24} color="#F59E0B" />;
      default:
        return <Ionicons name="help-circle" size={24} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return '#10B981';
      case 'fail':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  const passedCount = results.filter(r => r.status === 'pass').length;
  const failedCount = results.filter(r => r.status === 'fail').length;
  const warningCount = results.filter(r => r.status === 'warning').length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>API Integration Tests</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            Test all API integrations to ensure they're working correctly with your configured API keys.
          </Text>
        </View>

        {/* Run Tests Button */}
        <View style={styles.section}>
          <Button
            title={isRunning ? "Running Tests..." : "Run API Tests"}
            onPress={runTests}
            disabled={isRunning}
            loading={isRunning}
            style={styles.runButton}
          />
        </View>

        {/* Results Summary */}
        {hasRun && !isRunning && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Test Results</Text>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>{results.length}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#10B981' }]}>{passedCount}</Text>
                  <Text style={styles.summaryLabel}>Passed</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#EF4444' }]}>{failedCount}</Text>
                  <Text style={styles.summaryLabel}>Failed</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryNumber, { color: '#F59E0B' }]}>{warningCount}</Text>
                  <Text style={styles.summaryLabel}>Warnings</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Detailed Results */}
        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detailed Results</Text>
            <View style={styles.resultsCard}>
              {results.map((result, index) => (
                <View key={index} style={styles.resultItem}>
                  <View style={styles.resultHeader}>
                    <View style={styles.resultLeft}>
                      {getStatusIcon(result.status)}
                      <Text style={styles.resultName}>{result.name}</Text>
                    </View>
                    <Text style={styles.resultDuration}>{result.duration}ms</Text>
                  </View>
                  <Text style={[styles.resultMessage, { color: getStatusColor(result.status) }]}>
                    {result.message}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* API Status Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What's Being Tested</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Ionicons name="eye" size={20} color="#2563EB" />
              <Text style={styles.infoText}>Google Vision API - OCR text extraction</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="server" size={20} color="#2563EB" />
              <Text style={styles.infoText}>Supabase - Database connection & storage</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="mic" size={20} color="#2563EB" />
              <Text style={styles.infoText}>OpenAI - Whisper API & GPT integration</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="create" size={20} color="#2563EB" />
              <Text style={styles.infoText}>Database operations - CRUD functionality</Text>
            </View>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          <View style={styles.infoCard}>
            <Text style={styles.troubleText}>
              • Check your .env file has all required API keys{'\n'}
              • Ensure Google Vision API is enabled in Cloud Console{'\n'}
              • Verify Supabase project is active and accessible{'\n'}
              • Confirm OpenAI API key has sufficient credits{'\n'}
              • Check network connectivity and firewall settings
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  headerRight: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    lineHeight: 24,
  },
  runButton: {
    backgroundColor: '#2563EB',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  resultsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  resultName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginLeft: 8,
  },
  resultDuration: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  resultMessage: {
    fontSize: 14,
    marginLeft: 32,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 12,
    flex: 1,
  },
  troubleText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});