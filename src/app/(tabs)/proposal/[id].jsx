import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { proposalData } from '../../../data/mockData';

const ProposalDetail = () => {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  const proposalDetails = proposalData.find(p => p.id === Number(id)) || {};
  
  // Initialize states with the found data
  const [status, setStatus] = useState(proposalDetails.status || 'Hot');
  const [amount, setAmount] = useState(proposalDetails.amount || '₹0');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const colors = {
    'Hot': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-600' },
    'Cold': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-600' },
    'Warm': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-600' },
    'Scrap': { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-600' },
    'Confirm': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-600' }
  };

  const serviceColors = {
    'Home Cinema': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600' },
    'Security System': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-600' },
    'Home Automation': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600' },
    'Outdoor Audio': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-600' }
  };

  const statusOptions = ['Hot', 'Cold', 'Warm', 'Scrap', 'Confirm'];

  const DetailRow = ({ label, value }) => (
    <View className="flex-row py-3 border-b border-gray-100">
      <Text className="text-gray-500 w-24 text-sm">{label}:</Text>
      <View className="flex-1">
        <Text className={`font-medium ${
          label === 'Service' ? serviceColors[value]?.text : 'text-gray-800'
        }`}>
          {value}
        </Text>
      </View>
    </View>
  );

  const AmountSelector = () => {
    return (
      <View className="flex-row py-3 border-b border-gray-100">
        <Text className="text-gray-500 w-[60px] text-sm">Amount:</Text>
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <View className="flex-row items-center border border-gray-300 rounded-lg overflow-hidden w-[145]">
              <View className="bg-gray-100 px-2 py-2 border-r border-gray-300">
                <Text className="text-gray-600">₹</Text>
              </View>
              <View className="flex-1 px-2 py-2 justify-center">
                <Text className="text-gray-800">{amount?.replace('₹', '') || '0.00'}</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className="bg-red-600 rounded-lg px-4 py-2"
                onPress={() => {
                  // Handle Add action
                }}
              >
                <Text className="text-white font-semibold text-sm">Add</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-red-600 rounded-lg px-4 py-2"
                onPress={() => {
                  // Handle Fix action
                }}
              >
                <Text className="text-white font-semibold text-sm">Fix</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const StatusSelector = () => (
    <View className="flex-row py-3 border-b border-gray-100">
      <Text className="text-gray-500 w-24 text-sm items-center">Status:</Text>
      <View className="flex-1">
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            className={`flex-row items-center justify-between border ${colors[status]?.border || 'border-gray-600'} rounded-lg px-2 py-1 w-32 ${colors[status]?.bg || 'bg-white'}`}
          >
            <Text className={`font-medium ${colors[status]?.text || 'text-gray-800'}`}>
              {status}
            </Text>
            <ChevronDown 
              size={16} 
              color="#9CA3AF" 
              style={{ transform: [{ rotate: showStatusDropdown ? '180deg' : '0deg' }] }}
            />
          </TouchableOpacity>

          {showStatusDropdown && (
            <View className="absolute bottom-9 left-0 bg-white rounded-lg shadow-xl z-10 w-32">
              {statusOptions.map((option, index) => (
                <TouchableOpacity
                  key={option}
                  className={`px-3 py-2 border-b border-gray-100 active:bg-gray-50 ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === statusOptions.length - 1 ? 'rounded-b-lg border-b-0' : ''
                  }`}
                  onPress={() => {
                    setStatus(option);
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text className={`${
                    option === 'Hot' ? 'text-red-600' :
                    option === 'Cold' ? 'text-blue-600' :
                    option === 'Warm' ? 'text-orange-600' :
                    option === 'Scrap' ? 'text-yellow-600' :
                    option === 'Confirm' ? 'text-green-600' :
                    'text-gray-600'
                  } text-sm font-medium`}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white p-4 shadow-sm flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity 
            className="mr-3"
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-800">Proposal Details</Text>
        </View>
      </View>

      <KeyboardAwareScrollView
        className="flex-1"
        enableOnAndroid
        enableAutomaticScroll
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView className="flex-1">
          <View className={`m-4 rounded-lg shadow-sm ${
            serviceColors[proposalDetails.service]?.bg || 'bg-white'
          }`}>
            <View className="p-4">
              <DetailRow label="Customer" value={proposalDetails.name} />
              <DetailRow label="Date" value={proposalDetails.date} />
              <DetailRow label="Contact" value={proposalDetails.phone} />
              <DetailRow label="Email Id" value={proposalDetails.email} />
              <DetailRow label="Address" value={proposalDetails.address} />
              <DetailRow label="Service" value={proposalDetails.service} />
              <DetailRow label="Description" value={proposalDetails.description} />
              <DetailRow label="Size" value={proposalDetails.size} />
              <AmountSelector />
              
              {/* Comment Section */}
              <View className="py-3 border-b border-gray-100">
                <Text className="text-gray-500 text-sm mb-2">Comment:</Text>
                <View className="bg-gray-50 rounded-lg p-3 min-h-16">
                  <Text className="text-gray-800">{proposalDetails.comment}</Text>
                </View>
              </View>
              
              <StatusSelector />
            </View>
          </View>

          {/* Action Buttons */}
          <View className="p-4 space-y-3">
            {/* First row - Save, Edit and Delete */}
            <View className="flex-row justify-center space-x-4 gap-2">
              <TouchableOpacity 
                className="bg-[#c92125] rounded-lg px-6 py-3 w-[100]"
                onPress={() => {
                  // Add your save logic here
                  console.log('Saving...');
                }}
              >
                <Text className="text-white font-semibold text-center">Save</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-gray-600 rounded-lg px-6 py-3 w-[100]"
                onPress={() => router.push(`/proposal/edit/${id}`)}
              >
                <Text className="text-white font-semibold text-center">Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="bg-gray-400 rounded-lg px-6 py-3 w-[100]"
                onPress={() => {
                  // Add your delete logic here
                  console.log('Deleting...');
                }}
              >
                <Text className="text-white font-semibold text-center">Delete</Text>
              </TouchableOpacity>
            </View>

            {/* Second row - Project Confirmed */}
            <View className="flex-row justify-center mt-2">
              <TouchableOpacity 
                className="bg-green-500 rounded-lg px-6 py-3 w-[320]"
                onPress={() => {
                  // Add your confirm logic here
                  console.log('Confirming project...');
                }}
              >
                <Text className="text-white font-semibold text-center">Project Confirmed</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>
    </View>
  );
};

export default ProposalDetail;