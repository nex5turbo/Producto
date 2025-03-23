'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/app/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Package, AlertCircle, CheckCircle, Loader2, X, Download } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

type GenerateSession = {
  id: string;
  created_at: string;
  product_name: string;
  product_description: string;
  product_price: string;
  product_category: string;
  sample_image_urls: string[];
  status: 'pending' | 'processing' | 'error' | 'completed';
  generated_image_urls: string[];
  queries: any[];
};

type UserData = {
  session_ids: string[];
};

export default function ActivityHistory({ userId }: { userId: string }) {
  const [history, setHistory] = useState<GenerateSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivityHistory = async () => {
      try {
        // First, get the user's session_ids
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('session_ids')
          .eq('id', userId)
          .single();
        console.log("userData", userData);
        if (userError) throw userError;

        if (userData?.session_ids && userData.session_ids.length > 0) {
          // Use session_ids to get data from the generate_session table
          const { data: sessionData, error: sessionError } = await supabase
            .from('generate_session')
            .select('*')
            .in('id', userData.session_ids)
            .order('created_at', { ascending: false });

          if (sessionError) throw sessionError;
          setHistory(sessionData || []);
        } else {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error loading activity history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityHistory();
  }, [userId]);

  // Download images as a ZIP file
  const downloadImagesAsZip = async (item: GenerateSession) => {
    if (!item.generated_image_urls || item.generated_image_urls.length === 0) {
      return;
    }

    try {
      setDownloading(item.id);
      const zip = new JSZip();
      const imageFolder = zip.folder(item.product_name);

      // Perform fetch requests in parallel for all image URLs
      const fetchPromises = item.generated_image_urls.map(async (url, index) => {
        try {
          const response = await fetch(url);
          if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);
          
          const blob = await response.blob();
          const extension = getImageExtension(url);
          imageFolder?.file(`image_${index + 1}${extension}`, blob);
          return true;
        } catch (error) {
          console.error(`Error downloading image ${index + 1}:`, error);
          return false;
        }
      });

      // Wait for all image downloads to complete
      await Promise.all(fetchPromises);

      // Create and download the ZIP file
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${item.product_name}.zip`);
    } catch (error) {
      console.error('Error creating zip file:', error);
      alert('An error occurred while downloading. Please try again.');
    } finally {
      setDownloading(null);
    }
  };

  // Extract image extension from URL
  const getImageExtension = (url: string): string => {
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const lowercaseUrl = url.toLowerCase();
    
    for (const ext of extensions) {
      if (lowercaseUrl.includes(ext)) {
        return ext;
      }
    }
    
    // If no extension is found, use the default value .jpg
    return '.jpg';
  };

  const getStatusIcon = (status: GenerateSession['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: GenerateSession['status']) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'processing':
        return 'Processing';
      case 'error':
        return 'Error Occurred';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const handleImageClick = (url: string) => {
    setSelectedImage(url);
  };

  const handleCloseViewer = () => {
    setSelectedImage(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-50 rounded-xl p-8 text-center"
      >
        <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-500">Nothing to show yet</p>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4 hover:border-primary/20 hover:shadow-sm transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {item.product_name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {item.product_category}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    <time dateTime={item.created_at}>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                  </div>
                </div>
                
                {item.generated_image_urls && item.generated_image_urls.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {item.generated_image_urls.map((url, idx) => (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-lg border border-gray-200"
                        onClick={() => handleImageClick(url)}
                      >
                        <img
                          src={url}
                          alt={`Generated ${item.product_name} ${idx + 1}`}
                          className="h-full w-full object-cover transition-transform hover:scale-105"
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
                
                <div className="mt-2 flex items-center gap-2 justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`
                      inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                      ${item.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                      ${item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${item.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
                      ${item.status === 'error' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {getStatusText(item.status)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.product_price}
                    </span>
                  </div>
                  
                  {/* 다운로드 버튼 */}
                  {item.status === 'completed' && item.generated_image_urls && item.generated_image_urls.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => downloadImagesAsZip(item)}
                      disabled={downloading === item.id}
                      className={`
                        flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium 
                        ${downloading === item.id 
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                          : 'bg-primary/10 text-primary hover:bg-primary/20'}
                        transition-colors
                      `}
                    >
                      {downloading === item.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Downloading...</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-3 h-3" />
                          <span>Download images</span>
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseViewer}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseViewer}
                className="absolute -top-4 -right-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
              <img
                src={selectedImage}
                alt="Full size preview"
                className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 