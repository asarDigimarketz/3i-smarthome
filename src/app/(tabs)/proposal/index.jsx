import { useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { FlatList, Text, TextInput, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import axios from 'axios';
import FilterTabs from '../../../components/Common/FilterTabs';

// 🔧 NETWORK CONFIGURATION
// Replace 'localhost' with your development machine's IP address
// To find your IP: 
// - Windows: Run 'ipconfig' in cmd, look for IPv4 Address
// - Mac/Linux: Run 'ifconfig' in terminal, look for inet address
// - Or use your machine's local network IP (e.g., 192.168.1.100)
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ Your actual IP address

// Alternative: Use ngrok or similar service to expose localhost
// const API_BASE_URL = 'https://your-ngrok-url.ngrok.io/api';

const ProposalList = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add status options array
  const statusOptions = [
    'All',
    'Hot',
    'Cold',
    'Warm',
    'Scrap',
    'Confirm'
  ];

  // Fetch proposals from API
  const fetchProposals = async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      const params = {
        page: 1,
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      // Add search filter
      if (searchText) {
        params.search = searchText;
      }

      // Add status filter
      if (selectedStatus && selectedStatus !== 'All') {
        params.status = selectedStatus;
      }

      // Add service filter (from activeTab)
      if (activeTab && activeTab !== 'All') {
        params.service = activeTab;
      }

      console.log('📤 Fetching proposals with params:', params);
      console.log('🔗 API URL:', `${API_BASE_URL}/api/proposals`);
      console.log('🔑 API Key:', process.env.EXPO_PUBLIC_API_KEY ? 'Set' : 'Not Set');

      const response = await axios.get(`${API_BASE_URL}/api/proposals`, {
        params,
        headers: {
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
        }
      });

      console.log('📥 API Response Status:', response.status);
      console.log('📥 API Response Data:', response.data);

      if (response.data.success) {
        const proposals = response.data.data.proposals || [];
        console.log('✅ Proposals fetched successfully:', proposals.length, 'items');
        setProposals(proposals);
      } else {
        console.error('❌ API returned success: false');
        console.error('❌ Error message:', response.data.error);
        Alert.alert('Error', response.data.error || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('🚨 Error fetching proposals:');
      console.error('🚨 Error type:', error.name);
      console.error('🚨 Error message:', error.message);
      
      if (error.response) {
        // Server responded with error status
        console.error('🚨 Response status:', error.response.status);
        console.error('🚨 Response headers:', error.response.headers);
        console.error('🚨 Response data:', error.response.data);
        
        let errorMessage = 'Server error occurred';
        if (error.response.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 401) {
          errorMessage = 'Unauthorized. Please check your API key.';
        } else if (error.response.status === 404) {
          errorMessage = 'API endpoint not found. Please check server configuration.';
        } else if (error.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        Alert.alert('Error', errorMessage);
      } else if (error.request) {
        // Network error
        console.error('🚨 Network Error - Request made but no response received');
        console.error('🚨 Request details:', error.request);
        Alert.alert('Network Error', 'No response from server. Please check your internet connection and server status.');
      } else {
        // Other error
        console.error('🚨 Unexpected Error:', error);
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      console.log('🏁 Fetch operation completed');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load proposals on component mount and when filters change
  useEffect(() => {
    fetchProposals();
  }, [searchText, selectedStatus, activeTab]);

  // Transform API data to match component expectations
  const transformProposalData = (apiProposal) => {
    return {
      id: apiProposal._id,
      name: apiProposal.customerName,
      phone: apiProposal.contactNumber,
      email: apiProposal.email,
      address: typeof apiProposal.address === 'object' 
        ? `${apiProposal.address.addressLine || ''}, ${apiProposal.address.city || ''}, ${apiProposal.address.district || ''}, ${apiProposal.address.state || ''}, ${apiProposal.address.country || ''} - ${apiProposal.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim()
        : apiProposal.address || '',
      service: apiProposal.services || 'Unknown',
      description: apiProposal.projectDescription,
      size: apiProposal.size,
      amount: `₹${apiProposal.projectAmount?.toLocaleString('en-IN') || '0'}`,
      status: apiProposal.status,
      comment: apiProposal.comment,
      date: new Date(apiProposal.date).toLocaleDateString('en-IN') || new Date(apiProposal.createdAt).toLocaleDateString('en-IN')
    };
  };

  const ProposalCard = ({ item }) => {
    const transformedItem = transformProposalData(item);
    
    const getServiceStyles = (service) => {
      switch (service) {
        case 'Home Cinema':
          return 'bg-services-cinema-light border-b-2 border-services-cinema-border';
        case 'Home Automation':
          return 'bg-services-automation-light border-b-2 border-services-automation-border';
        case 'Security System':
          return 'bg-services-security-light border-b-2 border-services-security-border';
        case 'Outdoor Audio Solution':
          return 'bg-services-audio-light border-b-2 border-services-audio-border';
        default:
          return 'bg-services-default-light border-b-2 border-services-default-border';
      }
    };

    const getStatusStyle = (status) => {
      switch (status) {
        case 'Hot':
          return 'bg-[#f7dbdd]';
        case 'Cold':
          return 'bg-[#d9fcff]';
        case 'Warm':
          return 'bg-[#ffdeb0]';
        case 'Scrap':
          return 'bg-[#fff4e5]';
        case 'Confirmed':
          return 'bg-[#beeecf]';
        default:
          return 'bg-gray-100';
      }
    };

    return (
      <TouchableOpacity 
        className={`p-4 mb-3 rounded-lg shadow-sm ${getServiceStyles(transformedItem.service)}`}
        onPress={() => router.push(`/proposal/${transformedItem.id}`)}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">{transformedItem.name}</Text>
          <View className={`px-3 py-1 rounded-lg ${getStatusStyle(transformedItem.status)}`}>
            <Text className="text-xs font-semibold text-gray-800">
              {transformedItem.status}
            </Text>
          </View>
        </View>
        
        <View className="mb-3">
          <Text className="text-gray-600 mb-1">{transformedItem.phone}</Text>
          <Text className="text-gray-500 text-sm mb-1">{transformedItem.address}</Text>
        </View>

        <View className="border-t border-gray-100 pt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Size: {transformedItem.size}</Text>
            <Text className="text-gray-900 font-bold">{transformedItem.amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-2 text-gray-600">Loading proposals...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="p-4 border-gray-200">
        <View className="flex-row items-center space-x-3">
          {/* Search Bar */}
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-lg h-10">
            <View className="px-3">
              <Search size={18} color="#666" strokeWidth={2} />
            </View>
            <TextInput
              className="flex-1 text-sm"
              placeholder="Search Customers"
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          {/* Status Filter */}
          <View className="relative ml-2">
            <TouchableOpacity
              onPress={() => setShowStatusFilter(!showStatusFilter)}
              className="flex-row items-center bg-gray-100 rounded-lg h-10 px-3 min-w-[60]"
            >
              <Text className={`${
                selectedStatus === 'Hot' ? 'text-red-600' :
                selectedStatus === 'Cold' ? 'text-blue-600' :
                selectedStatus === 'Warm' ? 'text-orange-600' :
                selectedStatus === 'Scrap' ? 'text-yellow-600' :
                selectedStatus === 'Confirm' ? 'text-green-600' :
                'text-gray-500'
              } text-sm font-medium`}>
                {selectedStatus}
              </Text>
            </TouchableOpacity>

            {showStatusFilter && (
              <View className="absolute top-11 right-0 bg-white rounded-lg shadow-xl z-10 w-32">
                {statusOptions.map((status) => (
                  <TouchableOpacity
                    key={status}
                    className="px-3 py-2 border-b border-gray-100 active:bg-gray-50"
                    onPress={() => {
                      setSelectedStatus(status);
                      setShowStatusFilter(false);
                    }}
                  >
                    <Text className={`${
                      status === selectedStatus
                        ? status === 'Hot' ? 'text-red-600'
                        : status === 'Cold' ? 'text-blue-600'
                        : status === 'Warm' ? 'text-orange-600'
                        : status === 'Scrap' ? 'text-yellow-600'
                        : status === 'Confirm' ? 'text-green-600'
                        : 'text-gray-600'
                      : 'text-gray-600'
                    } text-sm font-medium`}>
                      {status}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Add New Button */}
          <TouchableOpacity 
            className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
            onPress={() => router.push('/(tabs)/proposal/AddProposal')}
          >
            <Plus size={18} color="white" strokeWidth={2} />
            <Text className="text-white ml-1 font-medium text-sm">Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterTabs 
        selectedFilter={activeTab}
        onFilterChange={setActiveTab}
      />

      {/* Customer List */}
      <FlatList
        data={proposals}
        renderItem={({ item }) => <ProposalCard item={item} />}
        keyExtractor={(item) => item._id || item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={() => fetchProposals(true)}
        ListEmptyComponent={
          <View className="flex-1 justify-center items-center py-10">
            <Text className="text-gray-500 text-center">No proposals found</Text>
            <Text className="text-gray-400 text-sm text-center mt-1">Pull to refresh or adjust your filters</Text>
          </View>
        }
      />
    </View>
  );
};

export default ProposalList;