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
import { useEffect, useState } from "react";
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
import ActivityItem from "./ActivityItem.jsx";
import ProjectCard from "./ProjectCard.jsx";
import { ChevronRight, ChevronDown, ArrowRight, Calendar } from "lucide-react";
import { today, getLocalTimeZone } from "@internationalized/date";
import axios from "axios";
import { addToast } from "@heroui/toast";

const recentActivities = [
  {
    id: "PROJ01",
    type: "Project Status Changed",
    description: "#Arun- Site Visit - Completed",
    time: "10:30 AM",
  },
  {
    id: "PROJ05",
    type: "New Project Created",
    description: "#Admin- Home Automation Project Created",
    time: "09:45 AM",
  },
  {
    id: "PROJ03",
    type: "Project Status Changed",
    description: "#Bala-Has been marked as Complete",
    time: "09:15 AM",
  },
  {
    id: "PROJ03",
    type: "Project Status Changed",
    description: "#Bala-Has been marked as Complete",
    time: "09:15 AM",
  },
];

const Dashboard = () => {
  const { data: session } = useSession();
  const router = useRouter();

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    projects: { hasViewPermission: false },
    proposals: { hasViewPermission: false },
    customers: { hasViewPermission: false },
    employees: { hasViewPermission: false },
    tasks: { hasViewPermission: false },
  });

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
  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch project stats
      const projectStatsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects/stats`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      // Fetch recent projects
      const projectsResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects?limit=4&sortBy=createdAt&sortOrder=desc`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      // Fetch projects with date range for performance chart
      const performanceResponse = await axios.get(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/projects?startDate=${dateRange.start.toString()}&endDate=${dateRange.end.toString()}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

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

      // Process performance data
      if (performanceResponse.data.success) {
        const projects = performanceResponse.data.data || [];
        const monthlyData = processProjectsByMonth(projects);
        setPerformanceData(monthlyData);
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
            `${project.address?.addressLine || ""}, ${
              project.address?.city || ""
            }`,
          progress: `${project.completedTasks || 0}/${project.totalTasks || 0}`,
          color: getServiceColor(project.services),
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
  };

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

  const processProjectsByMonth = (projects) => {
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const monthlyData = {};

    // Initialize months within date range
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

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const monthKey = monthNames[currentDate.getMonth()];
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          "Home Cinema": 0,
          "Home Automation": 0,
          "Security System": 0,
          "Outdoor Audio Solution": 0,
        };
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    // Process projects
    projects.forEach((project) => {
      const projectDate = new Date(project.projectDate);
      const monthKey = monthNames[projectDate.getMonth()];

      if (monthlyData[monthKey] && project.services) {
        monthlyData[monthKey][project.services] =
          (monthlyData[monthKey][project.services] || 0) + 1;
      }
    });

    return Object.values(monthlyData);
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

  // Check user permissions on component mount
  useEffect(() => {
    const checkUserPermissions = () => {
      if (!session?.user) return;

      // Hotel admin has all permissions
      if (!session.user.isEmployee) {
        setUserPermissions({
          projects: { hasViewPermission: true },
          proposals: { hasViewPermission: true },
          customers: { hasViewPermission: true },
          employees: { hasViewPermission: true },
          tasks: { hasViewPermission: true },
        });
        return;
      }

      // Check employee permissions for each module
      const permissions = session.user.permissions || [];
      const modulePermissions = {};

      ["projects", "proposals", "customers", "employees", "tasks"].forEach(
        (module) => {
          const permission = permissions.find(
            (p) => p.page?.toLowerCase() === module
          );
          modulePermissions[module] = {
            hasViewPermission: permission?.actions?.view || false,
          };
        }
      );

      setUserPermissions(modulePermissions);
    };

    checkUserPermissions();
  }, [session]);

  // Fetch dashboard data when component mounts or date range changes
  useEffect(() => {
    if (session) {
      fetchDashboardData();
    }
  }, [session, dateRange]);

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
                      radius="lg"
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
                                month: "Jan",
                                "Home Cinema": 7,
                                "Home Automation": 8,
                                "Security System": 2,
                                "Outdoor Audio Solution": 1,
                              },
                              {
                                month: "Feb",
                                "Home Cinema": 5,
                                "Home Automation": 6,
                                "Security System": 3,
                                "Outdoor Audio Solution": 3,
                              },
                              {
                                month: "Mar",
                                "Home Cinema": 11,
                                "Home Automation": 4,
                                "Security System": 6,
                                "Outdoor Audio Solution": 9,
                              },
                              {
                                month: "Apr",
                                "Home Cinema": 7,
                                "Home Automation": 3,
                                "Security System": 2,
                                "Outdoor Audio Solution": 1,
                              },
                              {
                                month: "May",
                                "Home Cinema": 11,
                                "Home Automation": 6,
                                "Security System": 4,
                                "Outdoor Audio Solution": 2,
                              },
                              {
                                month: "Jun",
                                "Home Cinema": 2,
                                "Home Automation": 1,
                                "Security System": 1,
                                "Outdoor Audio Solution": 0,
                              },
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

        <Card className="bg-gradient-to-br from-white via-gray-50/50 to-white border-0 shadow-xl overflow-hidden">
          <CardBody className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Recent Activities
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  Latest project updates and system activities
                </p>
              </div>
              <Button
                isIconOnly
                variant="light"
                size="lg"
                className="hover:bg-primary/10 text-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {loading ? (
              /* Activities Loader */
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-100">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <ActivityItem
                    key={`${activity.id}-${index}`}
                    id={activity.id}
                    type={activity.type}
                    description={activity.description}
                    time={activity.time}
                  />
                ))}

                {recentActivities.length === 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">
                      No recent activities
                    </p>
                    <p className="text-gray-400 text-sm">
                      Activities will appear here as they happen
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Recent Projects - Only show if user has projects view permission */}
      {userPermissions.projects.hasViewPermission && (
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(recentProjects.length > 0
              ? recentProjects
              : [
                  {
                    id: "1",
                    customer: "Vinoth R",
                    status: "InProgress",
                    service: "Home Cinema",
                    amount: "₹30,00,000",
                    date: "26/05/2025",
                    address: "123/ss colony, Thirunager, Madurai-625018",
                    progress: "1/3",
                    color: "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]",
                  },
                  {
                    id: "2",
                    customer: "Vaisu K",
                    status: "InProgress",
                    service: "Security System",
                    amount: "₹26,00,000",
                    date: "18/05/2025",
                    address: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
                    progress: "2/5",
                    color: "bg-gradient-to-br from-[#014C95] to-[#36B9F6]",
                  },
                  {
                    id: "3",
                    customer: "Sanker A",
                    status: "Complete",
                    service: "Home Automation",
                    amount: "₹20,00,000",
                    date: "08/04/2025",
                    address: "1A/67 Anbu nagar, Anna Nagar, Madurai-625018",
                    progress: "3/3",
                    color: "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]",
                  },
                  {
                    id: "4",
                    customer: "Anu J",
                    status: "InProgress",
                    service: "Outdoor Audio Solution",
                    amount: "₹32,00,000",
                    date: "22/04/2025",
                    address: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
                    progress: "2/3",
                    color: "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]",
                  },
                ]
            ).map((project) => (
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
                userPermissions={userPermissions.projects}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
