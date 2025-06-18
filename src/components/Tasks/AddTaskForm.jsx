import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { Calendar, Check, ChevronDown, FileText } from 'lucide-react-native';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  pickImages,
  removeImage,
  setShowAddTaskForm
}) => {
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

  return (
    <View className="border border-gray-100 rounded-lg p-4 mb-4">
      {/* Title Input */}
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
      <View className="flex mb-4">
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

      {/* Status Dropdown */}
      <View className="mb-4">
        <Text className="text-gray-600 text-sm mb-1">Status:</Text>
        <View className="relative">
          <TouchableOpacity
            onPress={() => setShowStatusDropdown(!showStatusDropdown)}
            className="flex-row items-center justify-between bg-gray-100 rounded-lg h-12 px-4 w-full"
          >
            <Text className={`${
              newTask.status ? 
                newTask.status === 'New' ? 'text-blue-600' :
                newTask.status === 'In Progress' ? 'text-yellow-600' :
                newTask.status === 'Done' ? 'text-green-600' :
                'text-gray-500'
              : 'text-gray-500'
            } text-sm font-medium`}>
              {newTask.status || 'Select Status'}
            </Text>
            <ChevronDown size={16} color="#6B7280" />
          </TouchableOpacity>
          
          {showStatusDropdown && (
            <View className="absolute top-14 left-0 bg-white rounded-lg shadow-xl z-10 w-full">
              {statusOptions.map((status) => (
                <TouchableOpacity
                  key={status.value}
                  className={`px-4 py-3 border-b border-gray-100 ${status.bg}`}
                  onPress={() => {
                    setNewTask({ ...newTask, status: status.value });
                    setShowStatusDropdown(false);
                  }}
                >
                  <Text className={`${status.color} text-sm font-medium`}>
                    {status.value}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </View>

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
        {/* Before Images */}
        <View className="flex-1 mr-2">
          <Text className="text-gray-600 text-sm mb-2">Before Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newTask.beforeImages.map((uri, index) => (
              <View key={index} className="mr-2 relative">
                <Image 
                  source={{ uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                  onPress={() => removeImage('beforeImages', index)}
                >
                  <Text className="text-white text-xs">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              className="w-24 h-24 border border-gray-200 rounded-lg items-center justify-center"
              onPress={() => pickImages('beforeImages')}
            >
              <Text className="text-blue-600">+ Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* After Images */}
        <View className="flex-1 ml-2">
          <Text className="text-gray-600 text-sm mb-2">After Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {newTask.afterImages.map((uri, index) => (
              <View key={index} className="mr-2 relative">
                <Image 
                  source={{ uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
                <TouchableOpacity 
                  className="absolute top-1 right-1 bg-red-500 rounded-full p-1"
                  onPress={() => removeImage('afterImages', index)}
                >
                  <Text className="text-white text-xs">×</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              className="w-24 h-24 border border-gray-200 rounded-lg items-center justify-center"
              onPress={() => pickImages('afterImages')}
            >
              <Text className="text-blue-600">+ Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

      {/* Attachment */}
      <View className="mb-4">
        <TouchableOpacity 
          className="flex-row items-center bg-gray-50 p-3 rounded-lg"
          onPress={pickDocument}
        >
          <FileText size={20} color="#6B7280" />
          <Text className="flex-1 text-gray-600 text-sm ml-2">
            {newTask.attachment?.name || 'Add attachment'}
          </Text>
          {newTask.attachment && (
            <TouchableOpacity
              className="bg-red-100 rounded-full p-1"
              onPress={() => setNewTask(prev => ({ ...prev, attachment: null }))}
            >
              <Text className="text-red-600 text-xs px-1">×</Text>
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>

      {/* Submit Buttons */}
      <View className="flex-row space-x-2 gap-2">
        <TouchableOpacity 
          className="flex-1 bg-red-600 p-4 rounded-full"
          onPress={() => {
            // Handle task creation
            setShowAddTaskForm(false);
          }}
        >
          <Text className="text-white text-center font-medium">Create Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AddTaskForm;