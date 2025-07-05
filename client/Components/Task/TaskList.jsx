"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Edit, Circle, File, Check } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";

const TaskList = ({ userPermissions, onEditTask }) => {
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
          onEditTask={onEditTask}
        />
      ))}
    </>
  );
};

const TaskItem = ({ task, userPermissions, onEditTask }) => {
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
  } = task;

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

  return (
    <Card className="mb-6  bg-[#fff] border border-[#D1D1D1] rounded-xl shadow-none">
      <div className="flex items-start justify-between ">
        <div className="flex items-center justify-start p-2">
          <div className="items-start "> {getStatusIcon()}</div>
          <div className="items-start mt-2">
            <h4
              className="font-[400] text-lg text-[#616161] mb-1"
              style={{ letterSpacing: 0 }}
            >
              {title}
            </h4>
            <div className="text-[#616161] text-sm ">
              Assignee:{" "}
              <span className="font-[700] text-[#616161]">
                {assignedTo?.name || "Unassigned"}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {getStatusBadge()}{" "}
          <div className="grid justify-end text-xs text-[#616161] mb-2 mt-3">
            <span>Start Date : {formattedStartDate}</span>
            <span>End Date : {formattedEndDate}</span>
          </div>
        </div>
      </div>
      {comment && (
        <div className="text-[#616161] text-sm mb-5 px-6">Note : {comment}</div>
      )}
      <div className="text-[#616161] text-sm mb-2 px-6">Attachment : </div>
      <div className="flex gap-6 mb-4 px-6">
        {/* Before attachments */}
        <div className="flex-1 border border-[#EDEDED] rounded-lg p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 min-h-[48px]">
            {beforeAttachments.map((attachment, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-[#222] border border-[#BDBDBD] rounded-full overflow-hidden flex items-center justify-center"
              >
                {attachment.mimetype &&
                attachment.mimetype.startsWith("image") ? (
                  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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
        <div className="flex-1 border border-[#EDEDED] rounded-lg p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-2 min-h-[48px]">
            {afterAttachments.map((attachment, index) => (
              <div
                key={index}
                className="w-12 h-12 bg-[#222] border border-[#BDBDBD] rounded-full overflow-hidden flex items-center justify-center"
              >
                {attachment.mimetype &&
                attachment.mimetype.startsWith("image") ? (
                  <img
                    src={attachment.url}
                    alt={`Attachment ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
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
        <div className="flex flex-wrap gap-2 mt-2 px-6 ">
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
      )}{" "}
      <div className="p-4 flex justify-end ">
        <Button
          className="bg-[#EAEAEA] rounded-lg p-2"
          size="xs"
          onPress={() => onEditTask(task)}
        >
          <Edit className="text-[#6E6E6E] w-4 h-4 " />
        </Button>
      </div>
    </Card>
  );
};

export default TaskList;
