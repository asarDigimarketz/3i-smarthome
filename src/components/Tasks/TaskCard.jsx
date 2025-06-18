import * as FileSystem from 'expo-file-system';
import { ArrowLeft, Check, FileText, Share2, SquarePen } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import ImageView from 'react-native-image-viewing';
import PDFView from 'react-native-view-pdf';

const TaskCard = ({ task, employees, handleEditTask }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageType, setSelectedImageType] = useState('before');
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);

  const handleImagePress = (type, index) => {
    setSelectedImageType(type);
    setCurrentImageIndex(index);
    setIsImageViewVisible(true);
  };

  const handleOpenAttachment = async () => {
    try {
      if (!task.attachment) return;

      // For demo purposes - replace with your actual file URL
      const fileUrl = `https://your-api-url/attachments/${task.attachment}`;
      const fileUri = `${FileSystem.documentDirectory}${task.attachment}`;

      // Download file
      const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
      setPdfUri(uri);
      setShowPDF(true);
    } catch (error) {
      console.error('Error opening attachment:', error);
      // Handle error (show alert to user)
    }
  };

  return (
    <View className="border border-gray-100 rounded-lg p-2">
      <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center">
          <Check size={16} color="white" />
        </View>
        <Text className="text-lg font-medium text-gray-900 ml-2">
          {task.title}
        </Text>
        <View className="ml-auto">
          <View className="bg-green-100 px-3 py-1 rounded-full">
            <Text className="text-green-600 text-xs font-medium">{task.status}</Text>
          </View>
        </View>
      </View>

      {/* Assignee */}
      <View className="mb-3">
        <Text className="text-gray-600 text-sm">Assignee: {
          employees.find(emp => emp.name === task.assignee)?.name
        }</Text>
      </View>

      {/* Dates */}
      <View className="flex-row mb-3">
        <Text className="text-gray-600 text-sm">Start Date: {task.startDate}</Text>
        <Text className="text-gray-600 text-sm ml-4">End Date: {task.endDate}</Text>
      </View>

      {/* Note */}
      <View className="mb-4">
        <Text className="text-gray-600 text-sm">
          Note: {task.note}
        </Text>
      </View>

      {/* Images */}
      <View className="flex-row justify-between mb-4">
        {/* Before Images */}
        <View className="flex-1 mr-2">
          <Text className="text-gray-600 text-sm mb-2">Before</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {task.beforeImages.map((uri, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => handleImagePress('before', index)}
              >
                <Image 
                  source={{ uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* After Images */}
        <View className="flex-1 ml-2">
          <Text className="text-gray-600 text-sm mb-2">After</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {task.afterImages.map((uri, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => handleImagePress('after', index)}
              >
                <Image 
                  source={{ uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Image Viewer Modal */}
      <ImageView
        images={selectedImageType === 'before' 
          ? task.beforeImages.map(uri => ({ uri }))
          : task.afterImages.map(uri => ({ uri }))
        }
        imageIndex={currentImageIndex}
        visible={isImageViewVisible}
        onRequestClose={() => setIsImageViewVisible(false)}
        presentationStyle="overFullScreen"
        animationType="fade"
        doubleTapToZoom
        swipeToCloseEnabled
        HeaderComponent={({ imageIndex }) => (
          <View className="w-full px-4 py-3 bg-black/50 flex-row items-center">
            <TouchableOpacity 
              onPress={() => setIsImageViewVisible(false)}
              className="absolute left-4 z-10"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-white text-center">
              {selectedImageType === 'before' ? 'Before' : 'After'} Image {imageIndex + 1} of {
                selectedImageType === 'before' ? task.beforeImages.length : task.afterImages.length
              }
            </Text>
          </View>
        )}
      />

      {/* PDF Viewer Modal */}
      <Modal
        visible={showPDF}
        onRequestClose={() => setShowPDF(false)}
        animationType="slide"
      >
        <View className="flex-1 bg-black">
          <View className="w-full px-4 py-3 bg-black/50 flex-row items-center">
            <TouchableOpacity 
              onPress={() => setShowPDF(false)}
              className="absolute left-4 z-10"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <Text className="flex-1 text-white text-center">
              {task.attachment}
            </Text>
          </View>
          
          {pdfUri && (
            <PDFView
              fileUrl={pdfUri}
              style={{ flex: 1 }}
              onError={(error) => {
                console.error('PDF Error:', error);
                // Handle PDF load error
              }}
            />
          )}
        </View>
      </Modal>

      {/* Attachment Button */}
      <TouchableOpacity 
        className="flex-row items-center bg-gray-50 p-3 rounded-lg"
        onPress={handleOpenAttachment}
      >
        <FileText size={20} color="#6B7280" />
        <Text className="flex-1 text-gray-600 text-sm ml-2">
          {task.attachment || 'No attachment'}
        </Text>
        {task.attachment && (
          <Text className="text-blue-600 text-sm">Open</Text>
        )}
      </TouchableOpacity>

      <View className="mt-4">
        <View className="flex-row justify-end space-x-2">
          <TouchableOpacity 
            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => handleEditTask(task)}
          >
            <SquarePen size={16} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity 
            className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
            onPress={() => {/* Handle share */}}
          >
            <Share2 size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default TaskCard;