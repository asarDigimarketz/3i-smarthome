import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, View, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '../../config';
import { useAuth } from '../utils/AuthContext';
import { getAccessibleRoutes } from '../utils/permissions';

export default function SplashScreen() {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated, user, userType, loading: authLoading } = useAuth();

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

        const data = response.data as any;
        if (data.success && data.generalData) {
          const generalData = data.generalData;
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
      } catch (error: any) {
        console.error('❌ Error fetching logo for Splash:', error?.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  // Handle navigation based on authentication status and permissions
  useEffect(() => {
    if (!authLoading) {
      const timer = setTimeout(() => {
        if (isAuthenticated && user) {
          console.log('🔀 Splash navigation - User authenticated:', user.email);
          console.log('🔀 User permissions:', user.permissions);
          console.log('🔀 User type:', userType);
          
          if (userType === 'admin') {
            // Admin users can access all routes, default to tabs
            console.log('👑 Admin user, redirecting to tabs');
            router.replace('/(tabs)');
          } else {
            // Employee users - redirect to first accessible route
            const accessibleRoutes = getAccessibleRoutes(user);
            console.log('👤 Employee accessible routes:', accessibleRoutes);
            
            if (accessibleRoutes.length > 0) {
              // Use the first accessible route from getAccessibleRoutes
              const firstRoute = accessibleRoutes[0];
              console.log(`🎯 First accessible route: ${firstRoute}`);
              
              // Map the route to the correct mobile path
              let targetRoute = null;
              
              switch (firstRoute) {
                case '/':
                  targetRoute = '/(tabs)';
                  break;
                case '/proposal':
                  targetRoute = '/(tabs)/proposal';
                  break;
                case '/projects':
                  targetRoute = '/(tabs)/projects';
                  break;
                case '/tasks':
                  targetRoute = '/(tabs)/tasks';
                  break;
                case '/customer':
                  targetRoute = '/(tabs)/customer';
                  break;
                case '/employee':
                  targetRoute = '/(any)/employee';
                  break;
                case '/notifications':
                  targetRoute = '/(any)/notifications';
                  break;
                case '/settings':
                  targetRoute = '/(any)/settings';
                  break;
                default:
                  targetRoute = '/(tabs)';
              }
              
              console.log(`🚀 Navigating to: ${targetRoute}`);
              router.replace(targetRoute as any);
            } else {
              console.log('❌ No accessible routes, redirecting to employee page');
              router.replace('/(any)/employee');
            }
          }
        } else {
          // User is not logged in, redirect to login
          console.log('🔐 User not authenticated, redirecting to login');
          router.replace('/(auth)/login');
        }
      }, 2000); // Reduced delay for better UX
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, userType, authLoading]);

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {loading || authLoading ? (
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