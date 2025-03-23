import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

// PayPal API 기본 URL 설정 - 환경에 따라 다른 URL 사용
// Setting up PayPal API base URL - Using different URLs depending on the environment
const PAYPAL_API_URL = process.env.NODE_ENV === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

// PayPal 자격 증명 설정 - 환경에 따라 다른 자격 증명 사용
// Setting up PayPal credentials - Using different credentials depending on the environment
const getPayPalCredentials = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET
    };
  } else {
    return {
      clientId: process.env.NEXT_PUBLIC_PAYPAL_SANDBOX_CLIENT_ID,
      clientSecret: process.env.PAYPAL_SANDBOX_CLIENT_SECRET
    };
  }
};

// 현재 환경 로깅
// Logging current environment
console.log('Current environment:', process.env.NODE_ENV);
console.log('PayPal API URL:', PAYPAL_API_URL);

// PayPal Access Token 발급 함수
// Function to get PayPal Access Token
async function getPayPalAccessToken() {
  const { clientId, clientSecret } = getPayPalCredentials();

  console.log('Using PayPal environment:', process.env.NODE_ENV === 'production' ? 'Production' : 'Sandbox');
  console.log('clientId', clientId);
  console.log('clientSecret', clientSecret?.substring(0, 3) + '***');
  
  if (!clientId || !clientSecret) {
    throw new Error('PayPal environment variables are not set.');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${auth}`,
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    console.log('Token response status:', response.status);
    
    if (!response.ok) {
      console.error('Failed to get PayPal token response:', data);
      throw new Error(`Failed to get PayPal token: ${data.error_description || data.error || 'Unknown error'}`);
    }

    return data.access_token;
  } catch (error) {
    console.error('Exception occurred while getting PayPal token:', error);
    throw error;
  }
}

// 결제 생성 엔드포인트
// Payment creation endpoint
export async function POST(req: NextRequest) {
  try {
    const { packageId, userId } = await req.json();

    if (!packageId || !userId) {
      return NextResponse.json(
        { error: 'Package ID and User ID are required.' },
        { status: 400 }
      );
    }

    console.log('packageId', packageId);
    console.log('userId', userId);

    // 패키지 정보 조회
    // Retrieving package information
    const { data: packageData, error: packageError } = await supabase
      .from('credit_packages')
      .select('*')
      .eq('id', packageId)
      .single();

    console.log('packageData', packageData);

    if (packageError || !packageData) {
      return NextResponse.json(
        { error: 'Package not found.' },
        { status: 404 }
      );
    }

    // PayPal Access Token 발급
    // Getting PayPal Access Token
    const accessToken = await getPayPalAccessToken();
    console.log('Access token successfully obtained');

    // PayPal 결제 생성
    // Creating PayPal payment
    const order = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: packageData.price.toString(),
            },
            description: `${packageData.name} - ${packageData.credits} Credits`,
            custom_id: JSON.stringify({
              userId,
              packageId,
              credits: packageData.credits,
            }),
          },
        ],
      }),
    });

    const orderData = await order.json();
    console.log('Order creation response status:', order.status);

    if (!order.ok) {
      console.error('Failed to create PayPal order response:', orderData);
      return NextResponse.json(
        { error: 'Failed to create payment', details: orderData },
        { status: 500 }
      );
    }

    // payments 테이블에 결제 정보 저장 (status: pending)
    // Saving payment information to payments table (status: pending)
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: packageData.price,
        currency: 'USD',
        status: 'pending',
        payment_method: 'paypal',
        payment_provider_id: orderData.id,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Failed to save payment information:', paymentError);
      return NextResponse.json(
        { error: 'Failed to save payment information' },
        { status: 500 }
      );
    }

    // 클라이언트 측 createOrder 콜백에서 사용할 주문 ID 반환
    // Returning order ID to be used in client-side createOrder callback
    return NextResponse.json({
      orderId: orderData.id,
      paymentId: paymentData.id
    });
  } catch (error: any) {
    console.error('Error creating PayPal payment:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while creating payment.' },
      { status: 500 }
    );
  }
}

// 결제 캡처 엔드포인트
// Payment capture endpoint
export async function PUT(req: NextRequest) {
  try {
    let orderId;
    try {
      const body = await req.json();
      orderId = body.orderId;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json(
        { error: 'Unable to parse request body. Please check that it is in valid JSON format.' },
        { status: 400 }
      );
    }

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required.' },
        { status: 400 }
      );
    }

    console.log('Order ID capture request:', orderId);

    // PayPal Access Token 발급
    // Getting PayPal Access Token
    const accessToken = await getPayPalAccessToken();

    // PayPal 결제 상태 조회
    // Checking PayPal payment status
    const response = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to check PayPal order status:', response.status);
      const errorData = await response.text();
      console.error('Failed to check PayPal order response:', errorData);
      return NextResponse.json(
        { error: 'Failed to check PayPal order', details: errorData },
        { status: 500 }
      );
    }

    const orderData = await response.json();
    console.log('orderData', orderData);

    // orderData의 유효성 검사
    // Validating orderData
    if (!orderData || typeof orderData !== 'object') {
      console.error('Invalid orderData:', orderData);
      return NextResponse.json(
        { error: 'Invalid order data' },
        { status: 500 }
      );
    }

    // 결제 상태가 COMPLETED가 아닌 경우 (결제 미완료)
    // If payment status is not COMPLETED (payment not completed)
    if (orderData.status !== 'COMPLETED') {
      console.log('Order status is not COMPLETED, attempting to capture');
      // 결제 완료 (capture)
      // Completing payment (capture)
      const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const captureData = await captureResponse.json();
      console.log('PayPal capture response status:', captureResponse.status);

      if (!captureResponse.ok) {
        console.error('Failed to capture PayPal payment response:', captureData);
        return NextResponse.json(
          { error: 'Failed to complete payment', details: captureData },
          { status: 500 }
        );
      }

      // 결제 후 상태 업데이트를 위한 정보 설정
      // Setting information for status update after payment
      orderData.status = captureData.status;
    }

    // 결제 정보 추출
    // Extracting payment information
    if (!orderData.purchase_units || !orderData.purchase_units[0] || !orderData.purchase_units[0].custom_id) {
      console.error('Order data does not contain custom_id:', orderData);
      return NextResponse.json(
        { error: 'Order data format is not correct.' },
        { status: 500 }
      );
    }

    let customId;
    try {
      customId = JSON.parse(orderData.purchase_units[0].custom_id);
    } catch (error) {
      console.error('Error parsing custom_id JSON:', orderData.purchase_units[0].custom_id, error);
      return NextResponse.json(
        { error: 'Failed to parse custom_id' },
        { status: 500 }
      );
    }

    if (!customId || !customId.userId || !customId.packageId || !customId.credits) {
      console.error('Essential information is missing in custom_id:', customId);
      return NextResponse.json(
        { error: 'Essential information is missing in custom_id.' },
        { status: 500 }
      );
    }

    const { userId, packageId, credits } = customId;

    // payments 테이블 업데이트
    // Updating payments table
    const { error: paymentUpdateError } = await supabase
      .from('payments')
      .update({
        status: orderData.status === 'COMPLETED' ? 'completed' : 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('payment_provider_id', orderId);

    if (paymentUpdateError) {
      console.error('Failed to update payment information:', paymentUpdateError);
      return NextResponse.json(
        { error: 'Failed to update payment information' },
        { status: 500 }
      );
    }

    // 결제 완료인 경우에만 크레딧 업데이트
    // Only update credits if payment is completed
    if (orderData.status === 'COMPLETED') {
      // 트랜잭션 시작
      // Starting transaction
      const { data: existingUserCredit, error: userCreditError } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (userCreditError && userCreditError.code !== 'PGRST116') {
        console.error('Failed to check user credits:', userCreditError);
        return NextResponse.json(
          { error: 'Failed to check user credits' },
          { status: 500 }
        );
      }

      // 사용자 크레딧 업데이트 또는 생성
      // Updating or creating user credits
      if (existingUserCredit) {
        // 크레딧 업데이트
        // Updating credits
        const { error: updateError } = await supabase
          .from('user_credits')
          .update({
            balance: existingUserCredit.balance + credits,
            updated_at: new Date().toISOString(),
            last_purchase_date: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Failed to update credits:', updateError);
          return NextResponse.json(
            { error: 'Failed to update credits' },
            { status: 500 }
          );
        }
      } else {
        // 크레딧 생성
        // Creating credits
        const { error: insertError } = await supabase
          .from('user_credits')
          .insert({
            user_id: userId,
            balance: credits,
            last_purchase_date: new Date().toISOString()
          });

        if (insertError) {
          console.error('Failed to create credits:', insertError);
          return NextResponse.json(
            { error: 'Failed to create credits' },
            { status: 500 }
          );
        }
      }

      // 크레딧 거래 내역 추가
      // Adding credit transaction history
      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .select('id')
        .eq('payment_provider_id', orderId)
        .single();

      if (paymentError) {
        console.error('Failed to retrieve payment information:', paymentError);
        return NextResponse.json(
          { error: 'Failed to retrieve payment information' },
          { status: 500 }
        );
      }

      const { error: transactionError } = await supabase
        .from('credit_transactions')
        .insert({
          user_id: userId,
          amount: credits,
          transaction_type: 'purchase',
          description: `Purchased ${credits} credits`,
          related_payment_id: payment.id,
        });

      if (transactionError) {
        console.error('Failed to save transaction history:', transactionError);
        return NextResponse.json(
          { error: 'Failed to save transaction history' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      status: orderData.status,
      credits: customId.credits
    });
  } catch (error: any) {
    console.error('Error verifying PayPal payment:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while verifying payment.' },
      { status: 500 }
    );
  }
}