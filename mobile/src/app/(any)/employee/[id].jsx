import { useEffect, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { ArrowLeft, FileText, Mail, Phone } from 'lucide-react-native'
import { Image, ScrollView, Text, TouchableOpacity, View, Alert, Linking } from 'react-native'
import { API_CONFIG } from '../../../../config'
import ProjectCard from '../../../components/Common/ProjectCard'

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

// Document URL helper
const getDocumentUrl = (docUrl) => {
  if (!docUrl) return null;
  
  if (docUrl.startsWith('http')) {
    try {
      const url = new URL(docUrl);
      if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        // Replace localhost with API_CONFIG.API_URL and ensure /public is included
        const pathWithPublic = url.pathname.includes('/public') ? url.pathname : `/public${url.pathname}`;
        return `${API_CONFIG.API_URL}${pathWithPublic}`;
      }
      return docUrl;
    } catch {
      return docUrl;
    }
  }
  
  if (docUrl.startsWith('/assets')) {
    // Add /public prefix if not present
    return `${API_CONFIG.API_URL}/public${docUrl}`;
  }
  
  if (docUrl.startsWith('/')) {
    return `${API_CONFIG.API_URL}${docUrl}`;
  }
  
  return docUrl;
};

export default function EmployeeDetail() {
  const router = useRouter()
  const { id } = useLocalSearchParams()
  const [employeeData, setEmployeeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [projectFilter, setProjectFilter] = useState("all")
  const [page, setPage] = useState(1)
  const pageSize = 10 // Increased for horizontal scrolling



  // Fetch employee data and projects
  const fetchEmployeeData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // 1. Fetch employee details
      const response = await fetch(`${API_CONFIG.API_URL}/api/employeeManagement/${id}`, {
        headers: { 'x-api-key': API_CONFIG.API_KEY }
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch employee data");
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Failed to fetch employee data");
      
      const emp = data.employee;
      
      // 2. Fetch projects assigned to this employee
      let projects = [];
      let completed = 0;
      let ongoing = 0;
      
      if (emp && emp._id) {
        try {
          const projectsRes = await fetch(
            `${API_CONFIG.API_URL}/api/projects?assignedEmployee=${emp._id}`,
            {
              headers: { 'x-api-key': API_CONFIG.API_KEY }
            }
          );
          
          if (projectsRes.ok) {
            const projectsData = await projectsRes.json();
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
          }
        } catch (projectError) {
          console.log("Projects fetch failed:", projectError);
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
        department: emp.department?.name || emp.department || "",
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
        departmentName: emp.department?.name || "N/A",
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
        <View className="px-6 mt-6">
          <Text className="text-gray-500 text-sm mb-2">Documents</Text>
          {employeeData.documents && employeeData.documents.length > 0 ? (
            <View className="space-y-2">
              {employeeData.documents.map((docUrl, index) => {
                // Extract filename from URL
                const filename = docUrl.split('/').pop() || `Document ${index + 1}`;
                
                return (
                  <TouchableOpacity 
                    key={index}
                    className="flex-row items-center bg-blue-50 p-3 rounded-lg border border-blue-200"
                    onPress={() => {
                      // Web-like functionality: Open document URL with proper URL construction
                      const properDocumentUrl = getDocumentUrl(docUrl);
                      if (properDocumentUrl) {
                        Linking.openURL(properDocumentUrl).catch(err => {
                          Alert.alert('Error', 'Could not open document');
                          console.error('Error opening document:', err);
                        });
                      } else {
                        Alert.alert('Error', 'Document URL not available');
                      }
                    }}
                  >
                    <FileText size={18} color="#2563EB" />
                    <View className="flex-1 ml-2">
                      <Text className="text-sm font-medium text-gray-900">{filename}</Text>
                      <Text className="text-xs text-gray-500">Tap to view</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <View className="bg-gray-50 p-4 rounded-lg">
              <Text className="text-gray-500 text-sm text-center">No documents uploaded</Text>
            </View>
          )}
        </View>

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
                <View className="justify-center items-center px-4" style={{ width: 60 }}>
                  <Text className="text-gray-400 text-xs text-center">Swipe to see more</Text>
                  <Text className="text-gray-400 text-2xl">→</Text>
                </View>
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