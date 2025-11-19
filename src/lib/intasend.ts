import IntaSend from 'intasend-node';

// IntaSend Configuration
export const INTASEND_CONFIG = {
  publishableKey: process.env.INTASEND_PUBLISHABLE_KEY || '',
  secretKey: process.env.INTASEND_SECRET_KEY || '',
  testMode: process.env.INTASEND_TEST_MODE === 'true',
};

// Log configuration for debugging
console.log('IntaSend Publishable Key configured:', !!INTASEND_CONFIG.publishableKey);
console.log('IntaSend Secret Key configured:', !!INTASEND_CONFIG.secretKey);
console.log('IntaSend Test Mode:', INTASEND_CONFIG.testMode);

// Initialize IntaSend client
export const intasend = new IntaSend(
  INTASEND_CONFIG.publishableKey,
  INTASEND_CONFIG.secretKey,
  INTASEND_CONFIG.testMode
);

// Collection interface for M-Pesa payments
export const collection = intasend.collection();

// Payment data interface
export interface IntaSendPaymentData {
  amount: number;
  currency: string;
  email: string;
  phone_number: string;
  api_ref: string;
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
}

// Create M-Pesa payment
export async function createMpesaPayment(paymentData: IntaSendPaymentData) {
  try {
    // Validate configuration before making API call
    if (!INTASEND_CONFIG.publishableKey || !INTASEND_CONFIG.secretKey) {
      throw new Error('IntaSend API keys are not configured');
    }

    console.log('Creating IntaSend M-Pesa payment:', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      phone: paymentData.phone_number,
      email: paymentData.email,
      testMode: INTASEND_CONFIG.testMode,
      hasPublishableKey: !!INTASEND_CONFIG.publishableKey,
      hasSecretKey: !!INTASEND_CONFIG.secretKey
    });

    const response = await collection.mpesaStkPush({
      amount: paymentData.amount,
      phone_number: paymentData.phone_number,
      email: paymentData.email,
      api_ref: paymentData.api_ref,
      first_name: paymentData.first_name || 'Customer',
      last_name: paymentData.last_name || 'Name',
      address: paymentData.address || 'Nairobi',
      city: paymentData.city || 'Nairobi',
      state: paymentData.state || 'Nairobi',
      zipcode: paymentData.zipcode || '00100',
      country: paymentData.country || 'KE',
    });

    console.log('IntaSend M-Pesa response:', response);
    return response;
  } catch (error) {
    const anyErr: any = error;
    const errorDetails = {
      message: anyErr?.message,
      response: anyErr?.response?.data || anyErr?.data,
      status: anyErr?.response?.status || anyErr?.status,
      statusText: anyErr?.response?.statusText,
      code: anyErr?.code
    };
    
    console.error('IntaSend M-Pesa payment error:', JSON.stringify(errorDetails, null, 2));
    
    // Preserve original error structure for better debugging
    const enhancedError: any = new Error(
      anyErr?.response?.data?.message || 
      anyErr?.message || 
      'Failed to create M-Pesa payment'
    );
    enhancedError.response = anyErr?.response;
    enhancedError.data = anyErr?.data;
    enhancedError.status = anyErr?.response?.status || anyErr?.status;
    throw enhancedError;
  }
}

// Check payment status
export async function checkPaymentStatus(invoiceId: string) {
  try {
    console.log('Checking IntaSend payment status for:', invoiceId);

    const response = await collection.status(invoiceId);
    console.log('IntaSend status response:', response);
    return response;
  } catch (error) {
    console.error('IntaSend status check error:', error);
    throw new Error(`Failed to check payment status: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Create card payment
export async function createCardPayment(paymentData: IntaSendPaymentData) {
  try {
    // Validate configuration before making API call
    if (!INTASEND_CONFIG.publishableKey || !INTASEND_CONFIG.secretKey) {
      throw new Error('IntaSend API keys are not configured');
    }

    console.log('Creating IntaSend card payment:', {
      amount: paymentData.amount,
      currency: paymentData.currency,
      email: paymentData.email,
      testMode: INTASEND_CONFIG.testMode,
      hasPublishableKey: !!INTASEND_CONFIG.publishableKey,
      hasSecretKey: !!INTASEND_CONFIG.secretKey
    });

    const response = await collection.charge({
      amount: paymentData.amount,
      currency: paymentData.currency,
      email: paymentData.email,
      phone_number: paymentData.phone_number,
      api_ref: paymentData.api_ref,
      first_name: paymentData.first_name || 'Customer',
      last_name: paymentData.last_name || 'Name',
      address: paymentData.address || 'Nairobi',
      city: paymentData.city || 'Nairobi',
      state: paymentData.state || 'Nairobi',
      zipcode: paymentData.zipcode || '00100',
      country: paymentData.country || 'KE',
    });

    console.log('IntaSend card payment response:', response);
    console.log('IntaSend card payment checkout URL:', response.checkout_url);
    return response;
  } catch (error) {
    const anyErr: any = error;
    const errorDetails = {
      message: anyErr?.message,
      response: anyErr?.response?.data || anyErr?.data,
      status: anyErr?.response?.status || anyErr?.status,
      statusText: anyErr?.response?.statusText,
      code: anyErr?.code
    };
    
    console.error('IntaSend card payment error:', JSON.stringify(errorDetails, null, 2));
    
    // Preserve original error structure for better debugging
    const enhancedError: any = new Error(
      anyErr?.response?.data?.message || 
      anyErr?.message || 
      'Failed to create card payment'
    );
    enhancedError.response = anyErr?.response;
    enhancedError.data = anyErr?.data;
    enhancedError.status = anyErr?.response?.status || anyErr?.status;
    throw enhancedError;
  }
}

