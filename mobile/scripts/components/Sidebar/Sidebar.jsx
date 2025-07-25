import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, BriefcaseBusiness, ChartColumn, ChevronDown, ChevronRight, FolderKanban, Home, ListChecks, Settings, Users, LogOut } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Animated, Image, Pressable, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import axios from 'axios';
import { API_CONFIG } from '../../../config';
import { useAuth } from '../../utils/AuthContext';
import { filterMenuItemsByPermissions } from '../../utils/permissions';

const Sidebar = ({ isVisible, onClose }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.isAdmin;

  // Fetch logo from API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching logo from API for Sidebar...');
        
        const response = await axios.get(
          `${API_CONFIG.API_URL}/api/settings/general`,
          {
            headers: {
              'x-api-key': API_CONFIG.API_KEY,
            },
            timeout: 10000,
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
            
          
            setLogoUrl(fullLogoUrl);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching logo for Sidebar:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogo();
  }, []);

  const allMenuItems = [
    { id: 'home', icon: Home, label: 'Home', route: '/' },
    { id: 'proposal', icon: ChartColumn , label: 'Proposal', route: '/proposal' },
    { id: 'project', icon: FolderKanban, label: 'Project', route: '/projects' },
    { id: 'task', icon: ListChecks, label: 'Task', route: '/tasks' },
    { id: 'customer', icon: Users, label: 'Customer', route: '/customer' },
    { id: 'employee', icon: BriefcaseBusiness, label: 'Employee', route: '/employee' },
    { id: 'notification', icon: Bell, label: 'Notification', route: '/notifications' },
  ];

  const allSettingsOptions = [
    { id: 'general', label: 'General', route: '/settings', color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'employee-settings', label: 'Employee', route: '/settings/Employee', color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'email-config', label: 'Email Configuration', route: '/settings/EmailConfigure', color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'notification-config', label: 'Notification', route: '/settings/NotificationConfigure', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

  // Filter menu items based on user permissions
  const menuItems = filterMenuItemsByPermissions(allMenuItems, user);
  const settingsOptions = isAdmin
    ? allSettingsOptions
    : [];

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      {/* Blur Overlay */}
      {isVisible && (
        <Pressable 
          onPress={onClose}
          className="absolute top-0 left-0 right-0 bottom-0 bg-black/30 z-40"
          style={{
            height: '100%',
            width: '100%'
          }}
        />
      )}

      {/* Sidebar Content */}
      <Animated.View
        className={`absolute top-0 right-0 h-full w-72 bg-white z-50 shadow-xl ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
        }}
      >
        <LinearGradient 
          colors={["#030303", "#4d0f10"]} 
          className="w-full rounded-b-xl" 
          start={{ x: 0, y: 0 }} 
          end={{ x: 0, y: 1 }}  
        >
          <View className="p-6 flex-row items-center justify-between w-full">
            <View className="flex-row items-center">
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
                    console.log('❌ Failed to load logo in Sidebar, using fallback');
                  }}
                />
              )}
            </View>
          </View>
        </LinearGradient>

        <View className="flex-1 px-6 pt-8">
          <View className="flex-1">
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center mb-5"
                onPress={() => {
                  router.push(item.route);
                  onClose();
                }}
              >
                <View className="w-8">
                  <item.icon size={22} color="#4B5563" strokeWidth={1.5} />
                </View>
                <Text className="text-gray-600 text-base font-medium ml-4">{item.label}</Text>
              </TouchableOpacity>
            ))}  

            {/* Settings Dropdown Section - Only for Admin */}
            {isAdmin && (
              <View className="relative mb-5">
                <TouchableOpacity
                  className="flex-row items-center justify-between h-12"
                  onPress={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <View className="flex-row items-center">
                    <Settings size={23} color="#4B5563" strokeWidth={1.5} />
                    <Text className="text-gray-600 text-base font-medium ml-5">Settings</Text>
                  </View>
                  <ChevronDown 
                    size={20} 
                    color="#6B7280"
                    style={{ 
                      transform: [{ rotate: isSettingsOpen ? '180deg' : '0deg' }],
                    }} 
                  />
                </TouchableOpacity>

                {isSettingsOpen && (
                  <View className="mt-2 bg-gray-200 rounded-lg shadow-xl overflow-hidden">
                    {settingsOptions.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        onPress={() => {
                          router.push(item.route);
                          setIsSettingsOpen(false);
                          onClose();
                        }}
                        className={`px-4 py-2 border-b border-gray-100 ${
                          router.pathname === item.route ? item.bg : ''
                        }`}
                        activeOpacity={0.7}
                      >
                        <Text className={`text-base font-medium ${
                          router.pathname === item.route ? item.color : 'text-gray-600'
                        }`}>
                          {item.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View className="mb-5">
              <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center ml-1"
              >
                <LogOut size={22} color="#c92125" strokeWidth={1.5} />
                <Text className="text-[#c92125] text-base font-medium ml-5">Logout</Text>
              </TouchableOpacity>
            </View>

            <LinearGradient
              colors={['#dc2626', '#111827']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                borderRadius: 10
              }}
              className="mt-4 "
            >
              <TouchableOpacity 
                onPress={onClose}
                className="w-full py-3 items-center justify-center"
              >
                <ChevronRight size={24} color="white" strokeWidth={2} />
              </TouchableOpacity>
            </LinearGradient>

          </View>
        </View>
      </Animated.View>
    </>
  );
};

export default Sidebar;