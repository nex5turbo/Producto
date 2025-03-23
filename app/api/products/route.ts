import { NextResponse } from 'next/server';
import { createProductDetailImages } from '../../lib/aiChaining';
import { supabase } from '../../lib/supabase';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js'
import { v4 as uuidv4 } from 'uuid';

interface ProductRequest {
  name: string;
  description: string;
  price: string;
  category: string;
  imageStyle: string;
  imageUrls: string[];
  userId: string;
}

async function validateImageUrls(urls: string[]): Promise<boolean> {
  try {
    for (const url of urls) {
      const response = await fetch(url, { method: 'HEAD' });
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Error validating image URLs:', error);
    return false;
  }
}

async function saveImagesToStorage(imageUrls: string[]): Promise<string[]> {
  const uploadPromises = imageUrls.map(async (url) => {
    try {
      // Fetch data from image URL
      const response = await fetch(url);
      const blob = await response.blob();

      // Generate file name (timestamp + random string)
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.jpg`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      // Get public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  });

  return Promise.all(uploadPromises);
}

/**
 * 사용자가 충분한 크레딧을 가지고 있는지 확인하는 함수
 * @param userId 사용자 ID
 * @returns 크레딧 충분 여부와 현재 잔액
 */
async function checkUserCredits(userId: string): Promise<{ hasEnoughCredits: boolean, balance: number }> {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      console.error('Error checking user credits:', error);
      return { hasEnoughCredits: false, balance: 0 };
    }
    
    // 데이터가 없으면 크레딧이 없는 것으로 간주
    if (!data) {
      return { hasEnoughCredits: false, balance: 0 };
    }
    
    // 1개 이상의 크레딧이 있는지 확인
    return { 
      hasEnoughCredits: data.balance >= 1,
      balance: data.balance
    };
  } catch (error) {
    console.error('Error in checkUserCredits:', error);
    return { hasEnoughCredits: false, balance: 0 };
  }
}

/**
 * 사용자의 크레딧을 차감하고 사용 내역을 기록하는 함수
 * @param userId 사용자 ID
 * @param currentBalance 현재 잔액
 */
async function chargeUserCredit(userId: string, currentBalance: number): Promise<void> {
  try {
    // 1. 크레딧 차감
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: currentBalance - 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // 2. 크레딧 사용 내역 기록
    const { error: usageError } = await supabase
      .from('credit_usages')
      .insert({
        user_id: userId,
        amount: 1,
        description: 'Credit used for product image generation'
      });
    
    if (usageError) {
      console.error('Error logging credit usage:', usageError);
      // 사용 로그 기록 실패해도 진행은 함
    }
    
  } catch (error) {
    console.error('Error in chargeUserCredit:', error);
    throw error;
  }
}

/**
 * 오류 발생 시 사용자의 크레딧을 환불하는 함수
 * @param userId 사용자 ID
 */
async function refundUserCredit(userId: string): Promise<void> {
  try {
    // 현재 사용자 크레딧 조회
    const { data, error } = await supabase
      .from('user_credits')
      .select('balance')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    
    // 크레딧 환불 (추가)
    const { error: updateError } = await supabase
      .from('user_credits')
      .update({
        balance: data.balance + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      throw updateError;
    }
    
    // 환불 내역 기록
    const { error: usageError } = await supabase
      .from('credit_usages')
      .insert({
        user_id: userId,
        amount: -1, // 음수로 표시하여 환불을 나타냄
        description: 'Refund for error'
      });
    
    if (usageError) {
      console.error('Error logging credit refund:', usageError);
      // 로그 실패해도 계속 진행
    }
    
  } catch (error) {
    console.error('Error in refundUserCredit:', error);
    // 환불 과정에서 오류가 발생해도 애플리케이션은 계속 진행
  }
}

export async function POST(request: Request) {
  let sessionData: any;
  let creditCharged = false;
  let userId: string | undefined;
  
  try {
    const body: ProductRequest = await request.json();
    userId = body.userId;

    // Validate required fields
    const requiredFields = ['name', 'description', 'price', 'category', 'imageStyle', 'imageUrls', 'userId'];
    const missingFields = requiredFields.filter(field => !body[field as keyof ProductRequest]);

    if (missingFields.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields',
        missingFields
      }, { status: 400 });
    }
    
    // Validate image URLs
    if (!body.imageUrls || body.imageUrls.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'At least one image URL is required'
      }, { status: 400 });
    }
    
    // 1. Check if user has enough credits
    const { hasEnoughCredits, balance } = await checkUserCredits(userId);
    
    if (!hasEnoughCredits) {
      return NextResponse.json({
        success: false,
        message: 'Insufficient credits. Please purchase more credits to continue.',
        currentBalance: balance
      }, { status: 402 }); // 402 Payment Required
    }
    
    // 2. Charge user 1 credit
    await chargeUserCredit(userId, balance);
    creditCharged = true;
    
    // Generate a new session ID
    const sessionId = uuidv4();
    
    // Create a new session
    const { data: sessionCreateData, error: sessionError } = await supabase
      .from('generate_session')
      .insert({
        id: sessionId,
        status: 'pending',
        sample_image_urls: body.imageUrls,
        product_name: body.name,
        product_description: body.description,
        product_price: body.price,
        product_category: body.category,
        created_at: new Date().toISOString(),
        generated_image_urls: [],
        queries: []
      })
      .select()
      .single();
    
    if (sessionError) {
        // Refund credit if session creation fails
        console.log(sessionError);
        if (creditCharged && userId) {
          await refundUserCredit(userId);
        }
        
        return NextResponse.json({
          success: false,
          message: 'Failed to create generation session'
        }, { status: 500 });
    }
    
    sessionData = sessionCreateData;
    
    // Get user's current session IDs
    const { data: currentUser, error: userError } = await supabase
        .from('users')
        .select('session_ids')
        .eq('id', userId)
        .single();
        
    if (!currentUser) {
      // Refund credit if user not found
      if (creditCharged && userId) {
        await refundUserCredit(userId);
      }
      
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }
    
    // Update user's session IDs
    const updatedSessionIds = currentUser.session_ids ? [...currentUser.session_ids, sessionId] : [sessionId];
    
    // Update user's session IDs
    const { error } = await supabase
        .from('users')
        .update({ session_ids: updatedSessionIds })
        .eq('id', userId);
        
    if (error) {
      // Refund credit if user update fails
      if (creditCharged && userId) {
        await refundUserCredit(userId);
      }
      
      return NextResponse.json({
        success: false,
        message: 'Failed to update user session data'
      }, { status: 500 });
    }
    
    // Execute AI chaining process
    const generatedImages = await createProductDetailImages(
      sessionId,
      body.name,
      body.description,
      body.category,
      body.price,
      body.imageUrls
    );

    // Update session
    const { data: sessionData2, error: sessionError2 } = await supabase
        .from('generate_session')
        .update({
            generated_image_urls: generatedImages,
            status: 'completed'
        })
        .eq('id', sessionId);
    
    // If all processes were successful, return success response
    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      data: {
        imageUrls: generatedImages
      }
    });
  } catch (error) {
    console.error('Error in product generation:', error);
    
    // If credit was charged but there was an error, refund the credit
    if (creditCharged && userId) {
      await refundUserCredit(userId);
    }
    
    // Update session status to error if it was created
    if (sessionData?.id) {
      const { data: sessionData2, error: sessionError2 } = await supabase
        .from('generate_session')
        .update({
            status: 'error'
        })
        .eq('id', sessionData.id);
    }
    
    return NextResponse.json({
      success: false,
      message: 'Failed to create product'
    }, { status: 500 });
  }
} 

