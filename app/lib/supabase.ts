import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadImagesToSupabase = async (images: File[]): Promise<string[]> => {
  try {
    const uploadPromises = images.map(async (image) => {
      // 파일 이름 생성 (타임스탬프 + 원본 파일명)
      // Generate file name (timestamp + original file name)
      const fileName = `${Date.now()}-${image.name.replace(/[^a-zA-Z0-9.]/g, '')}`;
      const filePath = `products/${fileName}`;

      // 이미지를 ArrayBuffer로 변환
      // Convert image to ArrayBuffer
      const arrayBuffer = await image.arrayBuffer();
      const fileBuffer = Buffer.from(arrayBuffer);

      // Supabase Storage에 업로드
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('producto')
        .upload(filePath, fileBuffer, {
          contentType: image.type,
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Error uploading image:', error);
        throw error;
      }

      // 업로드된 파일의 공개 URL 가져오기
      // Get public URL of the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('producto')
        .getPublicUrl(filePath);

      return publicUrl;
    });

    // 모든 업로드 완료 대기
    // Wait for all uploads to complete
    const uploadedUrls = await Promise.all(uploadPromises);
    return uploadedUrls;

  } catch (error) {
    console.error('Error in uploadImagesToSupabase:', error);
    throw error;
  }
}; 