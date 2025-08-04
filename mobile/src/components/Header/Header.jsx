import { LinearGradient } from 'expo-linear-gradient';
import { Menu } from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import { Image, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { API_CONFIG } from '../../../config';
import NotificationBadge from '../Common/NotificationBadge';
import apiClient from '../../utils/apiClient';

export default function Header({ onMenuPress }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching logo from API for Header...');
        
        const response = await apiClient.get('/api/settings/general');

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
            
          
            setLogoUrl(fullLogoUrl);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching logo for Header:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);
  
  return (
    <LinearGradient 
      colors={["#030303", "#4d0f10"]} 
      className="w-full" 
      style={{ 
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
      }}
    >
      <View className="flex-row items-center justify-between w-full p-6">
        {loading ? (
          <View className="w-[160px] h-14 items-center justify-center">
            <ActivityIndicator size="small" color="white" />
          </View>
        ) : (
          <Image 
            source={
              logoUrl 
                ? { uri: logoUrl }
                : require('../../../assets/icons/image14.png')
            } 
            className="w-[160px] h-14"
            resizeMode="contain"
            onError={() => {
              console.log('❌ Failed to load logo in Header, using fallback');
            }}
          />
        )}

        <View className="flex-row items-center space-x-3 gap-6">
        <NotificationBadge 
            onPress={() => router.push('/notifications')}
            size={20}
            showCount={true}
            
            style={{
              backgroundColor: 'white',
              color: 'white'
            }}
          />
          <TouchableOpacity 
            onPress={onMenuPress}
            className="w-10 h-10 items-center justify-center rounded-lg bg-white/10"
          >
            <Menu size={24} color="white" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>

      </View>
    </LinearGradient>
  );
}