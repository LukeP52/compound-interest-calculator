'use client';

import { useEffect, useState } from 'react';

interface AdSenseAdProps {
  slot: string;
  style?: React.CSSProperties;
  format?: string;
  className?: string;
  responsive?: boolean;
}

const AdSenseAd: React.FC<AdSenseAdProps> = ({ 
  slot, 
  style = { display: 'block' }, 
  format = 'auto',
  className = '',
  responsive = true 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Only load ads after the page content is loaded
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 2000); // 2 second delay to ensure content loads first

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;

    try {
      // Check if adsbygoogle is available
      if (typeof window !== 'undefined' && (window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle) {
        const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
        (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle = adsbygoogle;
        adsbygoogle.push({});
      }
    } catch (error) {
      console.log('AdSense error:', error);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Advertisement</span>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-1040597080432802"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      ></ins>
    </div>
  );
};

export default AdSenseAd;
