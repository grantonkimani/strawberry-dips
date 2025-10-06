// Test script to verify save gifts function
// Run this in browser console on your admin page to test

async function testSaveGift() {
  console.log('Testing save gifts function...');
  
  // Test data
  const testGift = {
    name: 'Test Gift Product',
    description: 'This is a test gift product',
    price: 25.99,
    category: 'Flowers',
    image_url: '',
    is_active: true
  };
  
  try {
    // Test POST (create new gift)
    console.log('Testing POST (create new gift)...');
    const createResponse = await fetch('/api/gift-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testGift)
    });
    
    if (createResponse.ok) {
      const createdGift = await createResponse.json();
      console.log('✅ POST successful:', createdGift);
      
      // Test PUT (update gift)
      console.log('Testing PUT (update gift)...');
      const updateResponse = await fetch(`/api/gift-products/${createdGift.giftProduct.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...testGift,
          name: 'Updated Test Gift Product',
          price: 29.99
        })
      });
      
      if (updateResponse.ok) {
        const updatedGift = await updateResponse.json();
        console.log('✅ PUT successful:', updatedGift);
        
        // Test DELETE (cleanup)
        console.log('Testing DELETE (cleanup)...');
        const deleteResponse = await fetch(`/api/gift-products/${createdGift.giftProduct.id}`, {
          method: 'DELETE'
        });
        
        if (deleteResponse.ok) {
          console.log('✅ DELETE successful');
          console.log('🎉 All save gifts functions are working correctly!');
        } else {
          console.log('❌ DELETE failed:', await deleteResponse.text());
        }
      } else {
        console.log('❌ PUT failed:', await updateResponse.text());
      }
    } else {
      console.log('❌ POST failed:', await createResponse.text());
    }
  } catch (error) {
    console.log('❌ Test failed with error:', error);
  }
}

// Run the test
testSaveGift();

