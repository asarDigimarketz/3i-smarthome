import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Bell, BriefcaseBusiness, ChartColumn, ChevronDown, ChevronRight, FolderKanban, Home, ListChecks, Settings, Users } from 'lucide-react-native';
import { useState } from 'react';
import { Animated, Image, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Sidebar = ({ isVisible, onClose }) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const menuItems = [
    { icon: Home, label: 'Home', route: '/' },
    { icon: ChartColumn , label: 'Proposal', route: '/proposal' },
    { icon: FolderKanban, label: 'Project', route: '/projects' },
    { icon: ListChecks, label: 'Task', route: '/tasks' },
    { icon: Users, label: 'Customer', route: '/customer' },
    { icon: BriefcaseBusiness, label: 'Employee', route: '/employee' },
    { icon: Bell, label: 'Notification', route: '/notifications' },
  ];

  const settingsOptions = [
    { label: 'General', route: '/settings', color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Employee', route: '/settings/Employee', color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Email Configuration', route: '/settings/EmailConfigure', color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Notification', route: '/settings/NotificationConfigure', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  ];

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
              <Image 
                source={require('../../../assets/icons/image14.png')} 
                className="w-[160px] h-14"
                resizeMode="contain"
              />
            </View>
          </View>
        </LinearGradient>

        <View className="flex-1 px-6 pt-8">
          <View className="flex-1">
            {menuItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                className="flex-row items-center mb-4"
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

              {/* Settings Dropdown Section */}
              <View className="relative mb-4">
                <TouchableOpacity 
                  className="flex-row items-center justify-between h-12"
                  onPress={() => setIsSettingsOpen(!isSettingsOpen)}
                >
                  <View className="flex-row items-center">
                    <Settings size={23} color="#4B5563" strokeWidth={1.5} />
                    <Text className="text-gray-600 text-base font-medium ml-4">Settings</Text>
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
                    {settingsOptions.map((item, index) => (
                      <TouchableOpacity
                        key={index}
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

                <LinearGradient
                  colors={['#dc2626', '#111827']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 10
                  }}
                  className="mt-4"
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