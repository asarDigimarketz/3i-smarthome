"use client";
import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Calendar, Image, Plus, Trash2, X } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";

const TaskForm = ({ onClose }) => {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    startDate: "",
    endDate: "",
    assignedTo: "",
    status: "new",
  });
  const [beforeAttachments, setBeforeAttachments] = useState([]);
  const [afterAttachments, setAfterAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch employees for assignment dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/employeeManagement`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
        if (response.data.success) {
          // Transform the employee data for the dropdown
          const employeesList = response.data.employees || [];
          setEmployees(
            employeesList.map((emp) => ({
              _id: emp._id,
              name: `${emp.firstName} ${emp.lastName}`,
            }))
          );
        } else {
          console.error("Error in employee data format:", response.data);
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        setEmployees([]);
      }
    };

    fetchEmployees();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectChange = (name) => (value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (type, e) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const files = Array.from(e.target.files);
    const fileObjects = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
    }));

    if (type === "before") {
      setBeforeAttachments([...beforeAttachments, ...fileObjects]);
    } else {
      setAfterAttachments([...afterAttachments, ...fileObjects]);
    }
  };

  const removeAttachment = (type, index) => {
    if (type === "before") {
      const newAttachments = [...beforeAttachments];
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      setBeforeAttachments(newAttachments);
    } else {
      const newAttachments = [...afterAttachments];
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      setAfterAttachments(newAttachments);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!projectId) {
      addToast({
        title: "Error",
        description: "No project selected",
        color: "danger",
      });
      return;
    }

    if (!formData.title || !formData.startDate) {
      addToast({
        title: "Error",
        description: "Please fill in required fields (title and start date)",
        color: "danger",
      });
      return;
    }

    try {
      setSubmitting(true);

      // Create FormData for file uploads
      const formDataObj = new FormData();
      formDataObj.append("projectId", projectId);
      formDataObj.append("title", formData.title);
      formDataObj.append("comment", formData.comment || "");
      formDataObj.append("startDate", formData.startDate);
      formDataObj.append("endDate", formData.endDate || "");
      formDataObj.append("assignedTo", formData.assignedTo || "");
      formDataObj.append("status", formData.status || "new");

      // Add before attachments
      if (beforeAttachments.length > 0) {
        for (let i = 0; i < beforeAttachments.length; i++) {
          formDataObj.append("beforeAttachments", beforeAttachments[i].file);
        }
      }

      // Add after attachments
      if (afterAttachments.length > 0) {
        for (let i = 0; i < afterAttachments.length; i++) {
          formDataObj.append("afterAttachments", afterAttachments[i].file);
        }
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tasks`,
        formDataObj,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        addToast({
          title: "Success",
          description: "Task created successfully",
          color: "success",
        });
        onClose();
      } else {
        addToast({
          title: "Error",
          description: response.data.message || "Failed to create task",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create task",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white p-4">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            label="Task Title"
            placeholder="Enter task name"
            name="title"
            value={formData.title}
            onChange={handleChange}
            isRequired
            className=" rounded-lg border-gray-200 "
          />
          <Textarea
            label="Comment"
            placeholder="Enter comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            className="bg-gray-50 rounded-lg border-gray-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              type="date"
              label="Start Date"
              placeholder="Select start date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              isRequired
              className="bg-gray-50 rounded-lg border-gray-200"
            />
          </div>
          <div>
            <Input
              type="date"
              label="End Date"
              placeholder="Select end date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="bg-gray-50 rounded-lg border-gray-200"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Select
            label="Assign To"
            placeholder="Select assignee"
            selectedKeys={formData.assignedTo ? [formData.assignedTo] : []}
            onSelectionChange={(keys) =>
              handleSelectChange("assignedTo")(Array.from(keys)[0])
            }
            className="bg-gray-50 rounded-lg border-gray-200"
          >
            {employees && employees.length > 0 ? (
              employees.map((employee) => (
                <SelectItem key={employee._id} value={employee._id}>
                  {employee.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem key="no-employees" isDisabled>
                No employees available
              </SelectItem>
            )}
          </Select>
          <Select
            label="Status"
            placeholder="Select status"
            selectedKeys={[formData.status]}
            onSelectionChange={(keys) =>
              handleSelectChange("status")(Array.from(keys)[0])
            }
            className="bg-gray-50 rounded-lg border-gray-200 "
          >
            <SelectItem key="new">New</SelectItem>
            <SelectItem key="inprogress">In Progress</SelectItem>
            <SelectItem key="completed">Completed</SelectItem>
          </Select>
        </div>

        {/* Attachments section */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Attachment:</p>

          {/* Before attachments */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-2 mb-2">
              {beforeAttachments.map((attachment, index) => (
                <div key={index} className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {attachment.file.type.startsWith("image") ? (
                      <img
                        src={attachment.preview}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="text-gray-400" size={24} />
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={() => removeAttachment("before", index)}
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer">
                <Plus className="text-gray-400" size={24} />
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange("before", e)}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">Before</p>
          </div>

          {/* After attachments */}
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {afterAttachments.map((attachment, index) => (
                <div key={index} className="relative">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {attachment.file.type.startsWith("image") ? (
                      <img
                        src={attachment.preview}
                        alt={`Attachment ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="text-gray-400" size={24} />
                    )}
                  </div>
                  <button
                    type="button"
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={() => removeAttachment("after", index)}
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              <label className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer">
                <Plus className="text-gray-400" size={24} />
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,application/pdf"
                  className="hidden"
                  onChange={(e) => handleFileChange("after", e)}
                />
              </label>
            </div>
            <p className="text-sm text-gray-500">After</p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            color="primary"
            variant="light"
            as="span"
            className="cursor-pointer"
            onClick={() => document.getElementById("fileInput").click()}
          >
            + Add Attachment
            <input
              id="fileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange("before", e)}
            />
          </Button>
          <div className="flex gap-1">
            <Button
              color="success"
              className="mr-2 text-white"
              type="submit"
              isLoading={submitting}
              isDisabled={submitting || !projectId}
            >
              Save
            </Button>
            <Button
              color="danger"
              variant="light"
              onPress={onClose}
              isDisabled={submitting}
              type="button"
            >
              <Trash2 className="text-red-500" />
            </Button>
          </div>
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;
