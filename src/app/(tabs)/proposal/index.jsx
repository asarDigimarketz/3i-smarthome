import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { Search, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import FilterTabs from '../../../components/Common/FilterTabs';
import { proposalData } from '../../../data/mockData';

const ProposalList = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [showStatusFilter, setShowStatusFilter] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Add status options array
  const statusOptions = [
    'All',
    'Hot',
    'Cold',
    'Warm',
    'Scrap',
    'Confirm'
  ];

  const getFilteredProposals = () => {
    return proposalData
      .filter(item => activeTab === 'All' || item.service === activeTab)
      .filter(item => selectedStatus === 'All' || item.status === selectedStatus)
      .filter(item => !searchText || 
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.phone.includes(searchText) ||
        item.address.toLowerCase().includes(searchText.toLowerCase()) ||
        item.service.toLowerCase().includes(searchText.toLowerCase())
      );
  };

  const ProposalCard = ({ item }) => {
    const getServiceStyles = (service) => {
      switch (service) {
        case 'Home Cinema':
          return 'bg-services-cinema-light border-b-2 border-services-cinema-border';
        case 'Home Automation':
          return 'bg-services-automation-light border-b-2 border-services-automation-border';
        case 'Security System':
          return 'bg-services-security-light border-b-2 border-services-security-border';
        case 'Outdoor Audio':
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
          return 'bg-[#999999]';
        case 'Confirm':
          return 'bg-[#beeecf]';
        default:
          return 'bg-gray-100';
      }
    };

    return (
      <TouchableOpacity 
        className={`p-4 mb-3 rounded-lg shadow-sm ${getServiceStyles(item.service)}`}
        onPress={() => router.push({
          pathname: '/(tabs)/proposal/ProposalDetail',
          params: { proposalId: item.id }
        })}
      >
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-lg font-bold text-gray-800">{item.name}</Text>
          <View className={`px-3 py-1 rounded-lg ${getStatusStyle(item.status)}`}>
            <Text className="text-xs font-semibold text-gray-800">
              {item.status}
            </Text>
          </View>
        </View>
        
        <View className="mb-3">
          <Text className="text-gray-600 mb-1">{item.phone}</Text>
          <Text className="text-gray-500 text-sm mb-1">{item.address}</Text>
        </View>

        <View className="border-t border-gray-100 pt-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-600 text-sm">Size: {item.size}</Text>
            <Text className="text-gray-900 font-bold">{item.amount}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

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
        data={getFilteredProposals()}
        renderItem={({ item }) => <ProposalCard item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default ProposalList;