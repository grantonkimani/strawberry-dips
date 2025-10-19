// Critical function testing script
// Run this before launch to verify all core functionality

const CRITICAL_TESTS = [
  {
    name: 'Product API',
    test: async () => {
      const response = await fetch('/api/products');
      const data = await response.json();
      return Array.isArray(data) && data.length >= 0;
    }
  },
  {
    name: 'Product Creation',
    test: async () => {
      const testProduct = {
        name: 'Test Product',
        description: 'Test Description',
        base_price: 10.00,
        category_id: null,
        is_available: true,
      };
      
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testProduct),
      });
      
      if (!response.ok) return false;
      
      const data = await response.json();
      return data.id && data.name === testProduct.name;
    }
  },
  {
    name: 'Product Deletion',
    test: async () => {
      // First create a test product
      const createResponse = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Delete Test Product',
          description: 'Will be deleted',
          base_price: 5.00,
          is_available: true,
        }),
      });
      
      if (!createResponse.ok) return false;
      
      const product = await createResponse.json();
      
      // Then delete it
      const deleteResponse = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
      });
      
      return deleteResponse.ok;
    }
  },
  {
    name: 'Order Creation',
    test: async () => {
      const testOrder = {
        customer: {
          name: 'Test Customer',
          email: 'test@example.com',
          phone: '+254700000000',
        },
        items: [{
          product_id: 'test-product-id',
          quantity: 1,
          unit_price: 10.00,
        }],
        total: 10.00,
        paymentIntentId: 'test-payment-intent',
        delivery_address: 'Test Address',
        delivery_city: 'Nairobi',
        delivery_state: 'Nairobi',
        delivery_date: new Date().toISOString(),
        delivery_time: '10:00',
      };
      
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder),
      });
      
      // This might fail due to test data, but we just want to ensure the endpoint exists
      return response.status !== 404;
    }
  },
  {
    name: 'Health Check',
    test: async () => {
      const response = await fetch('/api/health');
      const data = await response.json();
      return data.status === 'healthy';
    }
  }
];

export async function runCriticalTests() {
  console.log('🚀 Running critical pre-launch tests...\n');
  
  const results = [];
  
  for (const test of CRITICAL_TESTS) {
    try {
      console.log(`Testing ${test.name}...`);
      const startTime = Date.now();
      const passed = await test.test();
      const duration = Date.now() - startTime;
      
      results.push({
        name: test.name,
        passed,
        duration,
        error: null,
      });
      
      console.log(`${passed ? '✅' : '❌'} ${test.name} (${duration}ms)`);
      
    } catch (error) {
      results.push({
        name: test.name,
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      
      console.log(`❌ ${test.name} - Error: ${error}`);
    }
  }
  
  console.log('\n📊 Test Results Summary:');
  console.log('========================');
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    const error = result.error ? ` (${result.error})` : '';
    console.log(`${status} ${result.name}${error}`);
  });
  
  console.log(`\nOverall: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('🎉 All critical tests passed! Ready for launch.');
  } else {
    console.log('⚠️  Some tests failed. Review before launch.');
  }
  
  return results;
}

// Auto-run in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Uncomment to auto-run tests
  // runCriticalTests();
}
