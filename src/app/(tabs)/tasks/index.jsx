import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Modal, TextInput, Image, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, FileText, X, Plus, Calendar } from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { proposalData, employees } from '../../../data/mockData';
import FilterTabs from '../../../components/Common/FilterTabs';

export default function Task() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignTo: '',
    startDate: new Date(),
    endDate: new Date(),
    status: '',
    beforeImages: [],
    afterImages: [],
    attachment: null
  });
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);

  // Define all available services
  const allServices = ['All', 'Home Cinema', 'Home Automation', 'Security System', 'Outdoor Audio'];

  const projectOptions = proposalData.map(proposal => ({
    value: proposal.name,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }));

  // Toggle function for expandable cards
  const toggleCardExpand = (proposalId) => {
    setExpandedCards((prev) => ({
      ...prev,
      [proposalId]: !prev[proposalId],
    }));
  };

  // Update the getBgColor function to match proposal styling
  const getBgColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-services-cinema-light border-b-2 border-services-cinema-border";
      case "Home Automation":
        return "bg-services-automation-light border-b-2 border-services-automation-border";
      case "Security System":
        return "bg-services-security-light border-b-2 border-services-security-border";
      case "Outdoor Audio":
        return "bg-services-audio-light border-b-2 border-services-audio-border";
      default:
        return "bg-services-default-light border-b-2 border-services-default-border";
    }
  };

  // Update the renderProjectDetails function
  const renderProjectDetails = (proposal) => {
    if (!proposal) return null;

    return (
      <View className='px-4 py-2 rounded-lg mb-4 bg-white shadow-sm'>
        {/* Main Card Content */}
        <View className={`mb-4 rounded-xl shadow-xl p-4 ${getBgColor(proposal.service)}`}>
          {/* Chevron Button - Top right corner */}
          <View className="flex-row justify-end mb-2">
            <TouchableOpacity
              className="p-2"
              onPress={() => toggleCardExpand(proposal.id)}
            >
              {expandedCards[proposal.id] ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-3">
            <View className="flex-1 ml-4 pr-4">
              <Text className="text-gray-600 text-sm mb-1">Address</Text>
              <Text className="text-gray-900 text-xs">{proposal.address}</Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-gray-600 text-sm mb-1">Email Id</Text>
              <Text className="text-gray-900 text-xs">{proposal.email}</Text>
            </View>
          </View>
          <View className="flex-row justify-between mb-3">
            <View className="flex-1 ml-4 pr-4">
              <Text className="text-gray-600 text-sm mb-1">Description</Text>
              <Text className="text-gray-900 text-xs">{proposal.description}</Text>
            </View>
            <View className="flex-1 pl-2">
              <Text className="text-gray-600 text-sm mb-1">Size</Text>
              <Text className="text-gray-900 text-xs">{proposal.size}</Text>
            </View>
          </View>

          {/* Expandable Content */}
          {expandedCards[proposal.id] && (
            <View className="mt-2 pt-4">
              <View className="flex-row justify-between mb-3">
                <View className="flex-1 ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Customer</Text>
                  <Text className="text-gray-900 text-xs">{proposal.name}</Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Phone Number</Text>
                  <Text className="text-gray-900 text-xs">{proposal.phone}</Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-3">
                <View className="flex-1 ml-4 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Service</Text>
                  <Text className="text-gray-900 text-xs">
                    {proposal.service}
                  </Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Amount</Text>
                  <Text className="text-gray-900 text-xs">
                    {proposal.amount}
                  </Text>
                </View>
              </View>

              <View className="flex-row justify-between">
                <View className="flex-1 ml-2 pr-4">
                  <Text className="text-gray-600 text-sm mb-1">Attachment</Text>
                  <Text className="text-gray-900 text-xs">
                    {proposal.attachment || "No attachment"}
                  </Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-gray-600 text-sm mb-1">Date</Text>
                  <Text className="text-gray-900 text-xs">{proposal.date}</Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Update selected filter when a project is selected
  const handleProjectSelect = (projectName) => {
    const selectedProject = proposalData.find(p => p.name === projectName);
    if (selectedProject) {
      setSelectedFilter(selectedProject.service); // Switch to project's service
      setSelectedStatus(projectName);
    }
    setShowStatusDropdown(false);
  };

  
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Fixed Header Section */}
        <View className="bg-white">
          {/* Header Title */}
          <View className="flex-row justify-between items-center px-5 py-4 border-b border-gray-100">
            <Text className="text-xl font-bold text-gray-800">Tasks</Text>
          </View>

          {/* Filter Tabs - Always visible */}
          <FilterTabs 
            selectedFilter={selectedFilter}
            onFilterChange={setSelectedFilter}
            filters={allServices}
          />

          {/* Projects Dropdown */}
          <View className="px-4 py-3">
            <View className="relative">
              <TouchableOpacity
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4"
              >
                <Text className={`${
                  selectedStatus ? 'text-blue-600' : 'text-gray-500'
                } text-sm font-medium`}>
                  {selectedStatus || 'Select Projects'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {showStatusDropdown && (
                <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
                  {proposalData
                    .filter(proposal => selectedFilter === 'All' || proposal.service === selectedFilter)
                    .map((proposal) => (
                      <TouchableOpacity
                        key={proposal.id}
                        className="px-4 py-3 border-b border-gray-100 flex-row items-center justify-between bg-blue-50"
                        onPress={() => handleProjectSelect(proposal.name)}
                      >
                        <Text className="text-blue-600 text-sm font-medium">
                          {proposal.name}
                        </Text>
                        {selectedStatus === proposal.name && (
                          <View className="w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </TouchableOpacity>
                    ))}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Project Details - Only show when project is selected */}
        {selectedStatus && proposalData
          .filter(proposal => proposal.name === selectedStatus)
          .map((proposal) => (
            <View key={proposal.id} className="mt-4">
              {renderProjectDetails(proposal)}
              
              {/* Task Board Section */}
              <View className="mx-4 mt-4 bg-white rounded-lg p-4">
                {/* Task Board Header */}
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold text-gray-900">Task Board</Text>
                  <TouchableOpacity 
                    onPress={() => setShowAddTaskForm(!showAddTaskForm)}
                    className="bg-red-600 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-medium">
                      {showAddTaskForm ? 'Cancel' : 'Add Task'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Add Task Form */}
                {showAddTaskForm && (
                  <View className="border border-gray-100 rounded-lg p-4 mb-4">
                    <View className="flex-row items-center mb-2">
                      <View className="w-6 h-6 rounded-full bg-gray-200 items-center justify-center">
                        <Check size={16} color="white" />
                      </View>
                      <TextInput
                        className="flex-1 text-lg font-medium text-gray-900 ml-2"
                        placeholder="Enter task title"
                        value={newTask.title}
                        onChangeText={(text) => setNewTask({...newTask, title: text})}
                      />
                    </View>

                    {/* Assignee */}
                    <View className="mb-3">
                      <Text className="text-gray-600 text-sm">Assignee:</Text>
                      <TouchableOpacity 
                        className="mt-1 p-2 border border-gray-200 rounded-lg"
                        onPress={() => {/* Show assignee picker */}}
                      >
                        <Text className="text-gray-900">
                          {newTask.assignee || 'Select assignee'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Dates Row */}
                    <View className="flex-row mb-4">
                      {/* Start Date */}
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-500 mb-1">Start Date</Text>
                        <View className="relative">
                          <TouchableOpacity 
                            className="h-12 px-4 bg-gray-50 rounded-lg flex-row items-center justify-between"
                            onPress={() => {
                              setActiveDateField('start');
                              setShowDatePicker(true);
                            }}
                          >
                            <Text className="text-gray-700">
                              {newTask.startDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Text>
                            <Calendar size={20} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* End Date */}
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-500 mb-1">End Date</Text>
                        <View className="relative">
                          <TouchableOpacity 
                            className="h-12 px-4 bg-gray-50 rounded-lg flex-row items-center justify-between"
                            onPress={() => {
                              setActiveDateField('end');
                              setShowDatePicker(true);
                            }}
                          >
                            <Text className="text-gray-700">
                              {newTask.endDate.toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Text>
                            <Calendar size={20} color="#6B7280" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Date Picker */}
                    {showDatePicker && (
                      <DateTimePicker
                        value={activeDateField === 'start' ? newTask.startDate : newTask.endDate}
                        mode="date"
                        display="default"
                        minimumDate={activeDateField === 'end' ? newTask.startDate : undefined}
                        onChange={(event, selectedDate) => {
                          setShowDatePicker(false);
                          if (selectedDate) {
                            setNewTask(prev => ({
                              ...prev,
                              [activeDateField === 'start' ? 'startDate' : 'endDate']: selectedDate
                            }));
                          }
                          setActiveDateField(null);
                        }}
                      />
                    )}

                    {/* Note */}
                    <View className="mb-4">
                      <Text className="text-gray-600 text-sm">Note:</Text>
                      <TextInput
                        className="mt-1 p-2 border border-gray-200 rounded-lg"
                        placeholder="Add task note"
                        multiline
                        numberOfLines={3}
                        value={newTask.note}
                        onChangeText={(text) => setNewTask({...newTask, note: text})}
                      />
                    </View>

                    {/* Images */}
                    <View className="flex-row justify-between mb-4">
                      <View className="flex-1 mr-2">
                        <Text className="text-gray-600 text-sm mb-2">Before</Text>
                        {newTask.beforeImage ? (
                          <Image 
                            source={{ uri: newTask.beforeImage }}
                            className="w-full h-24 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <TouchableOpacity 
                            className="h-24 border border-gray-200 rounded-lg items-center justify-center"
                            onPress={() => {/* Handle image pick */}}
                          >
                            <Text className="text-blue-600">Upload Image</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View className="flex-1 ml-2">
                        <Text className="text-gray-600 text-sm mb-2">After</Text>
                        {newTask.afterImage ? (
                          <Image 
                            source={{ uri: newTask.afterImage }}
                            className="w-full h-24 rounded-lg"
                            resizeMode="cover"
                          />
                        ) : (
                          <TouchableOpacity 
                            className="h-24 border border-gray-200 rounded-lg items-center justify-center"
                            onPress={() => {/* Handle image pick */}}
                          >
                            <Text className="text-blue-600">Upload Image</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* Attachment */}
                    <TouchableOpacity 
                      className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-4"
                      onPress={() => {/* Handle file pick */}}
                    >
                      <FileText size={20} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-2">
                        {newTask.attachment?.name || 'Add attachment'}
                      </Text>
                    </TouchableOpacity>

                    {/* Submit Button */}
                    <TouchableOpacity 
                      className="bg-red-600 p-4 rounded-full"
                      onPress={() => {
                        // Handle task creation
                        setShowAddTaskForm(false);
                      }}
                    >
                      <Text className="text-white text-center font-medium">Create Task</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* Existing Task Cards */}
                {/* Site Visit Task Card */}
                <View className="border border-gray-100 rounded-lg p-2">
                  <View className="flex-row items-center mb-2">
                    <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
                      <Check size={16} color="white" />
                    </View>
                    <Text className="text-lg font-medium text-gray-900 ml-2">
                      Site Visit
                    </Text>
                    <View className="ml-auto">
                      <View className="bg-green-100 px-3 py-1 rounded-full">
                        <Text className="text-green-600 text-xs font-medium">Done</Text>
                      </View>
                    </View>
                  </View>

                  {/* Assignee */}
                  <View className="mb-3">
                    <Text className="text-gray-600 text-sm">Assignee: {
                      employees.find(emp => emp.name === "Anbarasan V")?.name
                    }</Text>
                  </View>

                  {/* Dates */}
                  <View className="flex-row mb-3">
                    <Text className="text-gray-600 text-sm">Start Date: 10/04/2025</Text>
                    <Text className="text-gray-600 text-sm ml-4">End Date: 11/04/2025</Text>
                  </View>

                  {/* Note */}
                  <View className="mb-4">
                    <Text className="text-gray-600 text-sm">
                      Note: Complete check and verify the site
                    </Text>
                  </View>

                  {/* Images */}
                  <View className="flex-row justify-between mb-4">
                    <View className="flex-1 mr-2">
                      <Text className="text-gray-600 text-sm mb-2">Before</Text>
                      {/* <Image 
                        source={require('../../../assets/before-image.jpg')} // Update path as needed
                        className="w-full h-24 rounded-lg"
                        resizeMode="cover"
                      /> */}
                    </View>
                    <View className="flex-1 ml-2">
                      <Text className="text-gray-600 text-sm mb-2">After</Text>
                      {/* <Image 
                        source={require('../../../assets/after-image.jpg')} // Update path as needed
                        className="w-full h-24 rounded-lg"
                        resizeMode="cover"
                      /> */}
                    </View>
                  </View>

                  {/* Attachment */}
                  <TouchableOpacity className="flex-row items-center bg-gray-50 p-3 rounded-lg">
                    <FileText size={20} color="#6B7280" />
                    <Text className="text-gray-600 text-sm ml-2">pro-987465.pdf</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        }
        

      </ScrollView>
    </SafeAreaView>
  );
}
