import React, { useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Calendar, Check, ChevronDown, FileText, X, User, Camera, Trash2 } from 'lucide-react-native';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, ActionSheetIOS, Platform } from 'react-native';
import { TextInput as PaperTextInput } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';

const AddTaskForm = ({
  newTask,
  setNewTask,
  showDatePicker,
  setShowDatePicker,
  activeDateField,
  setActiveDateField,
  showStatusDropdown,
  setShowStatusDropdown,
  statusOptions,
  removeImage,
  setShowAddTaskForm,
  onCreateTask,
  creating,
  setCreating,
  employees = []
}) => {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allowed file types
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setNewTask(prev => ({
          ...prev,
          attachment: {
            name: asset.name,
            uri: asset.uri,
            type: asset.mimeType,
            size: asset.size
          }
        }));
      }
    } catch (error) {
      console.error('Error picking document:', error);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    if (selectedDate) {
      setNewTask(prev => ({
        ...prev,
        [activeDateField]: selectedDate
      }));
    }
    setShowDatePicker(false);
    setActiveDateField(null);
  };

  const openDatePicker = (field) => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleAssigneeSelect = (employee) => {
    setNewTask(prev => ({
      ...prev,
      assignTo: employee.id
    }));
    setShowAssigneeDropdown(false);
  };

  const getSelectedEmployeeName = () => {
    if (!newTask.assignTo) return 'Select Assignee';
    const selectedEmployee = employees.find(emp => emp.id === newTask.assignTo);
    return selectedEmployee ? selectedEmployee.name : 'Select Assignee';
  };

  const handleSubmit = async () => {
    if (!newTask.title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }
    if (!newTask.status) {
      Alert.alert('Validation Error', 'Please select a status');
      return;
    }

    try {
      setCreating(true);
      const formData = new FormData();
      formData.append('title', newTask.title);
      formData.append('comment', newTask.comment || '');
      formData.append('startDate', newTask.startDate.toISOString());
      formData.append('endDate', newTask.endDate.toISOString());
      formData.append('assignedTo', newTask.assignTo || '');
      formData.append('status', newTask.status);

      // Attach before images
      if (newTask.beforeImages && newTask.beforeImages.length > 0) {
        newTask.beforeImages.forEach((uri, idx) => {
          formData.append('beforeAttachments', {
            uri,
            name: `before_${idx}.jpg`,
            type: 'image/jpeg',
          });
        });
      }

      // Attach after images
      if (newTask.afterImages && newTask.afterImages.length > 0) {
        newTask.afterImages.forEach((uri, idx) => {
          formData.append('afterAttachments', {
            uri,
            name: `after_${idx}.jpg`,
            type: 'image/jpeg',
          });
        });
      }

      // Attach document (PDF)
      if (newTask.attachment) {
        formData.append('attachment', {
          uri: newTask.attachment.uri,
          name: newTask.attachment.name,
          type: newTask.attachment.type,
        });
      }

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-api-key': API_KEY,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'Task created successfully');
        // Optionally: refresh task list here
        setShowAddTaskForm(false);
      } else {
        Alert.alert('Error', data.message || 'Failed to create task');
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create task');
    } finally {
      setCreating(false);
    }
  };

  const pickImages = async (field) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            // Take Photo
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              alert('Camera permission is required!');
              return;
            }
            let result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setNewTask((prev) => ({
                ...prev,
                [field]: [...(prev[field] || []), result.assets[0].uri],
              }));
            }
          } else if (buttonIndex === 2) {
            // Choose from Gallery
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              alert('Gallery permission is required!');
              return;
            }
            let result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [4, 3],
              quality: 1,
              allowsMultipleSelection: true,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setNewTask((prev) => ({
                ...prev,
                [field]: [...(prev[field] || []), ...result.assets.map(a => a.uri)],
              }));
            }
          }
        }
      );
    } else {
      // For Android, use a custom modal or Alert
      Alert.alert(
        'Add Image',
        'Choose an option',
        [
          {
            text: 'Take Photo',
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                alert('Camera permission is required!');
                return;
              }
              let result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setNewTask((prev) => ({
                  ...prev,
                  [field]: [...(prev[field] || []), result.assets[0].uri],
                }));
              }
            }
          },
          {
            text: 'Choose from Gallery',
            onPress: async () => {
              const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
              if (status !== 'granted') {
                alert('Gallery permission is required!');
                return;
              }
              let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
                allowsMultipleSelection: true,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setNewTask((prev) => ({
                  ...prev,
                  [field]: [...(prev[field] || []), ...result.assets.map(a => a.uri)],
                }));
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-900">Add New Task</Text>
        <TouchableOpacity 
          onPress={() => setShowAddTaskForm(false)}
          className="p-2"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View className="mb-4">
        <PaperTextInput
          label="Task Title"
          value={newTask.title}
          onChangeText={(text) => setNewTask(prev => ({ ...prev, title: text }))}
          mode="outlined"
          theme={{ colors: { primary: '#DC2626' } }}
          left={<PaperTextInput.Icon icon={() => <FileText size={20} color="#6B7280" />} />}
          placeholder="Enter task title"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Assignee</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <View className="flex-row items-center flex-1">
              <User size={16} color="#6B7280" />
              <Text className={`ml-2 ${newTask.assignTo ? 'text-gray-900' : 'text-gray-500'}`}>
                {getSelectedEmployeeName()}
              </Text>
            </View>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {showAssigneeDropdown && (
            <View className="absolute top-12 left-0 bg-white rounded-lg shadow-xl z-20 w-full max-h-48 border border-gray-200">
              <ScrollView showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                  onPress={() => {
                    setNewTask(prev => ({ ...prev, assignTo: '' }));
                    setShowAssigneeDropdown(false);
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <User size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-600 text-sm">Unassigned</Text>
                  {!newTask.assignTo && (
                    <View className="w-2 h-2 rounded-full bg-red-600 ml-auto" />
                  )}
                </TouchableOpacity>

                {employees.length === 0 ? (
                  <View className="px-4 py-6 items-center">
                    <Text className="text-gray-500 text-sm">No employees available</Text>
                    <Text className="text-gray-400 text-xs mt-1">Add employees first</Text>
                  </View>
                ) : (
                  employees.map((employee) => (
                    <TouchableOpacity
                      key={employee.id}
                      className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                      onPress={() => handleAssigneeSelect(employee)}
                    >
                      <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                        <Text className="text-blue-600 text-xs font-semibold">
                          {employee.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-gray-900 text-sm font-medium">{employee.name}</Text>
                        {employee.email && (
                          <Text className="text-gray-500 text-xs">{employee.email}</Text>
                        )}
                      </View>
                      {newTask.assignTo === employee.id && (
                        <View className="w-2 h-2 rounded-full bg-red-600" />
                      )}
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}
        </View>
      </View>

      <View className="flex-row space-x-3 mb-4 gap-2">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
          <TouchableOpacity
            onPress={() => openDatePicker('startDate')}
            className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-900 text-sm">
              {newTask.startDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">End Date</Text>
          <TouchableOpacity
            onPress={() => openDatePicker('endDate')}
            className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-900 text-sm">
              {newTask.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <Text className={`${newTask.status ? 'text-gray-900' : 'text-gray-500'}`}>
              {newTask.status ? statusOptions.find(s => s.value === newTask.status)?.label : 'Select Status'}
            </Text>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {showStatusDropdown && (
            <View className="absolute top-12 left-0 bg-white rounded-lg shadow-xl z-10 w-full border border-gray-200">
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  className={`px-4 py-3 border-b border-gray-100 flex-row items-center justify-between ${status.bg}`}
                  onPress={() => {
                    setNewTask(prev => ({ ...prev, status: status.value }));
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text className={`${status.color} font-medium`}>{status.label}</Text>
                  {newTask.status === status.value && (
                    <View className="w-2 h-2 rounded-full bg-red-600" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      <View className="mb-4">
        <PaperTextInput
          label="Comment (Optional)"
          value={newTask.comment}
          onChangeText={(text) => setNewTask(prev => ({ ...prev, comment: text }))}
          mode="outlined"
          theme={{ colors: { primary: '#DC2626' } }}
          multiline
          numberOfLines={3}
          placeholder="Add any additional notes or comments"
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Before Images (Optional)</Text>
        <TouchableOpacity
          onPress={() => pickImages('beforeImages')}
          className="flex-row items-center justify-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg py-4 mb-2"
        >
          <Camera size={20} color="#3B82F6" />
          <Text className="text-blue-600 ml-2 font-medium">Add Before Images</Text>
        </TouchableOpacity>
        
        {newTask.beforeImages && newTask.beforeImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {newTask.beforeImages.map((image, index) => (
              <View key={index} className="relative mr-2">
                <Image source={{ uri: image }} className="w-16 h-16 rounded-lg" />
                <TouchableOpacity
                  onPress={() => removeImage('beforeImages', index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">After Images (Optional)</Text>
        <TouchableOpacity
          onPress={() => pickImages('afterImages')}
          className="flex-row items-center justify-center bg-green-50 border-2 border-dashed border-green-300 rounded-lg py-4 mb-2"
        >
          <Camera size={20} color="#10B981" />
          <Text className="text-green-600 ml-2 font-medium">Add After Images</Text>
        </TouchableOpacity>
        
        {newTask.afterImages && newTask.afterImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {newTask.afterImages.map((image, index) => (
              <View key={index} className="relative mr-2">
                <Image source={{ uri: image }} className="w-16 h-16 rounded-lg" />
                <TouchableOpacity
                  onPress={() => removeImage('afterImages', index)}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Add Document or Image Section */}
      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-2">Attachment (PDF/Image, Optional)</Text>
        <TouchableOpacity
          onPress={pickDocument}
          className="flex-row items-center justify-center bg-purple-50 border-2 border-dashed border-purple-300 rounded-lg py-4 mb-2"
        >
          <FileText size={20} color="#8B5CF6" />
          <Text className="text-purple-600 ml-2 font-medium">Add Document or Image</Text>
        </TouchableOpacity>
        {newTask.attachment && (
          <View className="flex-row items-center mt-2 bg-gray-50 rounded-lg px-3 py-2">
            <FileText size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-700 flex-1">{newTask.attachment.name}</Text>
            <TouchableOpacity onPress={() => setNewTask(prev => ({ ...prev, attachment: null }))}>
              <X size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="flex-row space-x-3 gap-4">
        <TouchableOpacity
          onPress={() => setShowAddTaskForm(false)}
          className="flex-1 bg-gray-100 py-3 rounded-lg"
        >
          <Text className="text-gray-700 text-center font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={creating}
          className={`flex-1 py-3 rounded-lg ${
            creating ? 'bg-red-400' : 'bg-red-600'
          }`}
        >
          {creating ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-medium ml-2">Creating...</Text>
            </View>
          ) : (
            <Text className="text-white text-center font-medium">Create Task</Text>
          )}
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={newTask[activeDateField] || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default AddTaskForm;