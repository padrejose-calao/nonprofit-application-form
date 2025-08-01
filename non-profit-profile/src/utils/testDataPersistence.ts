import { netlifySettingsService } from '../services/netlifySettingsService';
import { netlifyContactService } from '../services/netlifyContactService';
import { netlifyFormService } from '../services/netlifyFormService';
import { documentService } from '../services/documentService';
import { logger } from './logger';

interface TestResult {
  service: string;
  operation: string;
  success: boolean;
  error?: string;
  details?: unknown;
}

export class DataPersistenceTest {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    logger.debug('🧪 Starting end-to-end data persistence tests...');
    
    // Test 1: Settings Service
    await this.testSettingsService();
    
    // Test 2: Contact Service
    await this.testContactService();
    
    // Test 3: Form Service
    await this.testFormService();
    
    // Test 4: Document Service
    await this.testDocumentService();
    
    // Test 5: Auth Token
    await this.testAuthToken();
    
    // Test 6: Complex Data Structures
    await this.testComplexData();
    
    // Test 7: Concurrent Operations
    await this.testConcurrentOperations();
    
    // Test 8: Error Handling
    await this.testErrorHandling();
    
    // Print summary
    this.printSummary();
    
    return this.results;
  }

  private async testSettingsService() {
    logger.debug('\n📋 Testing Settings Service...');
    
    // Test set
    const testKey = 'test_setting_' + Date.now();
    const testValue = { message: 'Hello Netlify', timestamp: new Date().toISOString() };
    
    const setResult = await netlifySettingsService.set(testKey, testValue, 'user');
    this.results.push({
      service: 'SettingsService',
      operation: 'set',
      success: setResult,
      details: { key: testKey, value: testValue }
    });
    
    // Test get
    const getValue = await netlifySettingsService.get(testKey);
    const getSuccess = JSON.stringify(getValue) === JSON.stringify(testValue);
    this.results.push({
      service: 'SettingsService',
      operation: 'get',
      success: getSuccess,
      details: { expected: testValue, received: getValue }
    });
    
    // Test remove
    const removeResult = await netlifySettingsService.remove(testKey);
    this.results.push({
      service: 'SettingsService',
      operation: 'remove',
      success: removeResult,
      details: { key: testKey }
    });
    
    // Verify removal
    const afterRemove = await netlifySettingsService.get(testKey);
    this.results.push({
      service: 'SettingsService',
      operation: 'verify_removal',
      success: afterRemove === null,
      details: { afterRemove }
    });
  }

  private async testContactService() {
    logger.debug('\n👥 Testing Contact Service...');
    
    // Test create contact
    const testContact = {
      id: 'test_contact_' + Date.now(),
      displayName: 'Test Contact',
      firstName: 'Test',
      lastName: 'Contact',
      email: 'test@example.com',
      phone: '555-0123',
      organization: 'Test Org'
    };
    
    try {
      const savedContact = await netlifyContactService.saveContact(testContact);
      this.results.push({
        service: 'ContactService',
        operation: 'saveContact',
        success: true,
        details: { savedContact }
      });
      
      // Test get contacts
      const contacts = await netlifyContactService.getContacts();
      const found = contacts.find(c => c.id === testContact.id);
      this.results.push({
        service: 'ContactService',
        operation: 'getContacts',
        success: !!found,
        details: { totalContacts: contacts.length, found }
      });
      
      // Test delete contact
      const deleteResult = await netlifyContactService.deleteContact(testContact.id);
      this.results.push({
        service: 'ContactService',
        operation: 'deleteContact',
        success: deleteResult,
        details: { contactId: testContact.id }
      });
    } catch (error) {
      this.results.push({
        service: 'ContactService',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testFormService() {
    logger.debug('\n📝 Testing Form Service...');
    
    const testFormData = {
      taxIdentification: {
        taxIdType: 'federal_ein',
        ein: '12-3456789'
      },
      organizationIdentity: {
        orgLegalName: 'Test Organization',
        stateOfIncorporation: 'FL',
        preferredLanguage: 'en',
        operatingLanguages: ['en', 'es']
      }
    };
    
    try {
      // Test save
      const saveResult = await netlifyFormService.saveFormData('basic-information', testFormData);
      this.results.push({
        service: 'FormService',
        operation: 'saveFormData',
        success: saveResult,
        details: { formType: 'basic-information' }
      });
      
      // Test get
      const getData = await netlifyFormService.getFormData('basic-information');
      const dataMatches = JSON.stringify(getData) === JSON.stringify(testFormData);
      this.results.push({
        service: 'FormService',
        operation: 'getFormData',
        success: dataMatches,
        details: { dataMatches, hasData: !!getData }
      });
      
      // Test auto-save
      const autoSaveData = { ...testFormData, autoSaved: true };
      const autoSaveResult = await netlifyFormService.autoSaveFormData('basic-information', autoSaveData);
      this.results.push({
        service: 'FormService',
        operation: 'autoSaveFormData',
        success: autoSaveResult,
        details: { hasAutoSave: true }
      });
    } catch (error) {
      this.results.push({
        service: 'FormService',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testDocumentService() {
    logger.debug('\n📄 Testing Document Service...');
    
    // Document service uses in-memory storage with Netlify backup
    try {
      // Test by checking if service initializes
      const docs = documentService.getDocuments();
      this.results.push({
        service: 'DocumentService',
        operation: 'initialize',
        success: true,
        details: { documentCount: docs.length }
      });
      
      // Test document categories
      const categories = ['general', 'legal', 'financial'];
      categories.forEach(category => {
        const categoryDocs = documentService.getDocumentsByCategory(category);
        this.results.push({
          service: 'DocumentService',
          operation: `getByCategory_${category}`,
          success: true,
          details: { count: categoryDocs.length }
        });
      });
    } catch (error) {
      this.results.push({
        service: 'DocumentService',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testAuthToken() {
    logger.debug('\n🔐 Testing Auth Token...');
    
    try {
      // Test set auth token
      const testToken = 'test_token_' + Date.now();
      await netlifySettingsService.setAuthToken(testToken);
      this.results.push({
        service: 'AuthToken',
        operation: 'setAuthToken',
        success: true,
        details: { tokenSet: true }
      });
      
      // Test get auth token
      const retrievedToken = await netlifySettingsService.getAuthToken();
      this.results.push({
        service: 'AuthToken',
        operation: 'getAuthToken',
        success: retrievedToken === testToken,
        details: { matches: retrievedToken === testToken }
      });
      
      // Clean up
      await netlifySettingsService.setAuthToken(null);
    } catch (error) {
      this.results.push({
        service: 'AuthToken',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testComplexData() {
    logger.debug('\n🔧 Testing Complex Data Structures...');
    
    const complexData = {
      formData: {
        section1: { field1: 'value1', field2: 123, field3: true },
        section2: { nested: { deep: { value: 'deep value' } } },
        arrays: [1, 2, 3, { item: 'array object' }],
        dates: { created: new Date().toISOString(), modified: null }
      },
      metadata: {
        version: '1.0.0',
        lastSaved: new Date().toISOString(),
        checkpoints: ['checkpoint1', 'checkpoint2']
      }
    };
    
    try {
      const key = 'complex_data_test';
      await netlifySettingsService.set(key, complexData, 'organization');
      const retrieved = await netlifySettingsService.get(key);
      
      const matches = JSON.stringify(retrieved) === JSON.stringify(complexData);
      this.results.push({
        service: 'ComplexData',
        operation: 'save_and_retrieve',
        success: matches,
        details: { dataSize: JSON.stringify(complexData).length, matches }
      });
      
      await netlifySettingsService.remove(key);
    } catch (error) {
      this.results.push({
        service: 'ComplexData',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testConcurrentOperations() {
    logger.debug('\n⚡ Testing Concurrent Operations...');
    
    try {
      const operations = [];
      for (let i = 0; i < 5; i++) {
        operations.push(
          netlifySettingsService.set(`concurrent_test_${i}`, { index: i }, 'user')
        );
      }
      
      const results = await Promise.all(operations);
      const allSuccessful = results.every(r => r === true);
      
      this.results.push({
        service: 'ConcurrentOps',
        operation: 'parallel_writes',
        success: allSuccessful,
        details: { operationCount: operations.length, allSuccessful }
      });
      
      // Clean up
      const cleanupOps = [];
      for (let i = 0; i < 5; i++) {
        cleanupOps.push(netlifySettingsService.remove(`concurrent_test_${i}`));
      }
      await Promise.all(cleanupOps);
    } catch (error) {
      this.results.push({
        service: 'ConcurrentOps',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private async testErrorHandling() {
    logger.debug('\n❌ Testing Error Handling...');
    
    // Test with invalid data
    try {
      // Test with undefined key
      const result1 = await netlifySettingsService.get(undefined as any);
      this.results.push({
        service: 'ErrorHandling',
        operation: 'undefined_key',
        success: result1 === null,
        details: { handledGracefully: true }
      });
      
      // Test with circular reference (should handle in service)
      const circular: Record<string, unknown> = { a: 1 };
      circular.self = circular;
      
      const result2 = await netlifySettingsService.set('circular_test', circular, 'user');
      this.results.push({
        service: 'ErrorHandling',
        operation: 'circular_reference',
        success: !result2, // Should fail gracefully
        details: { failedAsExpected: !result2 }
      });
    } catch (error) {
      this.results.push({
        service: 'ErrorHandling',
        operation: 'overall',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  private printSummary() {
    logger.debug('\n📊 Test Summary:');
    logger.debug('================');
    
    const totalTests = this.results.length;
    const passedTests = this.results.filter(r => r.success).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);
    
    logger.debug(`Total Tests: ${totalTests}`);
    logger.debug(`✅ Passed: ${passedTests}`);
    logger.debug(`❌ Failed: ${failedTests}`);
    logger.debug(`Success Rate: ${successRate}%`);
    
    if (failedTests > 0) {
      logger.debug('\n❌ Failed Tests:');
      this.results
        .filter(r => !r.success)
        .forEach(r => {
          logger.debug(`  - ${r.service}.${r.operation}: ${r.error || 'Failed'}`);
          if (r.details) {
            logger.debug(`    Details:`, r.details as any);
          }
        });
    }
    
    logger.debug('\n✅ All tests completed!');
  }
}

// Export a function to run tests from console
export const runDataPersistenceTests = async () => {
  const tester = new DataPersistenceTest();
  return await tester.runAllTests();
};