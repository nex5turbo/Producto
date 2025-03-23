'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { uploadImagesToSupabase } from '@/app/lib/supabase';
import { useAuth } from '@/app/context/AuthContext';

export default function ProductPage() {
  const { user } = useAuth();
  const [productImages, setProductImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [resultPage, setResultPage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [productInfo, setProductInfo] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageStyle: 'modern'
  });

  // 알림 표시 함수
  const showAlertMessage = (message: string) => {
    setAlertMessage(message);
    setShowAlert(true);
    
    // 5초 후 알림 숨기기
    setTimeout(() => {
      setShowAlert(false);
    }, 5000);
  };

  const handleProductImagesDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const newImages = acceptedFiles.map(file => URL.createObjectURL(file));
      setProductImages([...productImages, ...newImages]);
      setImageFiles([...imageFiles, ...acceptedFiles]);
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...productImages];
    const newFiles = [...imageFiles];
    newImages.splice(index, 1);
    newFiles.splice(index, 1);
    setProductImages(newImages);
    setImageFiles(newFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generateProductPage = () => {
    if (productImages.length > 0) {
      setIsLoading(true);
      // In a real app, this would call an AI API to generate the detail page
      setTimeout(() => {
        // Sample image URL (in a real app, this would be replaced with a generated HTML/image URL)
        setResultPage("https://images.unsplash.com/photo-1542744094-24638eff58bb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80");
        setIsLoading(false);
        
        // 알림 표시
        showAlertMessage('Image generation is in process. You can check out the result in My Page tab.');
      }, 2000);
    }
  };

  const handleCreateProduct = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      setIsLoading(true);
      console.log("processing image files");
      const imageUrls = await uploadImagesToSupabase(imageFiles);
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...productInfo,
          imageUrls: imageUrls,
          userId: user.id,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (data.success) {
        // 알림 표시
        showAlertMessage('Image generation is in process. You can check out the result in My Page tab.');

        // Reset form
        setProductInfo({
          name: '',
          description: '',
          price: '',
          category: '',
          imageStyle: 'modern'
        });
        setProductImages([]);
        setImageFiles([]);
        setResultPage(null);
      } else {
        // Handle specific error cases
        if (data.missingFields) {
          showAlertMessage(`Please fill in all required fields: ${data.missingFields.join(', ')}`);
        } else {
          showAlertMessage(data.message || 'Failed to create product. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error creating product:', error);
      showAlertMessage('An error occurred while creating the product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const productDropzone = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    onDrop: handleProductImagesDrop
  });

  // Example images for demo purposes
  const defaultProductImages = [
    "https://images.unsplash.com/photo-1523381294911-8d3cead13475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1560343090-f0409e92791a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  ];

  return (
    <section id="fitting-room" className="section bg-white">
      <div className="container">
        {/* Custom Alert Component */}
        {showAlert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-0 right-0 mx-auto max-w-md bg-gradient-to-r from-primary/90 to-secondary/90 text-white p-4 rounded-lg shadow-lg z-50 flex items-center"
            style={{ width: "90%", maxWidth: "500px" }}
          >
            <div className="bg-white rounded-full p-2 mr-3 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-grow">
              <p className="text-sm font-medium">{alertMessage}</p>
            </div>
            <button 
              onClick={() => setShowAlert(false)}
              className="ml-3 p-1 hover:bg-white/20 rounded-full transition-colors flex-shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}

        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-4">Product Image Generator</h2>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-6">
            {/* Product Image Upload Section - 모던한 디자인으로 개선 */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gradient-to-br from-white to-gray-50 shadow-md rounded-xl p-8 w-full"
            >
              
              <div
                {...productDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all min-h-[220px] flex flex-col items-center justify-center ${
                  productDropzone.isDragActive 
                    ? 'border-primary bg-primary/5 shadow-inner' 
                    : 'border-gray-300 hover:border-secondary/70 hover:bg-gray-50/50'
                }`}
              >
                <input {...productDropzone.getInputProps()} />
                <div className="space-y-4 mb-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-base font-medium text-gray-700">Drag and drop multiple product images</p>
                  <p className="text-sm text-gray-500">or click to browse your files</p>
                  <p className="text-xs text-gray-400 mt-2">Upload images from different angles for better results</p>
                </div>

                {/* Uploaded image previews - 향상된 레이아웃 */}
                {productImages.length > 0 && (
                  <div className="w-full bg-white p-4 rounded-lg shadow-sm mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">Uploaded images ({productImages.length})</p>
                      {productImages.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProductImages([]);
                            setImageFiles([]);
                          }}
                          className="text-xs text-red-500 hover:text-red-700"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {productImages.map((img, index) => (
                        <div key={index} className="relative group aspect-square rounded-lg overflow-hidden shadow-sm">
                          <img src={img} alt={`Product ${index+1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button 
                              className="bg-white rounded-full p-1.5 transform transition-transform hover:scale-110"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sample Images - 더 모던한 디자인 */}
                {productImages.length === 0 && (
                  <div className="grid grid-cols-2 gap-4 mt-6 max-w-md mx-auto">
                    {defaultProductImages.map((img, index) => (
                      <div key={index} className="overflow-hidden rounded-lg shadow-sm aspect-square">
                        <img 
                          src={img} 
                          alt={`Sample product ${index+1}`} 
                          className="h-full w-full object-cover transition-transform hover:scale-105" 
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info Input Area - 모던하게 개선된 UI */}
              <div className="mt-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={productInfo.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="Enter product name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                      <input
                        type="text"
                        id="price"
                        name="price"
                        value={productInfo.price}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="e.g., $29.99"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <input
                        type="text"
                        id="category"
                        name="category"
                        value={productInfo.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                        placeholder="e.g., Clothing, Electronics"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                      <textarea
                        id="description"
                        name="description"
                        value={productInfo.description}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
                        placeholder="Enter a brief description of the product"
                      ></textarea>
                    </div>
                  </div>
                </div>

                {/* Image Style 부분 삭제됨 */}
              </div>

              {/* Create Product Button - 모던한 스타일로 개선 */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleCreateProduct}
                  disabled={isLoading}
                  className="px-8 py-3 bg-primary text-white rounded-lg shadow-md hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 