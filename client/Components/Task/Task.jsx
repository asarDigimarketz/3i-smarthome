"use client";
import { useState } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Divider } from "@heroui/divider";
import ProjectDetails from "./ProjectDetails";
import TaskList from "./TaskList";
import TaskForm from "./TaskForm";
import { Flag, Home, List, Smartphone, Tv2 } from "lucide-react";
import ProposalFilters from "../Proposal/ProposalFilters";

const Task = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <Card className="w-full max-w-7xl mx-auto">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-1">Task</h1>
          <p className="text-gray-500 text-sm mb-4">Manage all your Tasks.</p>
          <div className="flex items-center justify-between mb-8">
            {" "}
            <ProposalFilters />
          </div>
          <div className="flex gap-6">
            <div className="w-1/3">
              <ProjectDetails />
            </div>
            <Divider orientation="vertical" />
            <div className="w-2/3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Task</h2>
                <Button
                  color="danger"
                  onPress={() => setShowTaskForm(!showTaskForm)}
                >
                  + Add Task
                </Button>
              </div>
              <TaskList />
              {showTaskForm && (
                <TaskForm onClose={() => setShowTaskForm(false)} />
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Task;
