import * as FileSystem from 'expo-file-system';
import { ArrowLeft, Check, FileText, Share2, SquarePen, Trash2, Calendar } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View, Dimensions, Alert, Linking } from 'react-native';
import ImageView from 'react-native-image-viewing';
import { API_CONFIG } from '../../../config';
import { useAuth } from '../../utils/AuthContext';
import { getPageActions } from '../../utils/permissions';

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

const TaskCard = ({ task, employees, handleEditTask, onDeleteTask }) => {
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedImageType, setSelectedImageType] = useState('before');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalIndex, setImageModalIndex] = useState(0);
  const [imageModalImages, setImageModalImages] = useState([]);
  const { user } = useAuth();
  const actions = getPageActions(user, '/dashboard/tasks');
 

  // Format date exactly like web version
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    
    // If it's already in DD/MM/YYYY format, return as is
    if (typeof dateString === 'string' && dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return dateString;
    }
    
    // If it's empty or invalid, return "-"
    if (!dateString || dateString === '') {
      return "-";
    }
    
    return dateString;
  };

  // Get formatted dates
  const formattedStartDate = formatDate(task.startDate);
  const formattedEndDate = formatDate(task.endDate);

  // Debug task data
  // console.log('Task dates:', {
  //   startDate: task.startDate,
  //   endDate: task.endDate,
  //   formattedStartDate,
  //   formattedEndDate
  // });

  // Get status with proper case handling and normalization
  const getStatus = () => {
    if (!task.status) return 'new';
    const normalizedStatus = String(task.status).toLowerCase().trim();
    
    if (normalizedStatus === 'in progress' || normalizedStatus === 'inprogress') {
      return 'inprogress';
    } else if (normalizedStatus === 'done' || normalizedStatus === 'completed') {
      return 'completed';
    }
    return 'new';
  };

  const status = getStatus();

  const handleImagePress = (type, index) => {
    setSelectedImageType(type);
    setCurrentImageIndex(index);
    setIsImageViewVisible(true);
  };

  const handleOpenAttachment = async (attachment) => {
    try {
      if (!attachment) {
        Alert.alert('Error', 'Invalid attachment');
        return;
      }

      const fullUrl = getFullUrl(attachment.url);
     

      // Check if it's an image
      if (attachment.mimetype?.startsWith('image/')) {
        // Handle image - open in image viewer
        setSelectedImageType('attachment');
        setCurrentImageIndex(0);
        setIsImageViewVisible(true);
        return;
      }

      // For PDFs and other documents, try to open externally
      const supported = await Linking.canOpenURL(fullUrl);
      if (supported) {
        await Linking.openURL(fullUrl);
      } else {
        Alert.alert(
          'Cannot Open File', 
          'This file type is not supported on your device. Please try opening it on a computer.',
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Copy Link', 
              onPress: () => {
                // If available, copy to clipboard
                console.log('File URL copied:', fullUrl);
                Alert.alert('Link Copied', 'File URL has been logged to console.');
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('❌ Error opening attachment:', error);
      Alert.alert(
        'Error', 
        'Could not open the file. Please check your internet connection and try again.',
        [
          { text: 'OK', style: 'default' },
          { 
            text: 'Retry', 
            onPress: () => handleOpenAttachment(attachment)
          }
        ]
      );
    }
  };

  // Helper function to get all images from attachments
  const getImagesFromAttachments = (attachments) => {
    if (!attachments || attachments.length === 0) return [];
    return attachments
      .filter(attachment => attachment.mimetype && attachment.mimetype.startsWith('image'))
      .map(attachment => ({ 
        uri: getFullUrl(attachment.url), 
        name: attachment.originalName 
      }));
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
  const generalImages = getImagesFromAttachments(task.attachements);
  const beforeDocuments = getDocumentsFromAttachments(task.beforeAttachments);
  const afterDocuments = getDocumentsFromAttachments(task.afterAttachments);
  const generalDocuments = getDocumentsFromAttachments(task.attachements);

  const openImageModal = (images, index) => {
    setImageModalImages(images);
    setImageModalIndex(index);
    setShowImageModal(true);
  };

  return (
    <View className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
      <View className="flex-row items-center justify-between mb-3">
        {/* Left side: Icon + Title */}
        <View className="flex-row items-center flex-1 mr-3">
          {/* Status Icon */}
          <View className="mr-2">
            {status === 'new' && (
              <View className="w-6 h-6 border-2 border-[#CACACA] rounded-full items-center justify-center" />
            )}
            {status === 'inprogress' && (
              <View className="w-6 h-6 items-center justify-center">
                <ArrowLeft size={20} color="#FFB74D" />
              </View>
            )}
            {status === 'completed' && (
              <View className="w-6 h-6 rounded-full bg-[#16A34A] items-center justify-center">
                <Check size={16} color="white" />
              </View>
            )}
          </View>
          <Text className="text-base font-semibold text-[#181818] flex-1" numberOfLines={1}>
            {task.title}
          </Text>
        </View>

        {/* Right side: Status Badge */}
        <View>
          {status === 'new' && (
            <View className="px-3 py-1 rounded-full bg-[#CACACA]">
              <Text className="text-xs font-semibold text-[#181818]">
                New Task
              </Text>
            </View>
          )}
          {status === 'inprogress' && (
            <View className="px-3 py-1 rounded-full bg-[#FFB74D]">
              <Text className="text-xs font-semibold text-[#181818]">
                In Progress
              </Text>
            </View>
          )}
          {status === 'completed' && (
            <View className="px-3 py-1 rounded-full bg-[#16A34A]">
              <Text className="text-xs font-semibold text-white">
                Done
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Dates */}
      <View className="mb-3">
        <View className="flex-row justify-between items-center">
          {/* Start Date */}
          <View className="flex-1">
            <View className="flex-row items-center">
              <Calendar size={14} color="#616161" />
              <Text className="text-sm text-[#616161] ml-1">
                Start Date
              </Text>
            </View>
            <Text className="text-sm font-medium text-[#181818] mt-1">
              {formattedStartDate}
            </Text>
          </View>

          {/* End Date */}
          <View className="flex-1 items-end">
            <View className="flex-row items-center">
              <Calendar size={14} color="#616161" />
              <Text className="text-sm text-[#616161] ml-1">
                End Date
              </Text>
            </View>
            <Text className="text-sm font-medium text-[#181818] mt-1">
              {formattedEndDate}
            </Text>
          </View>
        </View>
      </View>

      {/* Assignee */}
      <View className="mb-3">
        <Text className="text-[#616161] text-sm">
          Assignee:{' '}
          <Text className="font-semibold text-[#181818]">
            {(() => {
              // Handle different assignedTo structures
              if (task.assignedTo) {
                // If it's a single object (most common case)
                if (!Array.isArray(task.assignedTo)) {
                  const assignee = task.assignedTo;
                  if (assignee.firstName && assignee.lastName) {
                    return `${assignee.firstName} ${assignee.lastName}`;
                  } else if (assignee.name) {
                    return assignee.name;
                  } else {
                    return task.assignee || 'Unassigned';
                  }
                }
                
                // If it's an array of assignees
                if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0) {
                  return task.assignedTo.map((emp, idx) => {
                    let name = '';
                    if (emp.firstName && emp.lastName) {
                      name = `${emp.firstName} ${emp.lastName}`;
                    } else if (emp.name) {
                      name = emp.name;
                    } else {
                      // Try to find in employees list
                      const found = employees.find(e => e._id === emp._id || e.id === emp._id || e._id === emp);
                      name = found ? found.name : 'Unknown';
                    }
                    return idx < task.assignedTo.length - 1 ? `${name}, ` : name;
                  }).join('');
                }
              }
              
              // Fallback to task.assignee if assignedTo is not available
              return task.assignee || 'Unassigned';
            })()}
          </Text>
        </Text>
      </View>

      {/* Note/Comment */}
      <View className="mb-4">
        <Text className="text-[#616161] text-sm">
          Note: <Text className="text-[#181818]">{task.comment || task.note || ''}</Text>
        </Text>
      </View>

      {/* Before Images */}
      {beforeImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Before Images</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {beforeImages.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => openImageModal(beforeImages, index)}
              >
                <Image 
                  source={{ uri: img.uri }}
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
            {afterImages.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => openImageModal(afterImages, index)}
              >
                <Image 
                  source={{ uri: img.uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* General Images (from attachements) */}
      {generalImages.length > 0 && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Attachments (Images)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-2">
            {generalImages.map((img, index) => (
              <TouchableOpacity 
                key={index} 
                className="mr-2"
                onPress={() => openImageModal(generalImages, index)}
              >
                <Image 
                  source={{ uri: img.uri }}
                  className="w-24 h-24 rounded-lg"
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Attachments (Documents) */}
      {(beforeDocuments.length > 0 || afterDocuments.length > 0 || generalDocuments.length > 0) && (
        <View className="mb-4">
          <Text className="text-gray-600 text-sm mb-2">Attachments (Documents)</Text>
          {[...beforeDocuments, ...afterDocuments, ...generalDocuments].map((document, index) => (
            <TouchableOpacity 
              key={`doc-${index}`}
              className="flex-row items-center bg-gray-50 p-2 rounded-lg mb-1"
              onPress={() => handleOpenAttachment(document)}
            >
              <FileText size={16} color="#3B82F6" />
              <Text className="text-blue-600 text-sm ml-2 flex-1">{document.originalName}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Image Preview Modal */}
      <ImageView
        images={imageModalImages}
        imageIndex={imageModalIndex}
        visible={showImageModal}
        onRequestClose={() => setShowImageModal(false)}
        swipeToCloseEnabled={true}
        doubleTapToZoomEnabled={true}
      />

      {/* Remove the File Viewer Modal */}

      <View className="mt-4">
        <View className="flex-row justify-end space-x-2 gap-2">
          <TouchableOpacity 
            className="w-8 h-8 bg-gray-100 rounded-lg items-center justify-center p-2"
            onPress={() => handleEditTask(task)}
            disabled={!actions.edit}
          >
            <SquarePen size={16} color="#6B7280" />
          </TouchableOpacity>
          {onDeleteTask && (
            <TouchableOpacity 
              className="w-8 h-8 bg-red-100 rounded-lg items-center justify-center p-2"
              onPress={onDeleteTask}
              disabled={!actions.delete}
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