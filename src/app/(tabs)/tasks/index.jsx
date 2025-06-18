import * as ImagePicker from 'expo-image-picker';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FilterTabs from '../../../components/Common/FilterTabs';
import AddTaskForm from '../../../components/Tasks/AddTaskForm';
import EditTaskForm from '../../../components/Tasks/EditTaskForm';
import TaskCard from '../../../components/Tasks/TaskCard';
import { employees, proposalData } from '../../../data/mockData';

export default function Task() {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [showProposelDropDown, setShowProposelDropDown] = useState(false);
  const [expandedCards, setExpandedCards] = useState({});
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    assignTo: '',
    startDate: new Date(),
    endDate: new Date(),
    status: '',
    beforeImages: [], // Change from beforeImage to beforeImages array
    afterImages: [],  // Change from afterImage to afterImages array
    attachment: null
  });
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Define all available services
  const allServices = ['All', 'Home Cinema', 'Home Automation', 'Security System', 'Outdoor Audio'];

  const projectOptions = proposalData.map(proposal => ({
    value: proposal.name,
    color: 'text-blue-600',
    bg: 'bg-blue-50'
  }));

  const statusOptions = [
    { value: "New", color: "text-blue-600", bg: "bg-blue-50" },
    { value: "In Progress", color: "text-yellow-600", bg: "bg-yellow-50" },
    { value: "Done", color: "text-green-600", bg: "bg-green-50" }
  ];

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
          {/* Header with Details text and Chevron button */}
          <View className="flex-row justify-between items-center mb-2 px-4">
            <Text className="text-gray-600 text-base font-medium">Details</Text>
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
    setShowProposelDropDown(false);
  };

  // Update the pickImages function
  const pickImages = async (type) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: [ImagePicker.MediaType.IMAGE], // Updated API usage
        allowsMultipleSelection: true,
        quality: 1,
        aspect: [4, 3]
      });

      if (!result.canceled) {
        const selectedImages = result.assets.map(asset => asset.uri);
        setNewTask(prev => ({
          ...prev,
          [type]: [...prev[type], ...selectedImages]
        }));
      }
    } catch (error) {
      console.error('Error picking images:', error);
    }
  };

  const removeImage = (type, index) => {
    setNewTask(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  // Add this with other functions
  const handleEditTask = (task) => {
    setEditingTask({
      ...task,
      startDate: new Date(task.startDate),
      endDate: new Date(task.endDate),
      beforeImages: task.beforeImages || [],
      afterImages: task.afterImages || []
    });
    setShowEditForm(true);
  };

  // Add this with other functions
  const handleUpdateTask = (updatedTask) => {
    // Here you would typically make an API call to update the task
    console.log('Updating task:', updatedTask);
    
    // Close the edit form
    setShowEditForm(false);
    setEditingTask(null);
    
    // Optionally refresh the task list or update local state
  };

  const dummyTasks = [
    {
      title: 'Site Visit',
      assignee: "Anbarasan V",
      startDate: '10/04/2025',
      endDate: '11/04/2025',
      status: 'Done',
      note: 'Complete check and verify the site',
      beforeImages: [
        'https://picsum.photos/200/200?1',
        'https://picsum.photos/200/200?2',
        'https://picsum.photos/200/200?3'
      ],
      afterImages: [
        'https://picsum.photos/200/200?4',
        'https://picsum.photos/200/200?5',
        'https://picsum.photos/200/200?6'
      ],
      attachment: 'pro-987465.pdf'
    },
    {
      title: 'Installation Setup',
      assignee: "John Doe",
      startDate: '15/04/2025',
      endDate: '18/04/2025',
      status: 'In Progress',
      note: 'Install and configure home automation system',
      beforeImages: [
        'https://picsum.photos/200/200?7',
        'https://picsum.photos/200/200?8',
        'https://picsum.photos/200/200?9'
      ],
      afterImages: [
        'https://picsum.photos/200/200?10',
        'https://picsum.photos/200/200?11',
        'https://picsum.photos/200/200?12'
      ],
      attachment: 'install-guide.pdf'
    },
    {
      title: 'Final Testing',
      assignee: "Jane Smith",
      startDate: '20/04/2025',
      endDate: '21/04/2025',
      status: 'New',
      note: 'Perform final system testing and quality checks',
      beforeImages: [
        'https://picsum.photos/200/200?13',
        'https://picsum.photos/200/200?14',
        'https://picsum.photos/200/200?15'
      ],
      afterImages: [
        'https://picsum.photos/200/200?16',
        'https://picsum.photos/200/200?17',
        'https://picsum.photos/200/200?18'
      ],
      attachment: 'test-report.pdf'
    }
  ];

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
                onPress={() => setShowProposelDropDown(!showProposelDropDown)}
                className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4"
              >
                <Text className={`${
                  selectedStatus ? 'text-blue-600' : 'text-gray-500'
                } text-sm font-medium`}>
                  {selectedStatus || 'Select Projects'}
                </Text>
                <ChevronDown size={16} color="#6B7280" />
              </TouchableOpacity>
              
              {showProposelDropDown && (
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

                {showAddTaskForm && (
                  <AddTaskForm 
                    newTask={newTask}
                    setNewTask={setNewTask}
                    showDatePicker={showDatePicker}
                    setShowDatePicker={setShowDatePicker}
                    activeDateField={activeDateField}
                    setActiveDateField={setActiveDateField}
                    showStatusDropdown={showStatusDropdown}
                    setShowStatusDropdown={setShowStatusDropdown}
                    statusOptions={statusOptions}
                    pickImages={pickImages}
                    removeImage={removeImage}
                    setShowAddTaskForm={setShowAddTaskForm}
                  />
                )}
                
                {/* Edit Task Form - New Section */}
                {showEditForm && (
                  <EditTaskForm 
                    editingTask={editingTask}
                    setEditingTask={setEditingTask}
                    showDatePicker={showDatePicker}
                    setShowDatePicker={setShowDatePicker}
                    activeDateField={activeDateField}
                    setActiveDateField={setActiveDateField}
                    showStatusDropdown={showStatusDropdown}
                    setShowStatusDropdown={setShowStatusDropdown}
                    statusOptions={statusOptions}
                    pickImages={pickImages}
                    removeImage={removeImage}
                    setShowEditForm={setShowEditForm}
                  />
                )}

                {dummyTasks.map((task, index) => (
                  <View key={index} className="mb-4">
                    <TaskCard 
                      task={task}
                      employees={employees}
                      handleEditTask={handleEditTask}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}
