"use client";

import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { DateRangePicker } from "@heroui/date-picker";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import ServiceCard from "./ServiceCard.jsx";
import ProjectCard from "./ProjectCard.jsx";
import ProjectCardSkeleton from "./ProjectCardSkeleton.jsx";
import RealTimeActivities from "./RealTimeActivities.jsx";
import { ChevronDown, ArrowRight, Calendar } from "lucide-react";
import { today, getLocalTimeZone } from "@internationalized/date";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import { usePermissions } from "../../lib/utils";


const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { canView } = usePermissions();

  // Dashboard data states
  const [performanceData, setPerformanceData] = useState([]);
  const [serviceStats, setServiceStats] = useState([]);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Date range state
  const [dateRange, setDateRange] = useState({
    start: today(getLocalTimeZone()).subtract({ months: 6 }),
    end: today(getLocalTimeZone()),
  });
  const [selectedPreset, setSelectedPreset] = useState("Last 6 Months");

  // Date range presets
  const datePresets = [
    {
      label: "Last 7 Days",
      value: {
        start: today(getLocalTimeZone()).subtract({ days: 7 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "Last 30 Days",
      value: {
        start: today(getLocalTimeZone()).subtract({ days: 30 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "Last 3 Months",
      value: {
        start: today(getLocalTimeZone()).subtract({ months: 3 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "Last 6 Months",
      value: {
        start: today(getLocalTimeZone()).subtract({ months: 6 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "Last Year",
      value: {
        start: today(getLocalTimeZone()).subtract({ years: 1 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "This Year",
      value: {
        start: today(getLocalTimeZone()).set({ month: 1, day: 1 }),
        end: today(getLocalTimeZone()),
      },
    },
    {
      label: "Custom",
      value: null, // This will trigger showing only the calendar
    },
  ];

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch project stats
      let projectStatsResponse;
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

          projectStatsResponse = await apiClient.get(`/api/projects/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        } catch (dateError) {
          console.error('Error converting dashboard stats date range:', dateError);
          // Continue without date filtering if date conversion fails
          projectStatsResponse = await apiClient.get(`/api/projects/stats`);
        }
      } else {
        projectStatsResponse = await apiClient.get(`/api/projects/stats`);
      }

      // Fetch monthly project data for chart
      let monthlyDataResponse;
      if (dateRange && dateRange.start && dateRange.end) {
        try {
          // Convert DateRangePicker format to Date objects
          const startDate = new Date(
            dateRange.start.year,
            dateRange.start.month - 1,
            dateRange.start.day
          );

          const endDate = new Date(
            dateRange.end.year,
            dateRange.end.month - 1,
            dateRange.end.day
          );

          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);

          monthlyDataResponse = await apiClient.get(`/api/projects/monthly-stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        } catch (dateError) {
          console.error('Error converting monthly stats date range:', dateError);
          monthlyDataResponse = await apiClient.get(`/api/projects/monthly-stats`);
        }
      } else {
        monthlyDataResponse = await apiClient.get(`/api/projects/monthly-stats`);
      }

      // Fetch recent projects
      let projectsResponse;
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

          projectsResponse = await apiClient.get(`/api/projects?limit=4&sortBy=createdAt&sortOrder=desc&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`);
        } catch (dateError) {
          console.error('Error converting dashboard recent projects date range:', dateError);
          // Continue without date filtering if date conversion fails
          projectsResponse = await apiClient.get(`/api/projects?limit=4&sortBy=createdAt&sortOrder=desc`);
        }
      } else {
        projectsResponse = await apiClient.get(`/api/projects?limit=4&sortBy=createdAt&sortOrder=desc`);
      }

      // Process service stats
      if (projectStatsResponse.data.success) {
        const serviceData =
          projectStatsResponse.data.data.serviceBreakdown || [];
        const transformedServiceStats = [
          {
            title: "Home Cinema",
            count: serviceData.find((s) => s._id === "Home Cinema")?.count || 0,
            color: "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]",
            icon: "lucide:tv",
          },
          {
            title: "Home Automation",
            count:
              serviceData.find((s) => s._id === "Home Automation")?.count || 0,
            color: "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]",
            icon: "lucide:home",
          },
          {
            title: "Security System",
            count:
              serviceData.find((s) => s._id === "Security System")?.count || 0,
            color: "bg-gradient-to-br from-[#014C95] to-[#36B9F6]",
            icon: "lucide:shield",
          },
          {
            title: "Outdoor Audio Solution",
            count:
              serviceData.find((s) => s._id === "Outdoor Audio Solution")
                ?.count || 0,
            color: "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]",
            icon: "lucide:music",
          },
        ];
        setServiceStats(transformedServiceStats);
      }

      // Process monthly chart data
      if (monthlyDataResponse.data.success) {
        const monthlyData = monthlyDataResponse.data.data || [];

        // Generate all months in the date range
        const months = [];
        const startDate = dateRange?.start ? new Date(dateRange.start.year, dateRange.start.month - 1, 1) : new Date();
        const endDate = dateRange?.end ? new Date(dateRange.end.year, dateRange.end.month - 1, 1) : new Date();

        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
          const monthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = currentDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

          // Find data for this month
          const monthData = monthlyData.find(item => item.month === monthKey) || {
            month: monthKey,
            "Home Cinema": 0,
            "Home Automation": 0,
            "Security System": 0,
            "Outdoor Audio Solution": 0,
            total: 0
          };

          months.push({
            month: monthName,
            "Home Cinema": monthData["Home Cinema"] || 0,
            "Home Automation": monthData["Home Automation"] || 0,
            "Security System": monthData["Security System"] || 0,
            "Outdoor Audio Solution": monthData["Outdoor Audio Solution"] || 0,
            total: monthData.total || 0
          });

          // Move to next month
          currentDate.setMonth(currentDate.getMonth() + 1);
        }

        setPerformanceData(months);
      } else {
        // Fallback to empty monthly data
        setPerformanceData([]);
      }

      // Process recent projects
      if (projectsResponse.data.success) {
        const projects = projectsResponse.data.data || [];
        const transformedProjects = projects.map((project) => ({
          id: project._id,
          customer: project.customerName || "Unknown Customer",
          status: getStatusDisplayName(project.projectStatus),
          service: project.services || "Unknown Service",
          amount: new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
          }).format(project.projectAmount || 0),
          date: new Date(project.projectDate).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          address:
            project.fullAddress ||
            `${project.address?.addressLine || ""} , ${project.address?.city || ""
            } , ${project.address?.district || ""} - ${project.address?.pincode || ""
            }`,
          progress: `${project.completedTasks || 0}/${project.totalTasks || 0}`,
          color: getServiceColor(project.services),
          assignedEmployees: project.assignedEmployees || [],
        }));
        setRecentProjects(transformedProjects);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch dashboard data",
        color: "danger",
      });

      // Fallback to static data
      setServiceStats([
        {
          title: "Home Cinema",
          count: 2,
          color: "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]",
          icon: "lucide:tv",
        },
        {
          title: "Home Automation",
          count: 1,
          color: "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]",
          icon: "lucide:home",
        },
        {
          title: "Security System",
          count: 1,
          color: "bg-gradient-to-br from-[#014C95] to-[#36B9F6]",
          icon: "lucide:shield",
        },
        {
          title: "Outdoor Audio Solution",
          count: 0,
          color: "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]",
          icon: "lucide:music",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedPreset]);

  // Helper functions
  const getStatusDisplayName = (status) => {
    const statusMap = {
      new: "New",
      "in-progress": "InProgress",
      completed: "Complete",
      done: "Complete",
      cancelled: "Cancelled",
    };
    return statusMap[status] || "InProgress";
  };

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

  const handlePresetSelect = (preset) => {
    if (preset.label === "Custom") {
      // For custom preset, just update the selected preset label
      // Don't set dateRange value - let user select custom dates
      setSelectedPreset(preset.label);
    } else {
      setDateRange(preset.value);
      setSelectedPreset(preset.label);
    }
  };

  // Removed manual permission checking - now using usePermissions hook

  // Fetch dashboard data when component mounts or date range changes
  useEffect(() => {
    if (session) {
      // Add a small delay to prevent excessive API calls
      const timeoutId = setTimeout(() => {
        fetchDashboardData();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [session, dateRange, selectedPreset, fetchDashboardData]);

  useEffect(() => {
    if (!session) {
      router.push("/login");
    }
  }, [session, router]);

  return (
    <div className="space-y-6">
      {/* Service Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(serviceStats.length > 0
          ? serviceStats
          : [
            {
              title: "Home Cinema",
              count: 0,
              color: "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]",
              icon: "lucide:tv",
            },
            {
              title: "Home Automation",
              count: 0,
              color: "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]",
              icon: "lucide:home",
            },
            {
              title: "Security System",
              count: 0,
              color: "bg-gradient-to-br from-[#014C95] to-[#36B9F6]",
              icon: "lucide:shield",
            },
            {
              title: "Outdoor Audio Solution",
              count: 0,
              color: "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]",
              icon: "lucide:music",
            },
          ]
        ).map((service) => (
          <ServiceCard
            key={service.title}
            title={service.title}
            count={service.count}
            color={service.color}
            icon={service.icon}
          />
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-gradient-to-br from-white to-gray-50/50 border-0 shadow-xl">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Service Performance
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Monthly project distribution by service type
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Dropdown>
                  <DropdownTrigger size="lg" className="w-64">
                    <Button
                      variant="flat"
                      radius="md"
                      startContent={
                        <Calendar className="text-gray-400" size={16} />
                      }
                      endContent={
                        <ChevronDown className="text-gray-400" size={16} />
                      }
                      className="w-52 bg-[#E7E7E7] text-black  hover:bg-[#E7E7E7] hover:text-black hover:border-none hover:shadow-none"
                    >
                      {selectedPreset}
                    </Button>
                  </DropdownTrigger>
                  <DropdownMenu
                    aria-label="Date range presets"
                    className="w-56"
                    onAction={(key) => {
                      const preset = datePresets.find((p) => p.label === key);
                      if (preset) {
                        handlePresetSelect(preset);
                      }
                    }}
                  >
                    {datePresets.map((preset) => (
                      <DropdownItem
                        key={preset.label}
                        className="hover:bg-primary/10 rounded-lg"
                      >
                        {preset.label}
                      </DropdownItem>
                    ))}
                  </DropdownMenu>
                </Dropdown>

                {selectedPreset === "Custom" && (
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    showMonthAndYearPickers
                    className="w-64"
                    size="lg"
                    radius="lg"
                    classNames={{
                      base: "bg-white/80 backdrop-blur-sm",
                      inputWrapper:
                        "border-gray-200/50 hover:border-primary/30 transition-colors",
                    }}
                  />
                )}
              </div>
            </div>

            <div className="relative">
              {/* Chart Background with Gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 rounded-2xl"></div>

              {/* Chart Container */}
              <div className="relative h-96 p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-gray-100/50">
                {loading ? (
                  /* Modern Chart Loader */
                  <div className="flex items-center justify-center h-full">
                    <div className="relative">
                      {/* Outer rotating ring */}
                      <div className="w-16 h-16 border-4 border-gray-200 rounded-full animate-spin border-t-primary"></div>
                      {/* Inner pulsing circle */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse"></div>
                      {/* Loading text */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-4 text-sm text-gray-500 font-medium">
                        Loading chart data...
                      </div>
                    </div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={
                        performanceData.length > 0
                          ? performanceData
                          : [
                            {
                              month: "No Data",
                              "Home Cinema": 0,
                              "Home Automation": 0,
                              "Security System": 0,
                              "Outdoor Audio Solution": 0,
                            }
                          ]
                      }
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 20,
                      }}
                      barCategoryGap="20%"
                    >
                      <defs>
                        {/* Gradient definitions for modern bars */}
                        <linearGradient
                          id="homeCinemaGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#8B5CF6"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#5B21B6"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                        <linearGradient
                          id="homeAutomationGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#06B6D4"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#0891B2"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                        <linearGradient
                          id="securitySystemGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#3B82F6"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#1E40AF"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                        <linearGradient
                          id="outdoorAudioGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#EC4899"
                            stopOpacity={0.9}
                          />
                          <stop
                            offset="100%"
                            stopColor="#BE185D"
                            stopOpacity={0.7}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6B7280",
                          fontWeight: "500",
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 12,
                          fill: "#6B7280",
                          fontWeight: "500",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          backdropFilter: "blur(10px)",
                          border: "1px solid rgba(229, 231, 235, 0.5)",
                          borderRadius: "12px",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
                          fontSize: "12px",
                          fontWeight: "500",
                        }}
                        iconType="circle"
                      />
                      <Bar
                        dataKey="Home Cinema"
                        fill="url(#homeCinemaGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Home Cinema"
                      />
                      <Bar
                        dataKey="Home Automation"
                        fill="url(#homeAutomationGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Home Automation"
                      />
                      <Bar
                        dataKey="Security System"
                        fill="url(#securitySystemGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Security System"
                      />
                      <Bar
                        dataKey="Outdoor Audio Solution"
                        fill="url(#outdoorAudioGradient)"
                        radius={[4, 4, 0, 0]}
                        name="Outdoor Audio"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Modern Chart Stats */}
              <div className="flex items-center justify-between mt-4 px-2">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"></div>
                    Cinema:{" "}
                    {performanceData.reduce(
                      (sum, month) => sum + (month["Home Cinema"] || 0),
                      0
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600"></div>
                    Automation:{" "}
                    {performanceData.reduce(
                      (sum, month) => sum + (month["Home Automation"] || 0),
                      0
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                    Security:{" "}
                    {performanceData.reduce(
                      (sum, month) => sum + (month["Security System"] || 0),
                      0
                    )}
                  </span>
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600"></div>
                    Audio:{" "}
                    {performanceData.reduce(
                      (sum, month) =>
                        sum + (month["Outdoor Audio Solution"] || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="text-xs text-gray-400">
                  Total Projects:{" "}
                  {performanceData.reduce(
                    (sum, month) =>
                      sum +
                      (month["Home Cinema"] || 0) +
                      (month["Home Automation"] || 0) +
                      (month["Security System"] || 0) +
                      (month["Outdoor Audio Solution"] || 0),
                    0
                  )}
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        <RealTimeActivities />
      </div>

      {/* Recent Projects - Only show if user has projects view permission */}
      {canView("projects") && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-primary">Recent Projects</h2>
            <Button
              as={Link}
              href="/dashboard/projects"
              variant="light"
              color="primary"
              size="sm"
              endContent={<ArrowRight />}
            >
              View All
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 ">
            {loading ? (
              // Show skeleton loading when data is being fetched
              Array.from({ length: 4 }).map((_, index) => (
                <ProjectCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : recentProjects.length > 0 ? (
              // Show actual project data when available
              recentProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  id={project.id}
                  customer={project.customer}
                  status={project.status}
                  service={project.service}
                  amount={project.amount}
                  date={project.date}
                  address={project.address}
                  progress={project.progress}
                  color={project.color}
                  assignedEmployees={project.assignedEmployees}
                // userPermissions removed - ProjectCard uses usePermissions hook internally
                />
              ))
            ) : (
              // Show empty state when no projects are found
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">No Recent Projects</p>
                <p className="text-sm text-center">Projects will appear here once they are created</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
