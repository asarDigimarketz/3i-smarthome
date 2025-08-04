import { useRouter } from 'expo-router';
import { Plus, Search, ChevronDown, Phone, MapPin, CheckCircle } from 'lucide-react-native';
import { useState, useEffect, useRef } from 'react';
import { FlatList, Text, View, Alert, ActivityIndicator, Button } from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import PermissionGuard from '../../../components/Common/PermissionGuard';
import { useAuth } from '../../../utils/AuthContext';
import { hasPagePermission, getPageActions } from '../../../utils/permissions';
import { TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import { API_CONFIG } from '../../../../config'; // adjust path as needed

import apiClient from '../../../utils/apiClient';

const API_BASE_URL = API_CONFIG.API_URL;
const API_KEY = API_CONFIG.API_KEY;

function getStatusClassNames(status) {
  switch (status) {
    case 'All Status':
      return 'bg-gray-100 text-gray-600 border border-gray-300';
    case 'Hot':
      return 'bg-red-100 text-red-600 border border-red-300';
    case 'Cold':
      return 'bg-blue-100 text-blue-600 border border-blue-300';
    case 'Warm':
      return 'bg-orange-100 text-orange-600 border border-orange-300';
    case 'Scrap':
      return 'bg-yellow-100 text-yellow-600 border border-yellow-300';
    case 'Confirmed':
      return 'bg-green-200 text-green-600 border border-green-300';
    default:
      return 'bg-gray-100 text-gray-600 border border-gray-300';
  }
}

const ProposalList = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState(new Set(['Hot', 'Cold', 'Warm', 'Scrap'])); // Default: all except "Confirmed"
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const actions = getPageActions(user, '/dashboard/proposals');
  const searchTimeoutRef = useRef(null);

  // Add status options array
  const statusOptions = [
    'All Status',
    'Hot',
    'Cold',
    'Warm',
    'Scrap',
    'Confirmed'
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

      // Add search filter for customer name
      if (searchText && searchText.trim()) {
        params.search = searchText.trim();
      }

      // Add status filter
      if (selectedStatuses.size > 0) {
        // Check if "All Status" is selected
        if (selectedStatuses.has('All Status')) {
          // Don't add any status filter - show all
        } else {
          params.status = Array.from(selectedStatuses).join(',');
        }
      }

      // Add service filter (from activeTab)
      if (activeTab && activeTab !== 'All') {
        params.service = activeTab;
      }

      const response = await apiClient.get('/api/proposals', { params });

      const data = response.data;
      
      if (data.success) {
        const proposals = data.data.proposals || [];
        // Additional client-side filtering for customer name if needed
        let filteredProposals = proposals;
        if (searchText && searchText.trim()) {
          filteredProposals = proposals.filter(proposal => 
            proposal.customerName && 
            proposal.customerName.toLowerCase().includes(searchText.toLowerCase().trim())
          );
        }
        setProposals(filteredProposals);
      } else {
        console.error('API returned success: false');
        console.error('Error message:', data.error);
        Alert.alert('Error', data.error || 'Failed to fetch proposals');
      }
    } catch (error) {
      console.error('Error fetching proposals:', error);
      
      if (error.response) {
        // Server responded with error status
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
        Alert.alert('Network Error', 'No response from server. Please check your internet connection and server status.');
      } else {
        // Other error
        Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle search text change with debouncing
  const handleSearchTextChange = (text) => {
    setSearchText(text);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(() => {
      fetchProposals();
    }, 300); // 300ms delay
  };

  // Load proposals on component mount and when filters change
  useEffect(() => {
    fetchProposals();
  }, [selectedStatuses, activeTab]); // Removed searchText from dependencies as it's handled by debouncing

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

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

    const { bg, text } = getStatusClassNames(transformedItem.status);

    return (
      <TouchableOpacity 
        className={`p-4 mb-3 rounded-lg shadow-sm ${getServiceStyles(transformedItem.service)}`}
        onPress={() => router.push(`/proposal/${transformedItem.id}`)}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">{transformedItem.name}</Text>
          <View className={`px-3 py-1 rounded-lg ${bg}`}>
            <Text className={`${getStatusClassNames(transformedItem.status)} text-xs font-semibold px-3 py-2 rounded-lg border`}>
              {transformedItem.status}
            </Text>
          </View>
        </View>
        
        <View className="mb-3">
          <View className="flex-row items-center mb-1">
            <Phone size={14} color="#6B7280" />
            <Text className="text-gray-600 ml-2">{transformedItem.phone}</Text>
          </View>
          <View className="flex-row items-center mb-1">
            <MapPin size={14} color="#6B7280" />
            <Text className="text-gray-500 text-sm ml-2 w-[80%]">{transformedItem.address}</Text>
          </View>
        </View>

        <View className="border-t border-gray-100 pt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Size: {transformedItem.size}</Text>
            <Text className="text-gray-700 font-bold">Amount: {transformedItem.amount}</Text>
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

  if (!hasPagePermission(user, '/dashboard/proposals', 'view')) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#c92125', fontSize: 18, textAlign: 'center' }}>
          You do not have permission to view this page.
        </Text>
      </View>
    );
  }

  return (
    <PermissionGuard page="Proposals" action="view">
      <View className="flex-1 bg-gray-50">
        <View className="px-4 pt-4">
          {/* First Row: Title + Status + Add */}
          <View className="flex-row items-center justify-between mb-2">
            {/* Left: Title */}
            <Text className="text-xl font-bold text-gray-900">Proposals</Text>
            {/* Right: Status + Add */}
            <View className="flex-row items-center space-x-2">
              {/* Replace below with your actual Status dropdown component */}

              <View className="relative ml-2">
              <TouchableOpacity
                className={`border border-gray-200 rounded-lg px-4 py-2 flex-row items-center justify-between ${getStatusClassNames(selectedStatuses.size === 0 ? 'All Status' : Array.from(selectedStatuses)[0])}`}
                onPress={() => setShowStatusFilter(!showStatusFilter)}
              >
                <Text>
                  {selectedStatuses.size === 0 ? 'All Status' : 
                   selectedStatuses.has('All Status') ? 'All Status' :
                   selectedStatuses.size === 1 ? Array.from(selectedStatuses)[0] :
                   `${selectedStatuses.size} Statuses`}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>

              {showStatusFilter && (
                <View className="absolute top-11 right-0 bg-white rounded-lg shadow-xl z-10 w-32">
                  {statusOptions.map((status) => {
                    const { text } = getStatusClassNames(status);
                    const isSelected = selectedStatuses.has(status);
                    return (
                      <TouchableOpacity
                        key={status}
                        className={`px-3 py-2 active:bg-gray-50 flex-row items-center justify-between ${
                          status === statusOptions[statusOptions.length - 1] ? '' : 'border-b border-gray-100'
                        }`}
                        onPress={() => {
                          const newSelectedStatuses = new Set(selectedStatuses);
                          if (status === 'All Status') {
                            // When "All Status" is selected, select all statuses
                            setSelectedStatuses(new Set(['All Status', 'Hot', 'Cold', 'Warm', 'Scrap', 'Confirmed']));
                          } else if (newSelectedStatuses.has(status)) {
                            newSelectedStatuses.delete(status);
                            // If "All Status" is selected and we're deselecting a specific status, remove "All Status"
                            if (newSelectedStatuses.has('All Status')) {
                              newSelectedStatuses.delete('All Status');
                            }
                            setSelectedStatuses(newSelectedStatuses);
                          } else {
                            newSelectedStatuses.add(status);
                            // If we're selecting a specific status, remove "All Status"
                            if (newSelectedStatuses.has('All Status')) {
                              newSelectedStatuses.delete('All Status');
                            }
                            setSelectedStatuses(newSelectedStatuses);
                          }
                          setShowStatusFilter(false);
                        }}
                      >
                        <Text
                          className={`${
                            status === 'All Status'
                              ? 'text-gray-600'
                              : status === selectedStatuses.size === 0 ? 'text-gray-600' : 'text-gray-600'
                          } text-sm font-medium`}
                        >
                          {status}
                        </Text>
                        {isSelected && (
                          <CheckCircle size={16} color="#10B981" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            </View>

              {/* Add Button */}
           
              <TouchableOpacity 
                className="bg-red-600 h-10 px-3 rounded-lg flex-row items-center ml-2"
                onPress={() => router.push('/(tabs)/proposal/AddProposal')}
                disabled={!actions.add}
              >
                <Plus size={18} color="white" strokeWidth={2} />
                <Text className="text-white ml-1 font-medium text-sm">Add</Text>
              </TouchableOpacity>
          
            </View>
          </View>

          {/* Second Row: Search Field */}
          <TextInput
            mode="outlined"
            placeholder="Search..."
            value={searchText}
            onChangeText={handleSearchTextChange}
            left={<TextInput.Icon icon={() => <Search size={20} color="#6B7280" />} />}
            outlineColor="#e5e7eb"
            activeOutlineColor="#DC2626"
            theme={{
              colors: {},
              fonts: {},
              roundness: 10,
            }}
            placeholderTextColor="#4b5563"
            style={{ backgroundColor: 'white', height: 42, marginBottom: 10, borderRadius: 10, fontSize: 13 }}
          />
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
    </PermissionGuard>
  );
};

export default ProposalList;