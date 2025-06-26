import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ChevronDown, X } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Alert, 
  ActivityIndicator, 
  Linking, 
  Modal, 
  Image, 
  Dimensions 
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { WebView } from 'react-native-webview';
import axios from 'axios';

// 🔧 NETWORK CONFIGURATION - UPDATE WITH YOUR DEVELOPMENT MACHINE'S IP
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // ✅ Your actual IP address

const ProposalDetail = () => {
  const router = useRouter();

  const { id } = useLocalSearchParams();
  const [proposalDetails, setProposalDetails] = useState({});
  const [status, setStatus] = useState('');
  const [amount, setAmount] = useState('');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [currentFileUrl, setCurrentFileUrl] = useState('');
  const [currentFileName, setCurrentFileName] = useState('');
  const [fileLoading, setFileLoading] = useState(false);

  const colors = {
    'Hot': { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-600' },
    'Cold': { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-600' },
    'Warm': { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-600' },
    'Scrap': { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-600' },
    'Confirmed': { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-600' }
  };

  const serviceColors = {
    'Home Cinema': { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-600' },
    'Security System': { bg: 'bg-cyan-50', text: 'text-cyan-600', border: 'border-cyan-600' },
    'Home Automation': { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-600' },
    'Outdoor Audio': { bg: 'bg-pink-50', text: 'text-pink-600', border: 'border-pink-600' }
  };

  const statusOptions = ['Hot', 'Cold', 'Warm', 'Scrap', 'Confirmed'];

  // Fetch proposal details from API
  const fetchProposalDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/proposals/${id}`, {
        headers: {
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
        }
      });

      if (response.data.success) {
        const proposal = response.data.data.proposal;
        
        // Transform API data to match component expectations
        const transformedProposal = {
          id: proposal._id,
          name: proposal.customerName,
          phone: proposal.contactNumber,
          email: proposal.email,
          address: typeof proposal.address === 'object' 
            ? `${proposal.address.addressLine || ''}, ${proposal.address.city || ''}, ${proposal.address.district || ''}, ${proposal.address.state || ''}, ${proposal.address.country || ''} - ${proposal.address.pincode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '').trim()
            : proposal.address || '',
          service: proposal.services || 'Unknown',
          description: proposal.projectDescription,
          size: proposal.size,
          amount: proposal.projectAmount,
          status: proposal.status,
          comment: proposal.comment,
          date: new Date(proposal.date).toLocaleDateString('en-IN') || new Date(proposal.createdAt).toLocaleDateString('en-IN'),
          attachmentUrl: response.data.data.attachmentUrl
        };

        setProposalDetails(transformedProposal);
        setStatus(transformedProposal.status);
        setAmount(transformedProposal.amount);
      } else {
        Alert.alert('Error', 'Failed to fetch proposal details');
      }
    } catch (error) {
      console.error('Error fetching proposal:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  // Update proposal status
  const updateProposalStatus = async (newStatus) => {
    try {
      setUpdating(true);
      
      const response = await axios.patch(`${API_BASE_URL}/api/proposals/${id}/field`, {
        field: 'status',
        value: newStatus
      }, {
        headers: {
          'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
        }
      });

      if (response.data.success) {
        setStatus(newStatus);
        setProposalDetails(prev => ({ ...prev, status: newStatus }));
        Alert.alert('Success', 'Status updated successfully');
      } else {
        Alert.alert('Error', 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Network error. Please check your connection.');
    } finally {
      setUpdating(false);
    }
  };

  // Confirm project - changes status to "Confirm" and creates project automatically
  const confirmProject = async () => {
    Alert.alert(
      'Confirm Project',
      'Are you sure you want to confirm this project? This will create a new project and lock the proposal.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Confirm',
          style: 'default',
          onPress: async () => {
            try {
              setUpdating(true);
              
              const response = await axios.patch(`${API_BASE_URL}/api/proposals/${id}/field`, {
                field: 'status',
                value: 'Confirmed'
              }, {
                headers: {
                  'x-api-key': process.env.EXPO_PUBLIC_API_KEY
                }
              });

              if (response.data.success) {
                setStatus('Confirmed');
                setProposalDetails(prev => ({ ...prev, status: 'Confirmed' }));
                
                // Check if project was created automatically
                const message = response.data.project 
                  ? 'Project confirmed successfully! A new project has been created automatically.'
                  : 'Project confirmed successfully!';
                
                Alert.alert('Success', message);
              } else {
                Alert.alert('Error', 'Failed to confirm project');
              }
            } catch (error) {
              console.error('Error confirming project:', error);
              Alert.alert('Error', 'Network error. Please check your connection.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  // Delete proposal
  const deleteProposal = async () => {
    Alert.alert(
      'Delete Proposal',
      'Are you sure you want to delete this proposal? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              
              const response = await axios.delete(`${API_BASE_URL}/api/proposals/${id}`, {
                headers: {
                  'x-api-key': process.env.EXPO_PUBLIC_API_KEY // Replace with your actual API key
                }
              });

              if (response.data.success) {
                Alert.alert('Success', 'Proposal deleted successfully', [
                  {
                    text: 'OK',
                    onPress: () => router.back()
                  }
                ]);
              } else {
                Alert.alert('Error', 'Failed to delete proposal');
              }
            } catch (error) {
              console.error('Error deleting proposal:', error);
              Alert.alert('Error', 'Network error. Please check your connection.');
            } finally {
              setUpdating(false);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    if (id) {
      fetchProposalDetails();
    }
  }, [id]);

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
                <Text className="text-gray-800">{amount?.toLocaleString('en-IN') || '0'}</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity 
                className="bg-red-600 rounded-lg px-4 py-2"
                onPress={() => {
                  // Handle Add action - could open amount history or add new amount
                  Alert.alert('Info', 'Amount history feature coming soon');
                }}
              >
                <Text className="text-white font-semibold text-sm">Add</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-red-600 rounded-lg px-4 py-2"
                onPress={() => {
                  // Handle Fix action - could open amount editor
                  Alert.alert('Info', 'Amount editing feature coming soon');
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
            disabled={updating}
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
                    setShowStatusDropdown(false);
                    if (option !== status) {
                      updateProposalStatus(option);
                    }
                  }}
                >
                  <Text className={`${
                    option === 'Hot' ? 'text-red-600' :
                    option === 'Cold' ? 'text-blue-600' :
                    option === 'Warm' ? 'text-orange-600' :
                    option === 'Scrap' ? 'text-yellow-600' :
                    option === 'Confirmed' ? 'text-green-600' :
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

  // Utility functions for attachment handling
  const truncateFilename = (filename, maxLength = 30) => {
    if (!filename) return 'Unknown file';
    if (filename.length <= maxLength) return filename;
    const extension = filename.split('.').pop();
    const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.'));
    const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4) + '...';
    return `${truncatedName}.${extension}`;
  };

  const getFileTypeIndicator = (filename) => {
    if (!filename) return 'Unknown type';
    const extension = filename.split('.').pop()?.toLowerCase();
    const fileTypes = {
      pdf: 'PDF Document',
      doc: 'Word Document',
      docx: 'Word Document',
      jpg: 'Image',
      jpeg: 'Image',
      png: 'Image',
      gif: 'Image',
      txt: 'Text File',
      xls: 'Excel File',
      xlsx: 'Excel File'
    };
    return fileTypes[extension] || 'File';
  };

  const handleViewFile = async (url, filename) => {
    try {
      if (!url) {
        Alert.alert('Error', 'File URL not available');
        return;
      }
      
      // Construct full URL if it's a relative path
      let fullUrl = url;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        fullUrl = `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      }
      
      console.log('Opening file in modal:', fullUrl);
      
      // Set file details and show modal
      setCurrentFileUrl(fullUrl);
      setCurrentFileName(filename);
      setShowFileModal(true);
      
    } catch (error) {
      console.error('Error opening file:', error);
      Alert.alert('Error', `Failed to open file: ${error.message}`);
    }
  };

  const isImageFile = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
  };

  const isPdfFile = (filename) => {
    const extension = filename?.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
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
          onLoadStart={() => setFileLoading(true)}
          onLoadEnd={() => setFileLoading(false)}
          onError={() => {
            setFileLoading(false);
            Alert.alert('Error', 'Failed to load image');
          }}
        />
      );
    } else {
      // For PDFs and other files, use WebView
      return (
        <WebView
          source={{ uri: currentFileUrl }}
          style={{ 
            width: Dimensions.get('window').width - 40, 
            height: Dimensions.get('window').height - 200 
          }}
          onLoadStart={() => setFileLoading(true)}
          onLoadEnd={() => setFileLoading(false)}
          onError={() => {
            setFileLoading(false);
            Alert.alert('Error', 'Failed to load file');
          }}
          startInLoadingState={true}
          scalesPageToFit={true}
        />
      );
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#DC2626" />
        <Text className="mt-2 text-gray-600">Loading proposal details...</Text>
      </View>
    );
  }

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
          {status === 'Confirmed' && (
            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-green-800 font-semibold text-sm">✓ Confirmed</Text>
            </View>
          )}
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
          } ${status === 'Confirmed' ? 'border-2 border-green-500' : ''}`}>
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

              {/* Attachment Section */}
              {proposalDetails.attachmentUrl && (
                <View className="py-3 border-b border-gray-100">
                  <Text className="text-gray-500 text-sm mb-2">Attachment:</Text>
                  <View className="flex-row items-center justify-between bg-blue-50 p-3 rounded-lg">
                    <View className="flex-1 mr-3">
                      <Text className="text-blue-800 font-medium" numberOfLines={1}>
                        {truncateFilename(proposalDetails.attachmentUrl.split('/').pop())}
                      </Text>
                      <Text className="text-blue-600 text-xs mt-1">
                        {getFileTypeIndicator(proposalDetails.attachmentUrl.split('/').pop())}
                      </Text>
                    </View>
                    <TouchableOpacity 
                      className="px-3 py-1 bg-blue-600 rounded"
                      onPress={() => handleViewFile(proposalDetails.attachmentUrl, proposalDetails.attachmentUrl.split('/').pop())}
                    >
                      <Text className="text-white text-sm">View</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

            </View>
          </View>

          {/* Action Buttons */}
          <View className="p-4 space-y-3">
            {/* First row - Save, Edit and Delete */}
            <View className="flex-row justify-center space-x-4 gap-2">
              <TouchableOpacity 
                className={`${updating ? 'bg-gray-400' : 'bg-[#c92125]'} rounded-lg px-6 py-3 w-[100]`}
                onPress={() => {
                  if (updating) return;
                  // Refresh data
                  fetchProposalDetails();
                  Alert.alert('Success', 'Data refreshed');
                }}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-semibold text-center">Refresh</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="bg-[#c92125] rounded-lg px-6 py-3 w-[100]"
                onPress={() => router.push(`/proposal/edit/${id}`)}
                disabled={updating}
              >
                <Text className="text-white font-semibold text-center">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`${updating || status === 'Confirmed' ? 'bg-gray-400' : 'bg-[#c92125]'} rounded-lg px-6 py-3 w-[100]`}
                onPress={status === 'Confirmed' ? () => Alert.alert('Info', 'Cannot delete confirmed proposals') : deleteProposal}
                disabled={updating || status === 'Confirmed'}
              >
                                  <Text className="text-white font-semibold text-center">
                    {status === 'Confirmed' ? 'Locked' : 'Delete'}
                  </Text>
              </TouchableOpacity>
            </View>

            {/* Second row - Project Confirmed */}
            <View className="flex-row justify-center mt-2">
              <TouchableOpacity 
                className={`${status === 'Confirmed' ? 'bg-gray-400' : 'bg-green-500'} rounded-lg px-6 py-3 w-[320]`}
                onPress={() => {
                  if (status === 'Confirmed') {
                    Alert.alert('Info', 'Project is already confirmed');
                    return;
                  }
                  confirmProject();
                }}
                disabled={status === 'Confirmed' || updating}
              >
                                  <Text className="text-white font-semibold text-center">
                    {status === 'Confirmed' ? 'Project Already Confirmed' : 'Confirm Project'}
                  </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAwareScrollView>

      {/* File Viewer Modal */}
      <Modal
        visible={showFileModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFileModal(false)}
      >
        <View className="flex-1 bg-white">
          {/* Modal Header */}
          <View className="bg-white p-4 shadow-sm flex-row items-center justify-between border-b border-gray-200">
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-800" numberOfLines={1}>
                {truncateFilename(currentFileName, 25)}
              </Text>
              <Text className="text-sm text-gray-500">
                {getFileTypeIndicator(currentFileName)}
              </Text>
            </View>
            <TouchableOpacity 
              className="ml-3 p-2"
              onPress={() => setShowFileModal(false)}
            >
              <X size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* File Content */}
          <View className="flex-1 justify-center items-center bg-gray-50">
            {fileLoading && (
              <View className="absolute inset-0 justify-center items-center bg-white bg-opacity-80 z-10">
                <ActivityIndicator size="large" color="#DC2626" />
                <Text className="mt-2 text-gray-600">Loading file...</Text>
              </View>
            )}
            
            {currentFileUrl ? renderFileViewer() : (
              <Text className="text-gray-500">No file to display</Text>
            )}
          </View>

          {/* Modal Footer */}
          <View className="bg-white p-4 border-t border-gray-200">
            <View className="flex-row justify-center space-x-4">
              <TouchableOpacity 
                className="bg-blue-600 rounded-lg px-6 py-3 flex-1 mr-2"
                onPress={async () => {
                  try {
                    await Linking.openURL(currentFileUrl);
                  } catch (error) {
                    Alert.alert('Error', 'Failed to open file externally');
                  }
                }}
              >
                <Text className="text-white font-semibold text-center">Open Externally</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ProposalDetail;