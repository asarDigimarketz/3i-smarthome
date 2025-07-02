"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Calendar, Circle, Clock, File } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";

const TaskList = ({ userPermissions }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/tasks/project/${projectId}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

        if (response.data.success) {
          setTasks(response.data.data);
        } else {
          addToast({
            title: "Error",
            description: response.data.message || "Failed to fetch tasks",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch tasks",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  if (loading) {
    return (
      <>
        {[...Array(3)].map((_, index) => (
          <Card key={index} className="mb-4">
            <div className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center mb-2">
                  <div className="w-6 h-6 bg-gray-200 rounded-full mr-3"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="ml-9">
                  <div className="h-4 bg-gray-200 rounded mb-2 w-full"></div>
                  <div className="flex space-x-2 mb-2">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </>
    );
  }

  // If no project is selected or no tasks found
  if (!projectId || tasks.length === 0) {
    return (
      <div className="mb-4">
        {!projectId ? (
          <div className="text-center py-8">
            <h4 className="text-gray-500">No project selected</h4>
            <p className="text-sm text-gray-400">
              Please select a project to view tasks
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            <h4 className="text-gray-500">No tasks found</h4>
            <p className="text-sm text-gray-400">
              Create a new task to get started
            </p>
          </div>
        )}
      </div>
    );
  }

  // Render tasks
  return (
    <>
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          userPermissions={userPermissions}
        />
      ))}
    </>
  );
};

const TaskItem = ({ task, userPermissions }) => {
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
  } = task;

  const getStatusIcon = () => {
    switch (status) {
      case "new":
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
        );
      case "inprogress":
        return (
          <Circle className="w-6 h-6 text-orange-500 mr-3 fill-orange-500" />
        );
      case "completed":
        return (
          <Circle className="w-6 h-6 text-green-500 mr-3 fill-green-500" />
        );
      default:
        return (
          <div className="w-6 h-6 border-2 border-gray-300 rounded-full mr-3"></div>
        );
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "new":
        return (
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            New Task
          </span>
        );
      case "inprogress":
        return (
          <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
            Inprogress
          </span>
        );
      case "completed":
        return (
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
            Done
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
            New Task
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

  // Get assignee name
  const assigneeName = assignedTo?.name || "Unassigned";

  return (
    <Card className="mb-6 p-4">
      <div className="flex items-center mb-2">
        {status === "completed" ? (
          <Circle className="w-6 h-6 text-green-500 fill-green-500 mr-3" />
        ) : (
          <div className="relative">{getStatusIcon()}</div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{title}</h4>
            {getStatusBadge()}
          </div>
          <p className="text-sm text-gray-500">Assignee: {assigneeName}</p>
        </div>
      </div>

      <div className="ml-9">
        {comment && (
          <p className="text-sm text-gray-500 mb-2">Note: {comment}</p>
        )}

        {/* Date information */}
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <div className="flex items-center">
            <span>Start Date: {formattedStartDate}</span>
          </div>
          <div className="flex items-center">
            <span>End Date: {formattedEndDate}</span>
          </div>
        </div>

        {/* Before attachments */}
        {beforeAttachments && beforeAttachments.length > 0 && (
          <div className="mb-2">
            <div className="text-sm text-gray-500 mb-1">Attachment:</div>
            <div className="flex space-x-2 mb-1">
              {beforeAttachments.map((attachment, index) =>
                attachment.mimetype &&
                attachment.mimetype.startsWith("image") ? (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div key={index} className="flex items-center text-blue-600">
                    <File className="mr-1" />
                    <span className="text-sm">{attachment.originalName}</span>
                  </div>
                )
              )}
            </div>
            <div className="text-sm text-gray-500">Before</div>
          </div>
        )}

        {/* After attachments */}
        {afterAttachments && afterAttachments.length > 0 && (
          <div>
            <div className="flex space-x-2 mb-1">
              {afterAttachments.map((attachment, index) =>
                attachment.mimetype &&
                attachment.mimetype.startsWith("image") ? (
                  <div
                    key={index}
                    className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden"
                  >
                    <img
                      src={attachment.url}
                      alt={`Attachment ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div key={index} className="flex items-center text-blue-600">
                    <File className="mr-1" />
                    <span className="text-sm">{attachment.originalName}</span>
                  </div>
                )
              )}
            </div>
            <div className="text-sm text-gray-500">After</div>
          </div>
        )}

        {/* PDF attachment if any */}
        {task.attachment && (
          <div className="mt-2 flex items-center text-blue-600">
            <File className="mr-1" size={16} />
            <span className="text-sm">
              {task.attachment.originalName || "pro-987665.pdf"}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TaskList;
