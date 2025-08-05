"use client";

import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { Phone } from "lucide-react";
import apiClient from "../../lib/axios";
import { Avatar, AvatarGroup } from "@heroui/avatar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProjectCards({
  serviceFilter,
  dateRange,
  statusFilter,
  searchValue,
  page = 1,
  pageSize = 6,
  setTotalPages,
  userPermissions = {},
}) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState({});
  const [projectStatuses, setProjectStatuses] = useState({});
  const router = useRouter();
  const { hasEditPermission } = userPermissions;

  // Function to handle project click with state preservation
  const handleProjectClick = (projectId) => {
    // Get current URL parameters to preserve state
    const currentParams = new URLSearchParams(window.location.search);

    // Create the task page URL with project ID and return state
    const taskParams = new URLSearchParams();
    taskParams.set('projectId', projectId);

    // Store the return URL with current state
    if (currentParams.toString()) {
      taskParams.set('returnTo', `/dashboard/projects?${currentParams.toString()}`);
    } else {
      taskParams.set('returnTo', '/dashboard/projects');
    }

    router.push(`/dashboard/task?${taskParams.toString()}`);
  };
  // Build query params for backend filtering
  const buildQueryParams = () => {
    const params = [];
    if (searchValue && searchValue.trim() !== "")
      params.push(`search=${encodeURIComponent(searchValue)}`);
    if (serviceFilter && serviceFilter !== "All")
      params.push(`service=${encodeURIComponent(serviceFilter)}`);
    if (statusFilter && statusFilter !== "all") {
      params.push(`status=${encodeURIComponent(statusFilter)}`);
    }
    if (dateRange && dateRange.start && dateRange.end) {
      try {
        // Convert DateRangePicker format to Date objects
        // DateRangePicker returns { year, month, day } format
        const startDate = new Date(
          dateRange.start.year,
          dateRange.start.month - 1, // Month is 0-indexed in Date constructor
          dateRange.start.day
        );

        const endDate = new Date(
          dateRange.end.year,
          dateRange.end.month - 1, // Month is 0-indexed in Date constructor
          dateRange.end.day
        );

        // Set start time to beginning of day (00:00:00)
        startDate.setHours(0, 0, 0, 0);

        // Set end time to end of day (23:59:59.999) for same day filtering
        endDate.setHours(23, 59, 59, 999);



        params.push(`startDate=${encodeURIComponent(startDate.toISOString())}`);
        params.push(`endDate=${encodeURIComponent(endDate.toISOString())}`);
      } catch (dateError) {
        console.error('Error converting project date range:', dateError);
        // Continue without date filtering if date conversion fails
      }
    }
    params.push(`page=${page}`);
    params.push(`limit=${pageSize}`);
    return params.length ? `?${params.join("&")}` : `?limit=${pageSize}`;
  };

  // Fetch projects from API with filters
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const query = buildQueryParams();
      const response = await apiClient.get(`/api/projects${query}`);
      if (response.data.success) {
        // Transform backend data to match the UI structure
        const transformedProjects = response.data.data.map(
          (project, index) => ({
            id: project._id,
            customerName: project.customerName,
            proposalId: project.proposalId || "",
            location:
              project.fullAddress ||
              `${project.address?.addressLine}, ${project.address?.city} ${project.address?.district || ""
              } - ${project.address?.pincode || ""}`,
            service: project.services,
            amount: new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
            }).format(project.projectAmount),
            date: new Date(project.projectDate).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            }),
            status: getStatusDisplayName(project.projectStatus),
            progress:
              project.progress ||
              `${project.completedTasks || 0}/${project.totalTasks || 0}`,
            color: getServiceColor(project.services),
            avatars: generateAvatars(project.assignedEmployees),
            totalTasks: project.totalTasks || 0,
            completedTasks: project.completedTasks || 0,
          })
        );

        setProjects(transformedProjects);

        // Handle pagination - Simple approach to show correct total pages
        if (setTotalPages && response.data.pagination) {
          const paginationData = response.data.pagination;



          // Check if API returned valid pagination data
          if (paginationData.total && paginationData.total > 0) {
            setTotalPages(paginationData.total);
          } else if (paginationData.count && paginationData.count > 0) {
            setTotalPages(Math.ceil(paginationData.count / pageSize));
          } else {
            // API returned invalid pagination - estimate based on results
            if (transformedProjects.length === pageSize) {
              // We got exactly pageSize results, there are likely more pages
              // Show a reasonable number of pages (5 is common for most datasets)
              setTotalPages(5);
            } else {
              // We got less than pageSize results, this is likely the last page
              setTotalPages(page);
            }
          }
        } else if (setTotalPages) {
          // No pagination data - don't show pagination
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Fetch projects error:", error);
      // Fallback to static data if API fails
      setProjects(getStaticProjects());
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get status display name
  const getStatusDisplayName = (status) => {
    const statusMap = {
      new: "New",
      "in-progress": "InProgress",
      completed: "Completed",
      done: "Done",
      cancelled: "Cancelled",
    };
    return statusMap[status] || "InProgress";
  };

  // Helper function to get service color
  const getServiceColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
      case "Home Automation":
        return "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]";
      case "Security System":
        return "bg-gradient-to-br from-[#014C95] to-[#36B9F6]";
      case "Outdoor Audio Solution":
        return "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]";
      default:
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
    }
  };

  // Helper function to generate avatars
  const generateAvatars = (employees) => {
    if (employees && employees.length > 0) {
      return employees
        .slice(0, 2)
        .map(
          (emp, index) =>
            `${emp.avatar ||
            `https://img.heroui.chat/image/avatar?w=40&h=40&u=user${index + 1
            }`
            }`
        );
    }
    return [
      "",
      "",
      "",
      "",
    ];
  };

  // Static fallback data
  const getStaticProjects = () => [
    {
      id: 1,
      customerName: "Vinoth R",
      location: "123/ss colony, Thirunager, Madurai-625018",
      service: "Home Cinema",
      amount: "₹30,00,000",
      date: "26/05/2025",
      status: "InProgress",
      progress: "1/3",
      color: "bg-blue-500",
      avatars: [
        "https://img.heroui.chat/image/avatar?w=40&h=40&u=user1",
        "https://img.heroui.chat/image/avatar?w=40&h=40&u=user2",
      ],
    },
    {
      id: 2,
      customerName: "Vaisu K",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      service: "Security System",
      amount: "₹26,00,000",
      date: "18/05/2025",
      status: "InProgress",
      progress: "2/5",
      color: "bg-teal-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user3"],
    },
    {
      id: 3,
      customerName: "Sanker A",
      location: "1A/67 Anbu Nager, Anna Nager, Madurai-625018",
      service: "Home Automation",
      amount: "₹20,00,000",
      date: "08/04/2025",
      status: "Completed",
      progress: "3/3",
      color: "bg-cyan-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user4"],
    },
    {
      id: 4,
      customerName: "Anu J",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      service: "Home Cinema",
      amount: "₹32,00,000",
      date: "22/04/2025",
      status: "InProgress",
      progress: "2/3",
      color: "bg-blue-500",
      avatars: ["https://img.heroui.chat/image/avatar?w=40&h=40&u=user5"],
    },
  ];

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceFilter, dateRange, statusFilter, searchValue, page]);

  const getProgressPercent = (progress) => {
    if (!progress) return 0;
    if (typeof progress === "string" && progress.includes("%")) {
      // Handle "50%" style
      return parseFloat(progress.replace("%", "")) || 0;
    }
    if (typeof progress === "string" && progress.includes("/")) {
      // Handle "current/total" style
      const [current, total] = progress.split("/").map(Number);
      return total > 0 ? (current / total) * 100 : 0;
    }
    return 0;
  };

  const statusOptions = [
    { label: "New", value: "new" },
    { label: "In Progress", value: "in-progress" },
    { label: "Completed", value: "completed" },
    { label: "Done", value: "done" },
    { label: "Cancelled", value: "cancelled" },
  ];

  const handleStatusChange = async (projectId, newStatus) => {
    setStatusLoading((prev) => ({ ...prev, [projectId]: true }));
    try {
      const res = await apiClient.patch(`/api/projects/${projectId}/field`, {
        field: "projectStatus",
        value: newStatus
      });
      if (res.data.success) {
        setProjectStatuses((prev) => ({ ...prev, [projectId]: newStatus }));
        // Optionally show success toast
        addToast({
          title: "Success",
          description: "Project status updated successfully",
          status: "success",
          color: "success",
        });
      }
    } catch (err) {
      // Optionally show error toast
      addToast({
        title: "Error",
        description: "Failed to update project status",
        status: "error",
        color: "error",
      });
    } finally {
      setStatusLoading((prev) => ({ ...prev, [projectId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(4)].map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="p-6 bg-gray-200 h-40"></div>
            <div className="p-4 space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  // Show "no projects found" message when there are no projects
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">📋</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          No Projects Found
        </h3>
        <p className="text-gray-500 max-w-md">
          {searchValue || serviceFilter !== "All" || statusFilter !== "all" || dateRange
            ? "No projects match your current filters. Try adjusting your search criteria."
            : "You haven't created any projects yet. Click 'Add New' to create your first project."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => (
        <div
          key={project.id}
          className="cursor-pointer"
          onClick={() => handleProjectClick(project.id)}
        >
          <Card className="overflow-hidden hover:shadow-lg transition-shadow h-[330px]">
            <div className="p-0 h-full flex flex-col overflow-hidden">
              <div
                className={`p-6 ${project.color} bg-gradient-to-br from-opacity-80 to-opacity-100 text-white flex-1 flex flex-col overflow-hidden`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Dropdown radius="sm" placement="bottom-start">
                      <DropdownTrigger>
                        <Button
                          className={`px-3 py-1 rounded-sm border border-white/10 text-white text-sm font-medium bg-opacity-80 bg-white/20 hover:bg-white/20`}
                          disabled={statusLoading[project.id] || !hasEditPermission}
                          type="button"
                          variant="faded"
                          size="sm"
                          endContent={<ChevronDown className="w-4 h-4" />}
                          onClick={(e) => {
                            if (e.stopPropagation) e.stopPropagation();
                          }}
                        >
                          {statusLoading[project.id]
                            ? "Updating..."
                            : statusOptions.find(
                              (opt) =>
                                opt.value ===
                                (projectStatuses[project.id] ||
                                  project.status.toLowerCase())
                            )?.label || project.status}
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu
                        aria-label="Project Status"
                        className="w-48 rounded-sm mt-1"
                        radius="sm"
                      >
                        {statusOptions.map((opt) => (
                          <DropdownItem
                            key={opt.value}
                            onClick={(e) => {
                              if (e.stopPropagation) e.stopPropagation();
                              handleStatusChange(project.id, opt.value);
                            }}
                            endContent={
                              (projectStatuses[project.id] ||
                                project.status.toLowerCase()) === opt.value ? (
                                <Check className="w-4 h-4" />
                              ) : null
                            }
                          >
                            {opt.label}
                          </DropdownItem>
                        ))}
                      </DropdownMenu>
                    </Dropdown>
                    <h3 className="text-2xl font-bold mt-4 flex items-center gap-3">
                      {project.customerName} <Phone className="w-5 h-5 mt-1" />
                    </h3>
                    <div className="flex items-center gap-1 text-white/80 text-sm w-4/5 mt-4">
                      <p>{project.location}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 w-1/2">
                    <div className="mt-6">
                      <div className="text-sm text-white/80">Service</div>
                      <div className="font-medium">{project.service}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Amount</div>
                      <div className="font-medium">{project.amount}</div>
                    </div>
                    <div>
                      <div className="text-sm text-white/80">Date</div>
                      <div className="font-medium">{project.date}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="p-3 flex-shrink-0">
                <Progress
                  value={getProgressPercent(project.progress)}
                  color="primary"
                  className="h-2"
                  aria-label="Project progress"
                />
              </div>

              {/* Team Section */}
              <div className="p-4 flex justify-between items-center flex-shrink-0">
                <AvatarGroup isBordered max={8}>
                  {project.avatars.map((avatar, index) => (
                    <Avatar key={index} src={avatar} />
                  ))}
                </AvatarGroup>
                <div className="text-[#272523] text-lg font-medium">
                  {project.completedTasks || 0} / {project.totalTasks || 0}{" "}
                </div>
              </div>
            </div>
          </Card>
        </div>
      ))}
    </div>
  );
}
