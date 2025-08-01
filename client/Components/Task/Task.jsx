"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";
import ProjectDetails from "./ProjectDetails";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { Plus } from "lucide-react";
import ProposalFilters from "../Proposal/ProposalFilters";
import DashboardHeader from "../header/DashboardHeader";
import { usePermissions } from "../../lib/utils";
import apiClient from "../../lib/axios";

const Task = () => {
  const {
    canView,
    canCreate,
    getUserPermissions
  } = usePermissions();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const returnTo = searchParams.get("returnTo");

  // Get permissions using the hook
  const userPermissions = getUserPermissions("task");

  // Service filter state
  const [serviceFilter, setServiceFilter] = useState("All");
  // Add project state
  const [project, setProject] = useState(null);

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskListRefreshKey, setTaskListRefreshKey] = useState(0);

  // Fetch project details when projectId changes
  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) {
        setProject(null);
        return;
      }

      try {
        const response = await apiClient.get(`/api/projects/${projectId}`);

        if (response.data.success) {
          setProject(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        setProject(null);
      }
    };

    fetchProject();
  }, [projectId]);

  // Reset the form when project changes
  useEffect(() => {
    setShowTaskForm(false);
  }, [projectId]);

  // Handle browser back button - Enhanced approach
  useEffect(() => {
    // Store the return URL in sessionStorage as a backup
    if (returnTo) {
      sessionStorage.setItem('projectsReturnTo', returnTo);
    }

    // Handle browser navigation
    const handleBeforeUnload = () => {
      // Clean up session storage when leaving the page normally
      if (!returnTo) {
        sessionStorage.removeItem('projectsReturnTo');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [returnTo]);

  // Handle service filter change
  const handleServiceChange = (service) => {
    setServiceFilter(service);
    // Close task form when service filter changes
    setShowTaskForm(false);
  };

  // Check if current project matches the service filter
  const shouldAllowTaskActions = () => {
    if (!project) return false;
    if (serviceFilter === "All") return true;
    return project.services === serviceFilter;
  };

  const handleAddTask = () => {
    if (!projectId) {
      addToast({
        title: "Select a Project",
        description: "Please select a project first to add a task",
        color: "warning",
      });
      return;
    }

    // Check if project is completed
    if (project && project.projectStatus === "completed") {
      addToast({
        title: "Cannot Add Task",
        description: "Cannot add task for completed projects",
        color: "danger",
      });
      return;
    }

    if (!shouldAllowTaskActions()) {
      addToast({
        title: "Project Service Mismatch",
        description: `Please select a ${serviceFilter} project to add ${serviceFilter} tasks`,
        color: "warning",
      });
      return;
    }

    if (!canCreate("task")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to add tasks",
        color: "danger",
      });
      return;
    }
    setShowTaskForm(!showTaskForm);
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowTaskForm(true);
  };

  const refreshTasks = () => setTaskListRefreshKey((k) => k + 1);

  // Show access denied if no view permission
  if (!canView("task")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view tasks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  bg-[#F8F9FB]">
      <DashboardHeader title="Task" description="Manage all your Tasks." />
      <Card className="w-full mx-auto mt-4 shadow-md md:min-h-[600px] bg-white rounded-md">
        <div className="p-2 sm:p-4 md:p-8">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            {!canCreate("task") && (
              <div className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm">
                Read Only
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-4 md:mb-8 gap-2 md:gap-0">
            <div className="bg-brand-light-red rounded-lg p-4 w-full">
              <ProposalFilters onServiceChange={handleServiceChange} />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 ">
            <div className="w-full md:w-[33%] mb-4 md:mb-0">
              <ProjectDetails
                userPermissions={userPermissions}
                serviceFilter={serviceFilter}
              />
            </div>
            <Divider className="my-2 md:my-0" orientation="vertical" />
            <div className="w-full md:w-[67%] bg-white border-1 border-gray-200 p-2 sm:p-4 md:p-8 rounded-lg shadow-sm overflow-x-auto">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <h2 className="text-lg sm:text-xl font-semibold">Task</h2>

                <Button
                  color="primary"
                  onPress={handleAddTask}
                  startContent={<Plus />}
                  className="rounded-lg w-full sm:w-auto min-h-[44px] text-base px-6"
                  style={{ minWidth: 120 }}
                  disabled={!projectId || !shouldAllowTaskActions() || !canCreate("task")}
                >
                  Add Task
                </Button>

              </div>
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-4">
                <TaskList
                  userPermissions={userPermissions}
                  onEditTask={handleEditTask}
                  refreshKey={taskListRefreshKey}
                  serviceFilter={serviceFilter}
                />
                {showTaskForm && (
                  <div className="w-full">
                    <TaskForm
                      onClose={() => {
                        setShowTaskForm(false);
                        setSelectedTask(null);
                        refreshTasks();
                      }}
                      userPermissions={userPermissions}
                      task={selectedTask}
                      refreshTasks={refreshTasks}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Task;
