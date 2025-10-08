import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/settings/test-payment
export async function POST(request: NextRequest) {
  try {
    const { paymentMethod } = await request.json();

    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method is required' },
        { status: 400 }
      );
    }

    // Test payment configuration based on method
    let testResult = {};

    switch (paymentMethod) {
      case 'intasend':
        testResult = {
          method: 'IntaSend',
          status: process.env.INTASEND_PUBLISHABLE_KEY ? 'configured' : 'not_configured',
          testMode: process.env.INTASEND_TEST_MODE === 'true',
        };
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid payment method. Only IntaSend is supported.' },
          { status: 400 }
        );
    }

    return NextResponse.json({ 
      message: 'Payment configuration test completed',
      result: testResult
    });
  } catch (error) {
    console.error('Error testing payment configuration:', error);
    return NextResponse.json(
      { error: 'Failed to test payment configuration' },
      { status: 500 }
    );
  }
}
