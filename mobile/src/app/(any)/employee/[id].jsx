import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react-native'
import { Image, ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native'
import { API_CONFIG } from '../../../../config'
import apiClient from '../../../utils/apiClient'
import ProjectCard from '../../../components/Common/ProjectCard'
import { useAuth } from '../../../utils/AuthContext'
import { getPageActions } from '../../../utils/permissions'
// Avatar helper
const fallbackAvatar = 'https://img.heroui.chat/image/avatar?w=200&h=200&u=1';
const getAvatarUrl = (avatar) => {
  if (!avatar) return fallbackAvatar;
  if (avatar.startsWith('http')) {
    try {
      const url = new URL(avatar);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return avatar.replace(`${url.protocol}//${url.hostname}:5000`, API_CONFIG.API_URL);
      }
      return avatar;
    } catch {
      return avatar;
    }
  }
  if (avatar.startsWith('/')) {
    return `${API_CONFIG.API_URL}${avatar}`;
  }
  return avatar;
};

// Helper function to get document URL
const getDocumentUrl = (docUrl) => {
  if (!docUrl) return null;
  
  // Handle document objects
  if (typeof docUrl === 'object' && docUrl.url) {
    docUrl = docUrl.url;
  }
  
  // Ensure docUrl is a string before calling startsWith
  if (typeof docUrl !== 'string') {
    console.warn('getDocumentUrl: docUrl is not a string:', docUrl);
    return null;
  }
  
  // If it's already a full URL, check if it's localhost and replace
  if (docUrl.startsWith('http')) {
    try {
      const url = new URL(docUrl);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        // Replace localhost with API_CONFIG.API_URL
        const replacedUrl = docUrl.replace(`${url.protocol}//${url.hostname}:${url.port || '5000'}`, API_CONFIG.API_URL);
        return replacedUrl;
      }
      return docUrl;
    } catch (error) {
      console.warn('Error parsing URL:', error);
      return docUrl;
    }
  }
  
  // If it starts with /, construct full URL
  if (docUrl.startsWith('/')) {
    const fullUrl = `${API_CONFIG.API_URL}${docUrl}`;
    return fullUrl;
  }
  
  // Otherwise, construct URL with the filename
  const constructedUrl = `${API_CONFIG.API_URL}/assets/images/employees/documents/${docUrl}`;
  return constructedUrl;
};

export default function EmployeeDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 10 // Increased for horizontal scrolling
  const { user } = useAuth();
  const actions = getPageActions(user, '/dashboard/employees');


  // Fetch employee data and projects
  const fetchEmployeeData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // 1. Fetch employee details
      const response = await apiClient.get(`/api/employeeManagement/${id}`);
      
      const data = response.data;
      if (!data.success) throw new Error(data.message || "Failed to fetch employee data");
      
      const emp = data.employee;
      
      // 2. Fetch projects assigned to this employee
      let projects = [];
      let completed = 0;
      let ongoing = 0;
      
      if (emp && emp._id) {
        try {
          const projectsRes = await apiClient.get(
            `/api/projects?assignedEmployees=${emp._id}`
          );
          
          const projectsData = projectsRes.data;
          if (projectsData.success && Array.isArray(projectsData.data)) {
            projects = projectsData.data.map((proj) => {
              // Determine status for stats
              const status = proj.projectStatus || "";
              if (["complete", "completed", "done"].includes(status.toLowerCase())) {
                completed++;
              } else if (["inprogress", "in-progress", "ongoing"].includes(status.toLowerCase())) {
                ongoing++;
              }
              
              return {
                id: proj._id || proj.id,
                service: proj.services || "N/A",
                status: proj.projectStatus || "N/A",
                amount: proj.projectAmount
                  ? `₹${proj.projectAmount.toLocaleString("en-IN")}`
                  : "N/A",
                date: proj.projectDate
                  ? new Date(proj.projectDate).toLocaleDateString("en-GB")
                  : "N/A",
                progress: `${proj.completedTasks || 0}/${proj.totalTasks || 0}`,
                completedTasks: proj.completedTasks || 0,
                totalTasks: proj.totalTasks || 0,
                assignedEmployees: proj.assignedEmployees || [],
                customer: {
                  name: proj.customerName || `${emp.firstName} ${emp.lastName}`,
                  address: proj.fullAddress || 
                    `${proj.address?.addressLine || ""}, ${proj.address?.city || ""}, ${proj.address?.district || ""} - ${proj.address?.pincode || ""}`
                }
              };
            });
          }
        } catch (projectError) {
          // Continue with empty projects array
        }
      }
      
      const transformedEmployee = {
        id: emp.employeeId || emp._id,
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.email || "",
        mobileNo: emp.mobileNo || "",
        gender: emp.gender || "",
        dateOfBirth: emp.dateOfBirth || "",
        dateOfHiring: emp.dateOfHiring || "",
        role: emp.role?._id || emp.role || "",
        department: typeof emp.department === "object" && emp.department !== null
          ? emp.department.name
          : emp.department || "",
        status: emp.status || "active",
        notes: emp.notes || "",
        address: {
          addressLine: emp.address?.addressLine || "",
          city: emp.address?.city || "",
          district: emp.address?.district || "",
          state: emp.address?.state || "",
          country: emp.address?.country || "",
          pincode: emp.address?.pincode || "",
        },
        image: emp.avatar || null,
        phone: emp.mobileNo || "",
        name: `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        roleName: emp.role?.role || "N/A",
        departmentName: typeof emp.department === "object" && emp.department !== null
          ? emp.department.name
          : emp.department || "N/A",
        dateOfJoining: emp.dateOfHiring || "",
        note: emp.notes || "",
        documents: emp.documents || [],
        stats: {
          completed: completed,
          ongoing: ongoing,
          projects: projects.length,
        },
        projects: projects,
        originalData: emp,
      };
      
      setEmployeeData(transformedEmployee);
    } catch (error) {
      console.error("Error fetching employee:", error);
      setEmployeeData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeeData();
  }, [id])

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-sm">Loading employee details...</Text>
      </View>
    )
  }

  if (!employeeData) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500 text-sm">Employee not found.</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between p-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold">Profile</Text>
        </View>
        <TouchableOpacity 
          className="bg-red-600 px-6 py-2 rounded-lg"
          onPress={() => router.push({ pathname: `/employee/edit/${employeeData.id}` })}
          disabled={!actions.edit}
        >
          <Text className="text-white font-medium">Edit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 bg-gray-50" showsVerticalScrollIndicator={false}>
        {/* Profile Section - Centered Avatar and Name */}
        <View className="items-center py-8 bg-white">
          <View className="items-center justify-center mb-4">
            <Image 
              source={{ uri: getAvatarUrl(employeeData.image) }}
              className="w-32 h-32 rounded-full"
            />
          </View>
          <Text className="text-2xl font-bold text-gray-900">{employeeData.name}</Text>
          <Text className="text-base text-gray-500 mt-1">{employeeData.roleName}</Text>
        </View>

        {/* Stats Section - Pink Background with Filtering */}
        <View className="flex-row justify-around bg-pink-100 mx-4 mt-4 p-6 rounded-xl">
          <TouchableOpacity 
            className="items-center"
            onPress={() => {
              setProjectFilter("completed");
              setPage(1);
            }}
          >
            <Text className="text-gray-600 text-sm mb-1">Completed</Text>
            <Text className="text-2xl font-bold text-gray-900">{employeeData.stats.completed}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="items-center"
            onPress={() => {
              setProjectFilter("ongoing");
              setPage(1);
            }}
          >
            <Text className="text-gray-600 text-sm mb-1">Ongoing</Text>
            <Text className="text-2xl font-bold text-gray-900">{employeeData.stats.ongoing}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            className="items-center"
            onPress={() => {
              setProjectFilter("all");
              setPage(1);
            }}
          >
            <Text className="text-gray-600 text-sm mb-1">Project</Text>
            <Text className="text-2xl font-bold text-gray-900">{employeeData.stats.projects}</Text>
          </TouchableOpacity>
        </View>

        {/* Employee ID & Department Row */}
        <View className="flex-row justify-between px-6 mt-6">
          <View className="flex-1">
            <Text className="text-gray-500 text-sm mb-1">Employee ID</Text>
            <Text className="text-lg font-bold text-gray-900">{employeeData.id}</Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-gray-500 text-sm mb-1">Department</Text>
            <Text className="text-lg font-bold text-gray-900">{employeeData.departmentName}</Text>
          </View>
        </View>

        {/* Contact Information */}
        <View className="px-6 mt-6">
          <TouchableOpacity 
            className="flex-row items-center mb-4"
            onPress={() => {
              // Web-like functionality: Call phone number
              const phoneUrl = `tel:${employeeData.phone}`;
              Linking.openURL(phoneUrl);
            }}
          >
            <Phone size={20} color="#DC2626" />
            <Text className="text-base text-gray-900 ml-3 font-medium">{employeeData.phone}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="flex-row items-center"
            onPress={() => {
              // Web-like functionality: Open email client
              const emailUrl = `mailto:${employeeData.email}`;
              Linking.openURL(emailUrl);
            }}
          >
            <Mail size={20} color="#DC2626" />
            <Text className="text-base text-gray-900 ml-3 font-medium">{employeeData.email}</Text>
          </TouchableOpacity>
        </View>

        {/* Date Information Row */}
        <View className="flex-row justify-between px-6 mt-6">
          <View className="flex-1">
            <Text className="text-gray-500 text-sm mb-1">Date of Birth</Text>
            <Text className="text-base font-semibold text-gray-900">
              {employeeData.dateOfBirth ? new Date(employeeData.dateOfBirth).toLocaleDateString("en-GB") : '09/04/1996'}
            </Text>
          </View>
          <View className="flex-1 items-end">
            <Text className="text-gray-500 text-sm mb-1">Date of Joining</Text>
            <Text className="text-base font-semibold text-gray-900">
              {employeeData.dateOfJoining ? new Date(employeeData.dateOfJoining).toLocaleDateString("en-GB") : '20/06/2023'}
            </Text>
          </View>
        </View>

        {/* Documents Section */}
        {employeeData.documents && employeeData.documents.length > 0 && (
          <View className="bg-white rounded-lg p-4 mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Documents ({employeeData.documents.length})
            </Text>
            <View className="space-y-2">
              {employeeData.documents.map((doc, index) => {
                try {
                  const docUrl = getDocumentUrl(doc);
                  const filename = doc?.originalName || `Document ${index + 1}`;
                  
                  if (!docUrl) {
                    console.warn('Document URL is null for document:', doc);
                    return null;
                  }
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        if (docUrl) {
                          Linking.openURL(docUrl).catch((error) => {
                            console.error('Error opening document:', error);
                            Alert.alert(
                              'Document Not Available',
                              'This document may not exist or may have been moved. Please contact the administrator.',
                              [{ text: 'OK' }]
                            );
                          });
                        }
                      }}
                      className="flex-row items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <View className="w-8 h-8 bg-blue-100 rounded-lg items-center justify-center mr-3">
                        <Text className="text-blue-600 text-xs font-bold">📄</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-900">
                          {filename}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          Tap to view
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                } catch (error) {
                  console.error('Error rendering document:', error, doc);
                  return null;
                }
              })}
            </View>
          </View>
        )}

        {/* Note Section */}
        <View className="px-6 mt-6">
          <Text className="text-gray-500 text-sm mb-2">Note</Text>
          <Text className="text-base text-gray-700 leading-relaxed">
            {employeeData.note || 'All rounder -Installation, electrician, Service technician'}
          </Text>
        </View>

        {/* Projects Section */}
        <View className="mt-8">
          <View className="flex-row justify-between items-center mb-4 px-6">
            <Text className="text-xl font-bold text-gray-900">
              Projects {projectFilter !== "all" && `(${projectFilter})`}
            </Text>
            {employeeData.projects && employeeData.projects.length > 0 && (
              <Text className="text-sm text-gray-500">
                {employeeData.projects.filter((project) => {
                  if (projectFilter === "all") return true;
                  if (projectFilter === "completed") {
                    return ["complete", "completed", "done"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  if (projectFilter === "ongoing") {
                    return ["inprogress", "in-progress", "ongoing"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  return true;
                }).length} projects
              </Text>
            )}
          </View>
          
          {/* Filter Projects */}
          {employeeData.projects && employeeData.projects.length > 0 ? (
            <ScrollView 
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, paddingRight: 32 }}
              className="flex-row"
            >
              {employeeData.projects
                .filter((project) => {
                  if (projectFilter === "all") return true;
                  if (projectFilter === "completed") {
                    return ["complete", "completed", "done"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  if (projectFilter === "ongoing") {
                    return ["inprogress", "in-progress", "ongoing"].includes(
                      (project.status || "").toLowerCase()
                    );
                  }
                  return true;
                })
                .slice((page - 1) * pageSize, page * pageSize)
                .map((project, index, filteredArray) => (
                  <View 
                    key={project.id} 
                    style={{ width: 320, marginRight: 16 }}
                  >
                    <ProjectCard 
                      project={project}
                      customer={project.customer}
                    />
                  </View>
                ))}
              
              {/* Show hint when there are multiple projects */}
              {employeeData.projects.filter((project) => {
                if (projectFilter === "all") return true;
                if (projectFilter === "completed") {
                  return ["complete", "completed", "done"].includes(
                    (project.status || "").toLowerCase()
                  );
                }
                if (projectFilter === "ongoing") {
                  return ["inprogress", "in-progress", "ongoing"].includes(
                    (project.status || "").toLowerCase()
                  );
                }
                return true;
              }).length > 1 && (
               null
              )}
            </ScrollView>
          ) : (
            <View className="bg-gray-100 rounded-xl p-6 items-center mx-6">
              <Text className="text-gray-500 text-center">No projects found for this employee</Text>
            </View>
          )}
          
        {/* Pagination Info */}
          {/* {(() => {
            const filteredProjects = employeeData.projects ? employeeData.projects.filter((project) => {
              if (projectFilter === "all") return true;
              if (projectFilter === "completed") {
                return ["complete", "completed", "done"].includes(
                  (project.status || "").toLowerCase()
                );
              }
              if (projectFilter === "ongoing") {
                return ["inprogress", "in-progress", "ongoing"].includes(
                  (project.status || "").toLowerCase()
                );
              }
              return true;
            }) : [];
            
            const totalPages = Math.ceil(filteredProjects.length / pageSize);
            
            return filteredProjects.length > pageSize ? (
              <View className="flex-row justify-between items-center mt-6 mx-6">
                <TouchableOpacity 
                  className={`px-4 py-2 rounded-lg ${page === 1 ? 'bg-gray-300' : 'bg-blue-500'}`}
                  onPress={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <Text className={`font-medium ${page === 1 ? 'text-gray-500' : 'text-white'}`}>Previous</Text>
                </TouchableOpacity>
                
                <Text className="text-gray-600">
                  Page {page} of {totalPages}
                </Text>
                
                <TouchableOpacity 
                  className={`px-4 py-2 rounded-lg ${page === totalPages ? 'bg-gray-300' : 'bg-blue-500'}`}
                  onPress={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  <Text className={`font-medium ${page === totalPages ? 'text-gray-500' : 'text-white'}`}>Next</Text>
                </TouchableOpacity>
              </View>
            ) : null;
          })()} */}
        </View>

        {/* Extra padding at bottom */}
        <View className="h-8" />
      </ScrollView>
    </View>
  )
}