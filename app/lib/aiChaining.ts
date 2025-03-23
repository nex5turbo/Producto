import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './supabase';
import OpenAI from 'openai';

// Get API keys from environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const CHATGPT_API_KEY = process.env.CHATGPT_API_KEY;

const openai = new OpenAI({
  apiKey: CHATGPT_API_KEY
});

interface ImagePrompt {
  imageIndexToUse: number;
  prompt: string;
}

interface ChatGPTResponse {
  prompts: ImagePrompt[];
}

// Query ChatGPT to determine if additional images should be generated
export const getImageRequirementsFromChatGPT = async (
    sessionId: string,
    productName: string,
    productDescription: string,
    productCategory: string,
    productPrice: string,
    imageUrls: string[],
): Promise<ChatGPTResponse> => {
  console.log("chatgpt started", sessionId, productName, productDescription, productCategory, productPrice, imageUrls);
  const systemPrompt = 
  `
You are a professional product photography expert. 
The user will provide between 1 to 5 product images along with the product's name, 
description, category, and price. Based on these provided images and information, 
you will create detailed image-to-image prompts to generate 16 new product images. 
Each newly generated image must be based on exactly one of the user's provided images.
Answer in JSON format with the following structure:
{
    "prompts": [
        {
        "imageIndexToUse": index of the provided image to be used (starting from 0),
        "prompt": detailed prompt for generating the new image
        }
    ]
}
Important guidelines:
•	Exactly 16 image prompts must be generated.
•	Each prompt must clearly describe how to artistically enhance or modify the chosen original image to make it visually appealing, professional, and relevant to the provided product details.
•	Ensure variety in style, composition, lighting, background settings, and product presentation across all 16 images.
•	Clearly reference the original provided image index (imageIndexToUse) for each prompt.
•	If the product type is fashion, at least 8 images include human model wearing the product.
•	Never include any text in the images.
Proceed when the user provides the required product images and information.
  `;

  const userPrompt = 
  `
Product name: ${productName}
Product description: ${productDescription}
Product category: ${productCategory}
Product price: ${productPrice}
  `;

  console.log("chatgpt started");
  console.log(userPrompt);
  console.log(imageUrls);
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: userPrompt
            },
            ...imageUrls.map((url) => ({
              type: "image_url" as const,
              image_url: {
                url
              }
            }))
          ] as any
        }
      ],
      response_format: { type: "json_object" }
    });

    console.log("response data", response);
    const resultText = response.choices[0].message.content;
    console.log("resultText", resultText);
    
    if (!resultText) {
      throw new Error('No content in response');
    }

    try {
      const jsonResult = JSON.parse(resultText) as ChatGPTResponse;
      const forSupabase = jsonResult.prompts.map(p => p);
  
      const { data, error } = await supabase
          .from('generate_session')
          .update({
              queries: forSupabase
          })
          .eq('id', sessionId)
  
      return jsonResult;
    } catch (error) {
      console.error('Error parsing ChatGPT response:', error);
      throw new Error('Failed to parse ChatGPT response as JSON');
    }
  } catch(error) { 
    console.error('Error in getImageRequirementsFromChatGPT:', error);
    throw error;
  }
};

// Generate images with Gemini
export const generateImagesWithGemini = async (prompts: ImagePrompt[], imageUrls: string[]): Promise<string[]> => {
  try {
    const uploadedUrls: string[] = [];
    
    for (const prompt of prompts) {
      const sourceImage = imageUrls[prompt.imageIndexToUse];
      console.log("sourceImage", sourceImage);
      
      // Fetch and convert source image to base64
      const imageResponse = await axios.get(sourceImage, { responseType: 'arraybuffer' });
      const base64Image = Buffer.from(imageResponse.data).toString('base64');
      console.log("base64Image", base64Image.length);
      
      // Call Gemini API
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{
            parts: [
              { text: "Edit this image according to the following description: " + prompt.prompt + " For online shop product image." },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Image
                }
              }
            ]
          }],
          generationConfig: { responseModalities: ['Text', 'Image'] }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Extract base64 image data from response
      const generatedImageData = response.data.candidates[0].content.parts
        .find((part: any) => part.inlineData?.mimeType?.startsWith('image/'))
        ?.inlineData.data;

      if (!generatedImageData) {
        uploadedUrls.push("https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.flaticon.com%2Fkr%2Ffree-icon%2Ferror-message_2581801&psig=AOvVaw0MjiWt0cjSfV373Vesfu3s&ust=1742626059710000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCKj8gozKmowDFQAAAAAdAAAAABAE");
        // throw new Error('No image data received from Gemini API');
      }

      // Upload directly to Supabase
      const fileName = `${uuidv4()}.jpg`;
      const fileBuffer = Buffer.from(generatedImageData, 'base64');

      const { data, error } = await supabase.storage
        .from('producto')
        .upload(`products/${fileName}`, fileBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
          upsert: false
        });
      console.log("before error");
      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('producto')
        .getPublicUrl(`products/${fileName}`);

      uploadedUrls.push(publicUrl);
    }

    return uploadedUrls;
  } catch (error) {
    console.error('Error in generateImagesWithGemini:', error);
    throw error;
  }
};

// Execute the entire chaining process
export const createProductDetailImages = async (
    sessionId: string,
    productName: string,
    productDescription: string,
    productCategory: string,
    productPrice: string,
    uploadedImageUrls: string[],
): Promise<string[]> => {
  try {
    const additionalImageDescriptions = await getImageRequirementsFromChatGPT(
        sessionId,
        productName,
        productDescription,
        productCategory,
        productPrice,
        uploadedImageUrls,
    );

    const prompts = additionalImageDescriptions.prompts.map(p => p);
    // 3. Generate additional images with Gemini
    const generatedImages = await generateImagesWithGemini(prompts, uploadedImageUrls);

    // Final image array (uploaded images + generated images)
    return [...generatedImages];
  } catch (error) {
    throw error;
  }
}; 