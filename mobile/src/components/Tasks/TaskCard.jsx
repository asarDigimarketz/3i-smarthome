import * as FileSystem from 'expo-file-system';
import { ArrowLeft, Check, FileText, Share2, SquarePen, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View, Dimensions } from 'react-native';
import ImageView from 'react-native-image-viewing';
import PDFView from 'react-native-view-pdf';
import { WebView } from 'react-native-webview';

const TaskCard = ({ task, employees, handleEditTask, onDeleteTask }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageType, setSelectedImageType] = useState('before');
  const [showPDF, setShowPDF] = useState(false);
  const [pdfUri, setPdfUri] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);
  const [imageModalImages, setImageModalImages] = useState([]);

  const handleImagePress = (type, index) => {
    setSelectedImageType(type);
    setCurrentImageIndex(index);
    setIsImageViewVisible(true);
  };

  const handleOpenAttachment = async (attachment) => {
    try {
      if (!attachment) return;

      // Check if it's a PDF or image
      if (attachment.mimetype && attachment.mimetype.startsWith('image')) {
        // Handle image - open in image viewer
        setSelectedImageType('attachment');
        setCurrentImageIndex(0);
        setIsImageViewVisible(true);
      } else {
        // Handle PDF or other document
        const fileUrl = attachment.url;
        const fileUri = `${FileSystem.documentDirectory}${attachment.originalName}`;

        // Download file
        const { uri } = await FileSystem.downloadAsync(fileUrl, fileUri);
        setPdfUri(uri);
        setShowPDF(true);
      }
    } catch (error) {
      console.error('Error opening attachment:', error);
      // Handle error (show alert to user)
    }
  };

  const handleViewFile = (url, filename) => {
    setCurrentFileUrl(url);
    setCurrentFileName(filename);
    setShowFileModal(true);
  };

  const isImageFile = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };

  const isPdfFile = (filename) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return ext === 'pdf';
  };

  const renderFileViewer = () => {
    if (isImageFile(currentFileName)) {
      return (
        <Image
          source={{ uri: currentFileUrl }}
          style={{
            width: Dimensions.get('window').width - 40,
            height: Dimensions.get('window').height - 200,
            resizeMode: 'contain'
          }}
        />
      );
    } else {
      return (
        <WebView
          source={{ uri: currentFileUrl }}
          style={{
            width: Dimensions.get('window').width - 40,
            height: Dimensions.get('window').height - 200
          }}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      );
    }
  };

  // Helper function to get all images from attachments
  const getImagesFromAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return [];
    return attachments
      .filter(attachment => attachment.mimetype && attachment.mimetype.startsWith('image'))
      .map(attachment => attachment.url);
  };

  // Helper function to get documents from attachments
  const getDocumentsFromAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return [];
    return attachments.filter(attachment => 
      !attachment.mimetype || !attachment.mimetype.startsWith('image')
    );
  };

  const beforeImages = getImagesFromAttachments(task.beforeAttachments);
  const afterImages = getImagesFromAttachments(task.afterAttachments);
  const beforeDocuments = getDocumentsFromAttachments(task.beforeAttachments);
  const afterDocuments = getDocumentsFromAttachments(task.afterAttachments);

  const openImageModal = (images, index) => {
    setImageModalImages(images);
    setImageModalIndex(index);
    setShowImageModal(true);
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
          <View className={`px-3 py-1 rounded-full ${
            task.status === 'New' ? 'bg-blue-100' :
            task.status === 'In Progress' ? 'bg-yellow-100' :
            task.status === 'Done' ? 'bg-green-100' :
            'bg-gray-100'
          }`}>
            <Text className={`text-xs font-medium ${
              task.status === 'New' ? 'text-blue-600' :
              task.status === 'In Progress' ? 'text-yellow-600' :
              task.status === 'Done' ? 'text-green-600' :
              'text-gray-600'
            }`}>
              {task.status}
            </Text>
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

      {/* Before Images */}
      {beforeImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Before Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {beforeImages.map((imageUrl, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => openImageModal(beforeImages, index)}
              >
                <Image 
                  source={{ uri: imageUrl }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* After Images */}
      {afterImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">After Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {afterImages.map((imageUrl, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => openImageModal(afterImages, index)}
              >
                <Image 
                  source={{ uri: imageUrl }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Attachments (Documents & Images not in before/after) */}
      {((beforeDocuments.length > 0) || (afterDocuments.length > 0) || (task.attachment && !task.beforeAttachments && !task.afterAttachments)) && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Attachments</Text>
          {/* Before Documents */}
          {beforeDocuments.map((document, index) => (
            <TouchableOpacity 
              key={`before-doc-${index}`}
              className="flex-row items-center bg-gray-50 p-2 rounded-lg mb-1"
              onPress={() => handleOpenAttachment(document)}
            >
              <FileText size={16} color="#3B82F6" />
              <Text className="text-blue-600 text-sm ml-2 flex-1">{document.originalName}</Text>
            </TouchableOpacity>
          ))}
          {/* After Documents */}
          {afterDocuments.map((document, index) => (
            <TouchableOpacity 
              key={`after-doc-${index}`}
              className="flex-row items-center bg-gray-50 p-2 rounded-lg mb-1"
              onPress={() => handleOpenAttachment(document)}
            >
              <FileText size={16} color="#3B82F6" />
              <Text className="text-blue-600 text-sm ml-2 flex-1">{document.originalName}</Text>
            </TouchableOpacity>
          ))}
          {/* Single Attachment (legacy) */}
          {task.attachment && !task.beforeAttachments && !task.afterAttachments && (
            <TouchableOpacity 
              className="flex-row items-center bg-gray-50 p-3 rounded-lg mb-1"
              onPress={() => handleOpenAttachment(task.attachment)}
            >
              <FileText size={20} color="#6B7280" />
              <Text className="flex-1 text-gray-600 text-sm ml-2">
                {task.attachment.originalName || task.attachment || 'No attachment'}
              </Text>
              <Text className="text-blue-600 text-sm">Open</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View className="mt-4">
        <View className="flex-row justify-end space-x-2 gap-2">
          <TouchableOpacity 
            className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center p-2"
            onPress={() => handleEditTask(task)}
          >
            <SquarePen size={16} color="#6B7280" />
          </TouchableOpacity>
          {onDeleteTask && (
            <TouchableOpacity 
              className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center p-2"
              onPress={onDeleteTask}
            >
              <Trash2 size={16} color="#DC2626" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

export default TaskCard;