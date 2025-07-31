"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Edit, Circle, File, Check } from "lucide-react";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";
import TaskForm from "./TaskForm"; // Adjust the import path as needed
import { Tooltip } from "@heroui/tooltip";
import { Loader } from "lucide-react";
import { usePermissions } from "../../lib/utils";

const TaskList = ({ userPermissions, refreshKey, serviceFilter = "All" }) => {
  const { isAdmin, user } = usePermissions();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [tasks, setTasks] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editRefreshKey, setEditRefreshKey] = useState(0);

  useEffect(() => {
    setEditingTaskId(null); // Reset edit mode on project/filter change
  }, [projectId, serviceFilter, refreshKey]);

  useEffect(() => {
    const fetchTasksAndProject = async () => {
      if (!projectId) {
        setLoading(false);
        setProject(null);
        setTasks([]);
        return;
      }

      try {
        setLoading(true);

        // Fetch both tasks and project details
        const [tasksResponse, projectResponse] = await Promise.all([
          apiClient.get(`/api/tasks/project/${projectId}`),
          apiClient.get(`/api/projects/${projectId}`)
        ]);

        if (tasksResponse.data.success) {
          setTasks(tasksResponse.data.data);
        } else {
          addToast({
            title: "Error",
            description: tasksResponse.data.message || "Failed to fetch tasks",
            color: "danger",
          });
        }

        if (projectResponse.data.success) {
          setProject(projectResponse.data.data);
        }
      } catch (error) {
        console.error("Error fetching tasks and project:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch tasks",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasksAndProject();
  }, [projectId, refreshKey, editRefreshKey]);

  // Check if current project matches the service filter
  const shouldShowTasks = () => {
    if (!project) return false;
    if (serviceFilter === "All") return true;
    return project.services === serviceFilter;
  };

  // Enhanced filtering logic - filter tasks by service (only if project matches filter)
  const filteredTasks = shouldShowTasks() ? tasks.filter((task) => {
    if (serviceFilter === "All") return true;

    // Check if task has project service information
    if (task.projectService) {
      return task.projectService === serviceFilter;
    }

    // Check if task has nested project object with service
    if (task.project && task.project.services) {
      return task.project.services === serviceFilter;
    }

    // If no service information is available, don't filter out
    return true;
  }) : [];

  if (loading) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-8">
        <Loader className="animate-spin text-gray-400 w-8 h-8 mb-2" />
        <span className="text-gray-400">Loading tasks...</span>
      </div>
    );
  }

  // If no project is selected or no tasks found
  if (!projectId || filteredTasks.length === 0) {
    return (
      <div className="mb-4">
        {!projectId ? (
          <div className="text-center py-8">
            <h4 className="text-gray-500">No project selected</h4>
            <p className="text-sm text-gray-400">
              Please select a project to view tasks
            </p>
          </div>
        ) : !shouldShowTasks() ? (
          <div className="text-center py-8">
            <h4 className="text-gray-500">
              {serviceFilter !== "All"
                ? `No ${serviceFilter} project selected`
                : "Project doesn't match filter"}
            </h4>
            <p className="text-sm text-gray-400">
              Please select a {serviceFilter} project to view tasks
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <h4 className="text-gray-500">
              {serviceFilter === "All"
                ? "No tasks found"
                : `No ${serviceFilter} tasks found`}
            </h4>
            <p className="text-sm text-gray-400">
              {serviceFilter === "All"
                ? "Create a new task to get started"
                : `Create a new ${serviceFilter} task or select a different service filter`}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render tasks
  return (
    <>
      {filteredTasks.map((task) =>
        editingTaskId === task._id ? (
          <TaskForm
            key={task._id}
            task={task}
            userPermissions={userPermissions}
            onClose={() => {
              setEditingTaskId(null);
              setEditRefreshKey((k) => k + 1);
            }}
          />
        ) : (
          <TaskItem
            key={task._id}
            task={task}
            userPermissions={userPermissions}
            onEditTask={() => setEditingTaskId(task._id)}
            isAdmin={isAdmin}
            user={user}
          />
        )
      )}
    </>
  );
};

const TaskItem = ({ task, userPermissions, onEditTask, isAdmin, user }) => {
  const {
    _id,
    title,
    comment,
    status,
    startDate,
    endDate,
    assignedTo,
    beforeAttachments = [],
    afterAttachments = [],
    attachements = [],
    projectService,
    project,
  } = task;

  // Check if current user can edit this task
  const canEditTask = () => {
    // Admin can edit all tasks
    if (isAdmin) return true;

    // Assigned employees can edit their tasks (regardless of general edit permission)
    if (Array.isArray(assignedTo) && assignedTo.length > 0 && user) {
      // Check by both ID and email since they might be different record types
      const userId = user.id || user._id || user.userId;
      const userEmail = user.email;

      const isAssigned = assignedTo.some(emp => {
        // Compare by ID first, then by email as fallback
        return emp._id === userId || emp.email === userEmail;
      });

      return isAssigned;
    }

    return false;
  };


  const getStatusIcon = () => {
    switch (status) {
      case "new":
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
        );
      case "inprogress":
        return <Circle className="w-6 h-6 text-[#FFB74D] mr-3" fill="#fff" />;
      case "completed":
        return (
          <Check className="w-7 h-7 text-white mr-3  p-1  bg-[#16A34A] rounded-full" />
        );
      default:
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
        );
    }
  };

  // Pixel-perfect status badge
  const getStatusBadge = () => {
    switch (status) {
      case "inprogress":
        return (
          <span
            className="bg-[#FFB74D] text-[#181818] text-xs px-4 py-1 rounded-full font-semibold tracking-tight"
            style={{ fontSize: "13px", letterSpacing: 0 }}
          >
            Inprogress
          </span>
        );
      case "completed":
        return (
          <span
            className="bg-[#16A34A] text-white text-xs px-4 py-1 rounded-full font-semibold tracking-tight"
            style={{ fontSize: "13px", letterSpacing: 0 }}
          >
            Done
          </span>
        );
      default:
        return (
          <span
            className="bg-[#CACACA] text-[#181818] text-xs px-4 py-1 rounded-full font-semibold tracking-tight"
            style={{ fontSize: "13px", letterSpacing: 0 }}
          >
            New
          </span>
        );
    }
  };

  // Format dates
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formattedStartDate = formatDate(startDate);
  const formattedEndDate = formatDate(endDate);

  // Get service name for display
  const getServiceName = () => {
    if (projectService) return projectService;
    if (project && project.services) return project.services;
    return "Unknown Service";
  };
  return (
    <Card className="mb-4 sm:mb-6 bg-[#fff] border border-[#D1D1D1] rounded-md shadow-none w-full transition-shadow hover:shadow-lg focus-within:shadow-lg group relative pb-10">
      <div className="flex flex-col sm:flex-row items-start justify-between px-4">
        <div className="flex items-center justify-start py-2 w-full sm:w-auto">
          <div className="items-start"> {getStatusIcon()}</div>
          <div className="items-start mt-2">
            <h4
              className="font-[400] text-base sm:text-lg text-[#616161] mb-1 truncate max-w-[200px] sm:max-w-[300px]"
              style={{ letterSpacing: 0 }}
              title={title}
            >
              {title}
            </h4>
            <div className="text-[#616161] text-xs sm:text-sm ">
              Assignee:{" "}
              <span className="font-[700] text-[#616161] flex  sm:flex-row flex-wrap gap-2 ">
                {Array.isArray(assignedTo) && assignedTo.length > 0
                  ? assignedTo.map((emp) => (
                    <span key={emp._id} className="flex items-center gap-1">
                      {emp.firstName} {emp.lastName}
                    </span>
                  ))
                  : "Unassigned"}
              </span>
            </div>
          </div>
        </div>
        <div className="py-4 flex flex-col items-end w-full sm:w-auto">
          {getStatusBadge()}{" "}
          <div className="grid justify-end text-xs text-[#616161] mb-2 mt-3">
            <span>Start Date : {formattedStartDate}</span>
            <span>End Date : {formattedEndDate}</span>
          </div>
        </div>
      </div>

      <div
        className="text-[#616161] text-xs sm:text-sm mb-3 sm:mb-5 px-4 truncate max-w-full"
        title={comment}
      >
        Note : {comment}
      </div>

      <div className="text-[#616161] text-xs sm:text-sm mb-2 px-4">
        Attachment :{" "}
      </div>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 px-4">
        {/* Before attachments */}
        <div className="flex-1 border border-[#EDEDED] rounded-lg p-2 sm:p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between mb-2 sm:mb-0">
          <div className="flex items-center gap-2 mb-2 min-h-[48px] flex-wrap">
            {beforeAttachments.map((attachment, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-[#222] border border-[#BDBDBD] rounded-full overflow-hidden flex items-center justify-center"
              >
                {attachment.mimetype &&
                  attachment.mimetype.startsWith("image") ? (
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="w-full h-full object-cover">  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  </a>
                ) : (
                  <File className="text-gray-400" size={24} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#BDBDBD] text-center font-medium">
            Before
          </p>
        </div>
        {/* After attachments */}
        <div className="flex-1 border border-[#EDEDED] rounded-lg p-2 sm:p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 min-h-[48px] flex-wrap">
            {afterAttachments.map((attachment, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-[#222] border border-[#BDBDBD] rounded-full overflow-hidden flex items-center justify-center"
              >
                {attachment.mimetype &&
                  attachment.mimetype.startsWith("image") ? (
                  <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="w-full h-full object-cover">  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  </a>
                ) : (
                  <File className="text-gray-400" size={24} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-[#BDBDBD] text-center font-medium">
            After
          </p>
        </div>
      </div>
      {/* General attachments (PDF, etc.) */}
      {attachements && attachements.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 px-2 sm:px-6 ">
          {attachements.map((attachment, idx) => (
            <a
              key={idx}
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center bg-[#E3F2FD] border border-[#BDBDBD] rounded-full px-4 py-2 text-[#0D0E0D] text-xs font-medium hover:bg-[#E3F2FD]/80 transition"
              style={{ maxWidth: "220px" }}
            >
              <File className="mr-2 text-[#BDBDBD]" size={16} />
              <span className="truncate">{attachment.originalName}</span>
            </a>
          ))}
        </div>
      )}
      <div className="absolute bottom-3 right-4 z-10">
        <Tooltip content="Edit Task" placement="top">
          <Button
            className="bg-[#EAEAEA] rounded-lg p-2 group-hover:bg-[#f5f5f5] focus:bg-[#f5f5f5] "
            size="xs"
            onPress={onEditTask}
            tabIndex={0}
            disabled={!canEditTask()}
          >
            <Edit className="text-[#6E6E6E] w-4 h-4 " />
          </Button>
        </Tooltip>
      </div>
    </Card>
  );
};

export default TaskList;
