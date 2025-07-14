import React, { useState } from 'react';
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from 'expo-document-picker';
import { Calendar, Check, ChevronDown, FileText, X, User, Camera, Save } from "lucide-react-native";
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert, ActionSheetIOS, Platform } from "react-native";
import { TextInput as PaperTextInput } from 'react-native-paper';
import { API_CONFIG } from '../../../config';
import * as ImagePicker from 'expo-image-picker';

const EditTaskForm = ({
  editingTask,
  setEditingTask,
  showDatePicker,
  setShowDatePicker,
  activeDateField,
  setActiveDateField,
  showStatusDropdown,
  setShowStatusDropdown,
  statusOptions,
  setShowEditForm,
  onUpdateTask,
  updating,
  employees = [],
  projectId
}) => {
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [existingBeforeImages, setExistingBeforeImages] = useState(
    editingTask.beforeAttachments?.filter(att => att.mimetype?.startsWith('image')) || []
  );
  const [existingAfterImages, setExistingAfterImages] = useState(
    editingTask.afterAttachments?.filter(att => att.mimetype?.startsWith('image')) || []
  );
  const [existingAttachments, setExistingAttachments] = useState(
    editingTask.attachements?.filter(att => att.mimetype?.startsWith('image')) || []
  );

  // Add pickImages function
  const pickImages = async (field) => {
    const setImages = (images) => {
      setEditingTask(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), ...images]
      }));
    };

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
              setImages(result.assets.map(a => a.uri));
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
              allowsEditing: false,
              aspect: [4, 3],
              quality: 1,
            });
            if (!result.canceled && result.assets && result.assets.length > 0) {
              setImages(result.assets.map(a => a.uri));
            }
          }
        }
      );
    } else {
      // For Android
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
                setImages(result.assets.map(a => a.uri));
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
                allowsEditing: false,
                aspect: [4, 3],
                quality: 1,
              });
              if (!result.canceled && result.assets && result.assets.length > 0) {
                setImages(result.assets.map(a => a.uri));
              }
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  // Add removeImage function
  const removeImage = (field, index) => {
    setEditingTask(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };
  const getFullUrl = (url) => {
    if (!url) return '';
    // if (url.startsWith('http')) {
    //   console.log('📱 Task Image URL Details:');
    //   console.log('  └─ Type: Direct URL (no modification needed)');
    //   console.log('  └─ URL:', url);
    //   return url;
    // }
    let fullLogoUrl;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      fullLogoUrl = url.replace('http://localhost:5000', API_CONFIG.API_URL)
                             .replace('https://localhost:5000', API_CONFIG.API_URL);
    } else if (url.startsWith('/')) {
      fullLogoUrl = `${API_CONFIG.API_URL}${url}`;
    } else {
      fullLogoUrl = `${API_CONFIG.API_URL}/${url}`;
    }
    
    return fullLogoUrl;
  };
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'], // Allowed file types
        copyToCacheDirectory: true
      });

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setEditingTask(prev => ({
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
      setEditingTask(prev => ({
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
    setEditingTask(prev => ({
      ...prev,
      assignedTo: {
        _id: employee.id,
        name: employee.name,
        firstName: employee.firstName,
        lastName: employee.lastName
      }
    }));
    setShowAssigneeDropdown(false);
  };

  // Get selected employee name for display
  const getSelectedEmployeeName = () => {
    if (!editingTask.assignedTo || !editingTask.assignedTo._id) return 'Select Assignee';
    return editingTask.assignedTo.name || `${editingTask.assignedTo.firstName} ${editingTask.assignedTo.lastName}`;
  };

  const handleSubmit = async () => {
    // Validation
    if (!projectId) {
      Alert.alert('Validation Error', 'Project is required');
      return;
    }
    if (!editingTask.title || !editingTask.title.trim()) {
      Alert.alert('Validation Error', 'Task title is required');
      return;
    }
    if (!editingTask.status || !['new','inprogress','completed'].includes(editingTask.status)) {
      Alert.alert('Validation Error', 'Please select a valid status');
      return;
    }
    if (!editingTask.startDate) {
      Alert.alert('Validation Error', 'Start date is required');
      return;
    }

    // Prepare payload for update
    const formData = new FormData();
    formData.append('projectId', projectId);
    formData.append('title', editingTask.title);
    formData.append('comment', editingTask.comment || '');
    formData.append('startDate', editingTask.startDate.toISOString());
    if (editingTask.endDate) formData.append('endDate', editingTask.endDate.toISOString());
    if (editingTask.assignedTo && editingTask.assignedTo._id) formData.append('assignedTo', editingTask.assignedTo._id);
    formData.append('status', editingTask.status);

    // Append existing before images that weren't removed
    existingBeforeImages.forEach((image, idx) => {
      formData.append('existingBeforeAttachments', JSON.stringify({
        url: image.url,
        originalName: image.originalName,
        mimetype: image.mimetype
      }));
    });

    // Append existing after images that weren't removed
    existingAfterImages.forEach((image, idx) => {
      formData.append('existingAfterAttachments', JSON.stringify({
        url: image.url,
        originalName: image.originalName,
        mimetype: image.mimetype
      }));
    });

    // Append existing general attachments that weren't removed
    existingAttachments.forEach((image, idx) => {
      formData.append('existingAttachments', JSON.stringify({
        url: image.url,
        originalName: image.originalName,
        mimetype: image.mimetype
      }));
    });

    // Attach new before images
    if (editingTask.beforeImages && editingTask.beforeImages.length > 0) {
      editingTask.beforeImages.forEach((uri, idx) => {
        formData.append('beforeAttachments', {
          uri,
          name: `before_${idx}.jpg`,
          type: 'image/jpeg',
        });
      });
    }

    // Attach new after images
    if (editingTask.afterImages && editingTask.afterImages.length > 0) {
      editingTask.afterImages.forEach((uri, idx) => {
        formData.append('afterAttachments', {
          uri,
          name: `after_${idx}.jpg`,
          type: 'image/jpeg',
        });
      });
    }

    // Attach new document (PDF/Image) as attachements array
    if (editingTask.attachment) {
      formData.append('attachements', {
        uri: editingTask.attachment.uri,
        name: editingTask.attachment.name,
        type: editingTask.attachment.type,
      });
    }

    try {
      // Call the update callback with the correct payload
      await onUpdateTask(formData);
      setShowEditForm(false);
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Failed to update task. Please try again.');
    }
  };

  return (
    <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-semibold text-gray-900">Edit Task</Text>
        <TouchableOpacity 
          onPress={() => setShowEditForm(false)}
          className="p-2"
        >
          <X size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Task Title */}
      <View className="mb-4">
        <PaperTextInput
          label="Task Title"
          value={editingTask.title}
          onChangeText={(text) => setEditingTask(prev => ({ ...prev, title: text }))}
          mode="outlined"
          theme={{ colors: { primary: '#DC2626' } }}
          left={<PaperTextInput.Icon icon={() => <FileText size={20} color="#6B7280" />} />}
          placeholder="Enter task title"
        />
      </View>

      {/* Assignee Dropdown - Enhanced with API data */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Assignee</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <View className="flex-row items-center flex-1">
              <User size={16} color="#6B7280" />
              <Text className={`ml-2 ${editingTask.assignedTo?.name ? 'text-gray-900' : 'text-gray-500'}`}>
                {getSelectedEmployeeName()}
              </Text>
            </View>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {showAssigneeDropdown && (
            <View className="absolute top-12 left-0 bg-white rounded-lg shadow-xl z-20 w-full max-h-48 border border-gray-200">
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Unassigned option */}
                <TouchableOpacity
                  className="px-4 py-3 border-b border-gray-100 flex-row items-center"
                  onPress={() => {
                    setEditingTask(prev => ({ ...prev, assignedTo: null }));
                    setShowAssigneeDropdown(false);
                  }}
                >
                  <View className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center mr-3">
                    <User size={16} color="#6B7280" />
                  </View>
                  <Text className="text-gray-600 text-sm">Unassigned</Text>
                  {!editingTask.assignedTo?.name && (
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
                      {editingTask.assignedTo?._id === employee.id && (
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

      {/* Date Fields */}
      <View className="flex-row space-x-3 mb-4">
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-700 mb-2">Start Date</Text>
          <TouchableOpacity
            onPress={() => openDatePicker('startDate')}
            className="flex-row items-center bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <Calendar size={16} color="#6B7280" />
            <Text className="ml-2 text-gray-900 text-sm">
              {editingTask.startDate.toLocaleDateString()}
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
              {editingTask.endDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Status Dropdown */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Status</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex-row items-center justify-between bg-gray-50 border border-gray-300 rounded-lg px-3 py-3"
          >
            <Text className={`${editingTask.status ? 'text-gray-900' : 'text-gray-500'}`}>
              {editingTask.status ? statusOptions.find(s => s.value === editingTask.status)?.label : 'Select Status'}
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
                    setEditingTask(prev => ({ ...prev, status: status.value }));
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text className={`${status.color} font-medium`}>{status.label}</Text>
                  {editingTask.status === status.value && (
                    <View className="w-2 h-2 rounded-full bg-red-600" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* Comment */}
      <View className="mb-4">
        <PaperTextInput
          label="Comment (Optional)"
          value={editingTask.comment || editingTask.note || ''}
          onChangeText={(text) => setEditingTask(prev => ({ ...prev, comment: text, note: text }))}
          mode="outlined"
          theme={{ colors: { primary: '#DC2626' } }}
          multiline
          numberOfLines={3}
          placeholder="Add any additional notes or comments"
        />
      </View>

      {/* Before Images Section */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Before Images</Text>
        
        {/* Existing Before Images */}
        {existingBeforeImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {existingBeforeImages.map((image, index) => (
              <View key={`existing-before-${index}`} className="relative mr-2">
                <Image 
                  source={{ uri: getFullUrl(image.url) }} 
                  className="w-16 h-16 rounded-lg" 
                />
                <TouchableOpacity
                  onPress={() => {
                    const newImages = existingBeforeImages.filter((_, i) => i !== index);
                    setExistingBeforeImages(newImages);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        
        {/* New Before Images */}
        {editingTask.beforeImages && editingTask.beforeImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {editingTask.beforeImages.map((image, index) => (
              <View key={`new-before-${index}`} className="relative mr-2">
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

        <TouchableOpacity
          onPress={() => pickImages('beforeImages')}
          className="flex-row items-center justify-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg py-4"
        >
          <Camera size={20} color="#3B82F6" />
          <Text className="text-blue-600 ml-2 font-medium">Add Before Images</Text>
        </TouchableOpacity>
      </View>

      {/* After Images Section */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">After Images</Text>
        
        {/* Existing After Images */}
        {existingAfterImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {existingAfterImages.map((image, index) => (
              <View key={`existing-after-${index}`} className="relative mr-2">
                <Image 
                  source={{ uri: getFullUrl(image.url) }} 
                  className="w-16 h-16 rounded-lg" 
                />
                <TouchableOpacity
                  onPress={() => {
                    const newImages = existingAfterImages.filter((_, i) => i !== index);
                    setExistingAfterImages(newImages);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
        
        {/* New After Images */}
        {editingTask.afterImages && editingTask.afterImages.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {editingTask.afterImages.map((image, index) => (
              <View key={`new-after-${index}`} className="relative mr-2">
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

        <TouchableOpacity
          onPress={() => pickImages('afterImages')}
          className="flex-row items-center justify-center bg-green-50 border-2 border-dashed border-green-300 rounded-lg py-4"
        >
          <Camera size={20} color="#10B981" />
          <Text className="text-green-600 ml-2 font-medium">Add After Images</Text>
        </TouchableOpacity>
      </View>

      {/* General Attachments Section */}
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">General Attachments</Text>
        
        {/* Existing Attachments */}
        {existingAttachments.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {existingAttachments.map((image, index) => (
              <View key={`existing-attachment-${index}`} className="relative mr-2">
                <Image 
                  source={{ uri: getFullUrl(image.url) }} 
                  className="w-16 h-16 rounded-lg" 
                />
                <TouchableOpacity
                  onPress={() => {
                    const newAttachments = existingAttachments.filter((_, i) => i !== index);
                    setExistingAttachments(newAttachments);
                  }}
                  className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1"
                >
                  <X size={12} color="white" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Action Buttons */}
      <View className="flex-row space-x-3">
        <TouchableOpacity
          onPress={() => setShowEditForm(false)}
          className="flex-1 bg-gray-100 py-3 rounded-lg"
        >
          <Text className="text-gray-700 text-center font-medium">Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={updating}
          className={`flex-1 py-3 rounded-lg ${
            updating ? 'bg-blue-400' : 'bg-blue-600'
          }`}
        >
          {updating ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" />
              <Text className="text-white font-medium ml-2">Updating...</Text>
            </View>
          ) : (
            <View className="flex-row items-center justify-center">
              <Save size={16} color="white" />
              <Text className="text-white font-medium ml-2">Update Task</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={editingTask[activeDateField] || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
        />
      )}
    </View>
  );
};

export default EditTaskForm;
