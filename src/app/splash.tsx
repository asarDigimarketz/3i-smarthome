import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../config';

export default function SplashScreen() {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        console.log('🔄 Fetching logo from API for Splash...');
        
        const response = await axios.get(
          `${API_CONFIG.API_URL}/api/settings/general`,
          {
            headers: {
              'x-api-key': API_CONFIG.API_KEY,
            },
            timeout: 8000, // Shorter timeout for splash screen
          }
        );

        if (response.data.success && response.data.generalData) {
          const generalData = response.data.generalData;
          const rawLogoUrl = generalData.logoUrl || generalData.logo;
          
          if (rawLogoUrl) {
            // Handle different URL formats and fix localhost issue
            let fullLogoUrl;
            if (rawLogoUrl.startsWith('http://') || rawLogoUrl.startsWith('https://')) {
              fullLogoUrl = rawLogoUrl.replace('http://localhost:5000', API_CONFIG.API_URL)
                                     .replace('https://localhost:5000', API_CONFIG.API_URL);
            } else if (rawLogoUrl.startsWith('/')) {
              fullLogoUrl = `${API_CONFIG.API_URL}${rawLogoUrl}`;
            } else {
              fullLogoUrl = `${API_CONFIG.API_URL}/${rawLogoUrl}`;
            }
            
            console.log('✅ Splash Logo URL found:', fullLogoUrl);
            setLogoUrl(fullLogoUrl);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching logo for Splash:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {loading ? (
        <View className="items-center">
          <ActivityIndicator size="large" color="white" />
          <View style={{ height: 20 }} />
          <Image
            source={require('../../assets/icons/image15.png')}
            style={{ width: 200, height: 70, resizeMode: 'contain', opacity: 0.5 }}
          />
        </View>
      ) : (
        <Image
          source={
            logoUrl 
              ? { uri: logoUrl }
              : require('../../assets/icons/image15.png')
          }
          style={{ width: 200, height: 70, resizeMode: 'contain' }}
          onError={() => {
            console.log('❌ Failed to load logo in Splash, using fallback');
          }}
        />
      )}
    </View>
  );
} 