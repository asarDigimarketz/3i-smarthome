import { Input, Textarea } from "@heroui/input";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Calendar, Image, Plus, X } from "lucide-react";

const TaskForm = ({ onClose }) => {
  return (
    <Card>
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input label="Task 1" placeholder="Enter task name" />
          <Textarea label="Comment" placeholder="Enter comment" />
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" />
            <Input
              type="date"
              label="Start Date"
              placeholder="Select start date"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="text-gray-400" />
            <Input type="date" label="End Date" placeholder="Select end date" />
          </div>
          <Select label="Assign To" placeholder="Select assignee">
            <SelectItem key="arun">Arun R</SelectItem>
            <SelectItem key="vinoth">Vinoth R</SelectItem>
          </Select>
          <Select label="Status" placeholder="Select status">
            <SelectItem key="new">New</SelectItem>
            <SelectItem key="in-progress">In Progress</SelectItem>
            <SelectItem key="completed">Completed</SelectItem>
          </Select>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Attachment:</p>
          <div className="flex space-x-2 mb-2">
            <AttachmentPlaceholder />
            <AttachmentPlaceholder />
            <AttachmentPlaceholder />
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Plus className="text-gray-400" size={24} />
            </div>
          </div>
          <p className="text-sm text-gray-500">Before</p>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">After:</p>
          <div className="flex space-x-2 mb-2">
            <AttachmentPlaceholder />
            <AttachmentPlaceholder />
            <AttachmentPlaceholder />
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
              <Plus className="text-gray-400" size={24} />
            </div>
          </div>
        </div>
        <div className="flex justify-between">
          <Button color="primary" variant="light">
            + Add Attachment
          </Button>
          <div>
            <Button color="success" className="mr-2">
              Save
            </Button>
            <Button color="danger" variant="light" onPress={onClose}>
              <X />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const AttachmentPlaceholder = () => (
  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
    <Image className="text-gray-400" size={24} />
  </div>
);

export default TaskForm;
