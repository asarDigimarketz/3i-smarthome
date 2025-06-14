import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import { ArrowLeft, ChevronDown } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { proposalData as mockProposalData } from '../../../data/mockData';

const ProposalDetail = () => {
  const router = useRouter();
  const { proposalId } = useLocalSearchParams();
  
  // Find the selected proposal
  const proposalData = mockProposalData.find(p => p.id === Number(proposalId)) || {};
  
  const [status, setStatus] = useState(proposalData.status || 'Hot');
  const [amount, setAmount] = useState(proposalData.amount || '₹30,00,000');

  const colors = {
    'Hot': { bg: 'bg-red-100', text: 'text-red-600' },
    'Cold': { bg: 'bg-blue-100', text: 'text-blue-600' },
    'Warm': { bg: 'bg-orange-100', text: 'text-orange-600' },
    'Scrap': { bg: 'bg-yellow-100', text: 'text-yellow-600' },
    'Confirm': { bg: 'bg-green-100', text: 'text-green-600' }
  };

  const serviceColors = {
    'Home Cinema': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600' },
    'Security System': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-600' },
    'Home Automation': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600' },
    'Outdoor Audio': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-600' }
  };

  const DetailRow = ({ label, value, isEditable = false }) => (
    <View className="flex-row py-3 border-b border-gray-100">
      <Text className="text-gray-500 w-24 text-sm">{label}:</Text>
      <View className="flex-1">
        {isEditable ? (
          <TextInput
            className="text-gray-800 font-medium"
            value={value}
            multiline={label === 'Comment'}
          />
        ) : (
          <Text className={`font-medium ${
            label === 'Service' ? serviceColors[value]?.text : 'text-gray-800'
          }`}>
            {value}
          </Text>
        )}
      </View>
    </View>
  );

const AmountSelector = () => (
  <View className="flex-row py-3 border-b border-gray-100">
    <Text className="text-gray-500 w-24 text-sm">Amount:</Text>
    <View className="flex-1">
      <View className="flex-row items-center">
        <View className="flex-1 flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-2 mr-3">
          <Text className="text-gray-800 font-medium">{amount}</Text>
          <ChevronDown size={16} color="#9CA3AF" />
        </View>
        <View className="flex-1 flex-row space-x-3 gap-1">
          {/* Add Button with Label */}
          <View className="items-center">
            <TouchableOpacity className="bg-red-600 rounded-lg px-4 py-2 mb-1">
              <Text className="text-white font-semibold text-sm">Add</Text>
            </TouchableOpacity>
          </View>

          {/* Fix Button with Label */}
          <View className="items-center">
            <TouchableOpacity className="bg-red-600 rounded-lg px-4 py-2 mb-1">
              <Text className="text-white font-semibold text-sm">Fix</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  </View>
);

  const StatusSelector = () => (
    <View className="flex-row py-3 border-b border-gray-100">
      <Text className="text-gray-500 w-24 text-sm items-center">Status:</Text>
      <View className="flex-1">
        <View className={`flex-row items-center justify-between border border-gray-300 rounded-lg px-3 py-2 w-32 ${colors[status]?.bg || 'bg-white'}`}>
          <Text className={`font-medium ${colors[status]?.text || 'text-gray-800'}`}>
            {status}
          </Text>
          <ChevronDown size={16} color="#9CA3AF" />
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

      <ScrollView className="flex-1">
        <View className={`m-4 rounded-lg shadow-sm ${
          serviceColors[proposalData.service]?.bg || 'bg-white'
        }`}>
          <View className="p-4">
            <DetailRow label="Customer" value={proposalData.name} />
            <DetailRow label="Date" value={proposalData.date} />
            <DetailRow label="Contact" value={proposalData.phone} />
            <DetailRow label="Email Id" value={proposalData.email} />
            <DetailRow label="Address" value={proposalData.address} />
            <DetailRow label="Service" value={proposalData.service} />
            <DetailRow label="Description" value={proposalData.description} />
            <DetailRow label="Size" value={proposalData.size} />
            <AmountSelector />
            
            {/* Comment Section */}
            <View className="py-3 border-b border-gray-100">
              <Text className="text-gray-500 text-sm mb-2">Comment:</Text>
              <View className="bg-gray-50 rounded-lg p-3 min-h-16">
                <Text className="text-gray-800">{proposalData.comment}</Text>
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
              className="bg-blue-600 rounded-lg px-6 py-3 w-[100]"
              onPress={() => router.push({
                pathname: '/(tabs)/proposal/EditProposal',
                params: { proposalId: proposalId }
              })}
            >
              <Text className="text-white font-semibold text-center">Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-gray-500 rounded-lg px-6 py-3 w-[100]"
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
              className="bg-green-600 rounded-lg px-6 py-3 w-[320]"
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
    </View>
  );
};

export default ProposalDetail;