// Pesapal Configuration
export const PESAPAL_CONFIG = {
  consumerKey: process.env.PESAPAL_CONSUMER_KEY || '',
  consumerSecret: process.env.PESAPAL_CONSUMER_SECRET || '',
  environment: process.env.PESAPAL_ENVIRONMENT || 'sandbox', // sandbox or production
};

// Pesapal API URLs
export const PESAPAL_URLS = {
  sandbox: {
    base: 'https://cybqa.pesapal.com/pesapalv3',
    auth: 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken',
    submitOrder: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/SubmitOrderRequest',
    getTransactionStatus: 'https://cybqa.pesapal.com/pesapalv3/api/Transactions/GetTransactionStatus',
  },
  production: {
    base: 'https://pay.pesapal.com/v3',
    auth: 'https://pay.pesapal.com/v3/api/Auth/RequestToken',
    submitOrder: 'https://pay.pesapal.com/v3/api/Transactions/SubmitOrderRequest',
    getTransactionStatus: 'https://pay.pesapal.com/v3/api/Transactions/GetTransactionStatus',
  }
};

// Generate access token
export async function getPesapalAccessToken(): Promise<string> {
  console.log('Pesapal Config:', {
    consumerKey: PESAPAL_CONFIG.consumerKey ? 'SET' : 'NOT SET',
    consumerSecret: PESAPAL_CONFIG.consumerSecret ? 'SET' : 'NOT SET',
    environment: PESAPAL_CONFIG.environment
  });
  
  const url = PESAPAL_URLS[PESAPAL_CONFIG.environment as keyof typeof PESAPAL_URLS].auth;
  
  try {
    const payload = {
      consumer_key: PESAPAL_CONFIG.consumerKey,
      consumer_secret: PESAPAL_CONFIG.consumerSecret,
    };
    
    console.log('Requesting Pesapal token from:', url);
    console.log('With payload keys:', Object.keys(payload));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('Token response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token error response:', errorText);
      throw new Error(`Failed to get access token: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Token response keys:', Object.keys(data));
    return data.token;
  } catch (error) {
    console.error('Error getting Pesapal access token:', error);
    throw new Error('Failed to get Pesapal access token');
  }
}

// Submit order to Pesapal
export async function submitPesapalOrder(orderData: {
  id: string;
  currency: string;
  amount: number;
  description: string;
  callback_url: string;
  cancellation_url: string;
  notification_id: string;
  billing_address: {
    phone_number: string;
    email_address: string;
    country_code: string;
    first_name: string;
    last_name: string;
  };
}): Promise<any> {
  const accessToken = await getPesapalAccessToken();
  const url = PESAPAL_URLS[PESAPAL_CONFIG.environment as keyof typeof PESAPAL_URLS].submitOrder;

  console.log('Submitting to Pesapal:', {
    url,
    orderData,
    hasToken: !!accessToken
  });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Pesapal API Error Response:', errorText);
      throw new Error(`Failed to submit order: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting Pesapal order:', error);
    throw new Error('Failed to submit Pesapal order');
  }
}

// Get transaction status
export async function getPesapalTransactionStatus(orderTrackingId: string): Promise<any> {
  const accessToken = await getPesapalAccessToken();
  const url = `${PESAPAL_URLS[PESAPAL_CONFIG.environment as keyof typeof PESAPAL_URLS].getTransactionStatus}?orderTrackingId=${orderTrackingId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get transaction status: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting Pesapal transaction status:', error);
    throw new Error('Failed to get Pesapal transaction status');
  }
}