"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import ProjectDetails from "./ProjectDetails";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { Plus } from "lucide-react";
import ProposalFilters from "../Proposal/ProposalFilters";
import DashboardHeader from "../header/DashboardHeader";

const Task = () => {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    hasAddPermission: false,
    hasEditPermission: false,
    hasDeletePermission: false,
    hasViewPermission: false,
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Check user permissions on component mount
  useEffect(() => {
    const checkUserPermissions = () => {
      if (!session?.user) return;

      // Hotel admin has all permissions
      if (!session.user.isEmployee) {
        setUserPermissions({
          hasAddPermission: true,
          hasEditPermission: true,
          hasDeletePermission: true,
          hasViewPermission: true,
        });
        return;
      }

      // Check employee permissions for tasks module
      const permissions = session.user.permissions || [];
      const taskPermission = permissions.find(
        (p) => p.page?.toLowerCase() === "tasks"
      );

      if (taskPermission && taskPermission.actions) {
        setUserPermissions({
          hasViewPermission: taskPermission.actions.view || false,
          hasAddPermission: taskPermission.actions.add || false,
          hasEditPermission: taskPermission.actions.edit || false,
          hasDeletePermission: taskPermission.actions.delete || false,
        });
      }
    };

    checkUserPermissions();
  }, [session]);

  // Reset the form when project changes
  useEffect(() => {
    setShowTaskForm(false);
  }, [projectId]);

  const handleAddTask = () => {
    if (!projectId) {
      addToast({
        title: "Select a Project",
        description: "Please select a project first to add a task",
        color: "warning",
      });
      return;
    }

    if (!userPermissions.hasAddPermission) {
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

  // Show access denied if no view permission
  if (!userPermissions.hasViewPermission) {
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
    <div className="min-h-screen p-8">
      <DashboardHeader title="Task" description="Manage all your Tasks." />
      <Card className="w-full mx-auto  mt-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            {!userPermissions.hasAddPermission && (
              <div className="px-3 py-1 bg-warning-100 text-warning-800 rounded-full text-sm">
                Read Only
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mb-8">
            <ProposalFilters />
          </div>

          <div className="flex gap-6">
            <div className="w-1/3">
              <ProjectDetails userPermissions={userPermissions} />
            </div>
            <Divider className="my-2" orientation="vertical" />
            <div className="w-2/3 bg-white border-1 border-gray-200 p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Task</h2>
                {userPermissions.hasAddPermission && (
                  <Button
                    color="primary"
                    onPress={handleAddTask}
                    startContent={<Plus />}
                    className="rounded-lg"
                  >
                    Add Task
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <TaskList
                  userPermissions={userPermissions}
                  onEditTask={handleEditTask}
                />
                {showTaskForm && (
                  <TaskForm
                    onClose={() => {
                      setShowTaskForm(false);
                      setSelectedTask(null);
                    }}
                    userPermissions={userPermissions}
                    task={selectedTask}
                  />
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
