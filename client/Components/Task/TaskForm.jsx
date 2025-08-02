"use client";
import { useState, useEffect } from "react";
import { Input, Textarea } from "@heroui/input";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { Calendar, Image, Plus, Trash2, X } from "lucide-react";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import { useSearchParams } from "next/navigation";
import { DeleteConfirmModal } from "../ui/delete-confirm-modal";
import { usePermissions } from "../../lib/utils";

const TaskForm = ({ onClose, userPermissions, task, refreshTasks, canEditTask }) => {
  const { isAdmin, user } = usePermissions();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  // Check if current user can edit this task (same logic as TaskList)
  const canEditCurrentTask = () => {
    // For new tasks, use the general add permission
    if (!task || !task._id) {
      return userPermissions.hasAddPermission;
    }

    // Admin can edit all tasks
    if (isAdmin) return true;

    // Assigned employees can edit their tasks (regardless of general edit permission)
    if (Array.isArray(task.assignedTo) && task.assignedTo.length > 0 && user) {
      // Check by both ID and email since they might be different record types
      const userId = user.id || user._id || user.userId;
      const userEmail = user.email;

      const isAssigned = task.assignedTo.some(emp => {
        // Compare by ID first, then by email as fallback
        return emp._id === userId || emp.email === userEmail;
      });

      return isAssigned;
    }

    return false;
  };
  const [employees, setEmployees] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    comment: "",
    startDate: "",
    endDate: "",
    assignedTo: [], // now an array for multiple assignees
    status: "new",
  });
  const [beforeAttachments, setBeforeAttachments] = useState([]);
  const [afterAttachments, setAfterAttachments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [errors, setErrors] = useState({});

  // Track removed attachments
  const [removedBefore, setRemovedBefore] = useState([]);
  const [removedAfter, setRemovedAfter] = useState([]);
  const [removedGeneral, setRemovedGeneral] = useState([]);

  // Fetch employees for assignment dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get(`/api/employeeManagement`);
        if (response.data.success) {
          // Transform the employee data for the dropdown and filter only active employees
          const employeesList = response.data.employees || [];
          const activeEmployees = employeesList.filter(emp => emp.status === 'active');
          setEmployees(
            activeEmployees.map((emp) => ({
              _id: emp._id,
              name: `${emp.firstName} ${emp.lastName}`,
              avatar: emp.avatar, // include avatar
              email: emp.email, // include email
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

  // Autofill form if editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || "",
        comment: task.comment || "",
        startDate: task.startDate ? task.startDate.slice(0, 10) : "",
        endDate: task.endDate ? task.endDate.slice(0, 10) : "",
        assignedTo: Array.isArray(task.assignedTo)
          ? task.assignedTo.map((emp) => emp._id)
          : task.assignedTo?._id
            ? [task.assignedTo._id]
            : [],
        status: task.status || "new",
      });
      // Existing attachments (show as non-removable for now)
      setBeforeAttachments(
        (task.beforeAttachments || []).map((a) => ({
          file: { type: a.mimetype || "application/octet-stream" },
          preview: a.url,
          name: a.originalName,
          url: a.url,
          existing: true,
        }))
      );
      setAfterAttachments(
        (task.afterAttachments || []).map((a) => ({
          file: { type: a.mimetype || "application/octet-stream" },
          preview: a.url,
          name: a.originalName,
          url: a.url,
          existing: true,
        }))
      );
      setAttachments(
        (task.attachements || []).map((a) => ({
          file: { type: a.mimetype || "application/octet-stream" },
          preview: a.url,
          name: a.originalName,
          url: a.url,
          existing: true,
        }))
      );
    } else {
      setFormData({
        title: "",
        comment: "",
        startDate: "",
        endDate: "",
        assignedTo: [],
        status: "new",
      });
      setBeforeAttachments([]);
      setAfterAttachments([]);
      setAttachments([]);
    }
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form data
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required";
    } else if (formData.title.trim().length < 3) {
      newErrors.title = "Task title must be at least 3 characters";
    } else if (formData.title.trim().length > 100) {
      newErrors.title = "Task title must not exceed 100 characters";
    }

    // Start Date validation
    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    } else {
      const startDate = new Date(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(today.getFullYear() + 2);

      if (startDate < oneYearAgo) {
        newErrors.startDate = "Start date cannot be more than 1 year in the past";
      } else if (startDate > twoYearsFromNow) {
        newErrors.startDate = "Start date cannot be more than 2 years in the future";
      }
    }

    // End Date validation
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      const startDate = new Date(formData.startDate);

      const twoYearsFromNow = new Date();
      twoYearsFromNow.setFullYear(new Date().getFullYear() + 2);

      if (formData.startDate && endDate < startDate) {
        newErrors.endDate = "End date cannot be earlier than start date";
      } else if (endDate > twoYearsFromNow) {
        newErrors.endDate = "End date cannot be more than 2 years in the future";
      }
    }

    // Comment validation (optional but if provided, validate length)
    if (formData.comment && formData.comment.trim().length > 500) {
      newErrors.comment = "Comment must not exceed 500 characters";
    }

    // Assigned To validation
    if (formData.assignedTo.length === 0) {
      newErrors.assignedTo = "Please assign the task to at least one employee";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectChange = (name) => (value) => {
    setFormData({ ...formData, [name]: value });

    // Clear error when user makes a selection
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
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
    } else if (type === "after") {
      setAfterAttachments([...afterAttachments, ...fileObjects]);
    } else if (type === "general") {
      setAttachments([...attachments, ...fileObjects]);
    }
  };

  const removeAttachment = (type, index) => {
    if (type === "before") {
      const newAttachments = [...beforeAttachments];
      const removed = newAttachments[index];
      if (removed.existing) setRemovedBefore((prev) => [...prev, removed]);
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      setBeforeAttachments(newAttachments);
    } else if (type === "after") {
      const newAttachments = [...afterAttachments];
      const removed = newAttachments[index];
      if (removed.existing) setRemovedAfter((prev) => [...prev, removed]);
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      setAfterAttachments(newAttachments);
    } else if (type === "general") {
      const newAttachments = [...attachments];
      const removed = newAttachments[index];
      if (removed.existing) setRemovedGeneral((prev) => [...prev, removed]);
      URL.revokeObjectURL(newAttachments[index].preview);
      newAttachments.splice(index, 1);
      setAttachments(newAttachments);
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

    // Check permissions before submitting using our custom logic
    if (!canEditCurrentTask()) {
      addToast({
        title: "Access Denied",
        description: task && task._id
          ? "You don't have permission to edit this task"
          : "You don't have permission to create tasks",
        color: "danger",
      });
      return;
    }

    // Validate form before submission
    if (!validateForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fix the errors and try again",
        color: "danger",
      });
      return;
    }
    try {
      setSubmitting(true);
      const formDataObj = new FormData();
      formDataObj.append("projectId", projectId);
      formDataObj.append("title", formData.title);
      formDataObj.append("comment", formData.comment || "");
      formDataObj.append("startDate", formData.startDate);
      formDataObj.append("endDate", formData.endDate || "");
      formDataObj.append("assignedTo", JSON.stringify(formData.assignedTo)); // send all assignedTo values
      formDataObj.append("status", formData.status || "new");
      // Only append new files
      beforeAttachments.forEach((a) => {
        if (!a.existing) formDataObj.append("beforeAttachments", a.file);
      });
      afterAttachments.forEach((a) => {
        if (!a.existing) formDataObj.append("afterAttachments", a.file);
      });
      attachments.forEach((a) => {
        if (!a.existing) formDataObj.append("attachements", a.file);
      });
      // Send removed attachments info
      if (removedBefore.length > 0) {
        formDataObj.append(
          "removedBeforeAttachments",
          JSON.stringify(removedBefore.map((a) => a.url))
        );
      }
      if (removedAfter.length > 0) {
        formDataObj.append(
          "removedAfterAttachments",
          JSON.stringify(removedAfter.map((a) => a.url))
        );
      }
      if (removedGeneral.length > 0) {
        formDataObj.append(
          "removedGeneralAttachments",
          JSON.stringify(removedGeneral.map((a) => a.url))
        );
      }
      let response;
      if (task && task._id) {
        response = await apiClient.put(`/api/tasks/${task._id}`, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await apiClient.post(`/api/tasks`, formDataObj, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }
      if (response.data.success) {
        addToast({
          title: "Success",
          description:
            task && task._id
              ? "Task updated successfully"
              : "Task created successfully",
          color: "success",
        });
        if (refreshTasks) refreshTasks();
        onClose();
      } else {
        addToast({
          title: "Error",
          description:
            response.data.message ||
            (task && task._id
              ? "Failed to update task"
              : "Failed to create task"),
          color: "danger",
        });
      }
    } catch (error) {
      console.error(
        task && task._id ? "Error updating task:" : "Error creating task:",
        error
      );
      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          (task && task._id
            ? "Failed to update task"
            : "Failed to create task"),
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!task || !task._id) return;
    setSubmitting(true);
    try {
      const response = await apiClient.delete(`/api/tasks/${task._id}`);
      if (response.data.success) {
        addToast({
          title: "Deleted",
          description: "Task deleted successfully",
          color: "success",
        });
        setShowDeleteModal(false);
        onClose();
      } else {
        addToast({
          title: "Error",
          description: response.data.message || "Failed to delete task",
          color: "danger",
        });
      }
    } catch (error) {
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete task",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="bg-white p-2 sm:p-4 rounded-md">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="Task Title"
            placeholder="Enter task name"
            name="title"
            value={formData.title}
            radius="sm"
            onChange={handleChange}
            isRequired
            isInvalid={!!errors.title}
            errorMessage={errors.title}
            className="rounded-lg border-gray-200 w-full"
            classNames={{
              inputWrapper: "bg-[#EEEEEE] h-[48px] md:h-[100px]",
              label: "top-4",
              input: "h-[48px] md:h-[100px]",
            }}
          />
          <Textarea
            label="Comment"
            radius="sm"
            placeholder="Enter comment"
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            isInvalid={!!errors.comment}
            errorMessage={errors.comment}
            className="rounded-lg border-gray-200 w-full"
            classNames={{
              inputWrapper: "bg-[#EEEEEE] ",
            }}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Input
              type="date"
              label="Start Date"
              radius="sm"
              placeholder="Select start date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              isRequired
              isInvalid={!!errors.startDate}
              errorMessage={errors.startDate}
              className="rounded-lg border-gray-200 w-full"
              classNames={{
                inputWrapper: "bg-[#EEEEEE] ",
              }}
            />
          </div>
          <div>
            <Input
              type="date"
              label="End Date"
              placeholder="Select end date"
              radius="sm"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              isInvalid={!!errors.endDate}
              errorMessage={errors.endDate}
              className="rounded-lg border-gray-200 w-full"
              classNames={{
                inputWrapper: "bg-[#EEEEEE] ",
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-4">
          <Select
            label={formData.assignedTo.length ? "" : "Assign To"}
            placeholder="Select assignees"
            selectionMode="multiple"
            selectedKeys={
              new Set(
                formData.assignedTo.filter((id) =>
                  employees.some((emp) => String(emp._id) === String(id))
                )
              )
            }
            radius="sm"
            onSelectionChange={(keys) =>
              handleSelectChange("assignedTo")([...keys])
            }
            isInvalid={!!errors.assignedTo}
            errorMessage={errors.assignedTo}
            className="rounded-lg border-gray-200 w-full"
            classNames={{
              base: "max-w-full",
              trigger: "bg-[#EEEEEE] h-12",
            }}
            items={employees}
            isMultiline
            aria-label="Assign task to employees"
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={item.data.avatar}
                  />
                  <div className="flex flex-col">
                    <span>{item.data.name}</span>
                    <span className="text-default-500 text-tiny">
                      ({item.data.email})
                    </span>
                  </div>
                </div>
              ));
            }}
          >
            {(employee) => (
              <SelectItem key={String(employee._id)} textValue={employee.name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={employee.name}
                    className="flex-shrink-0"
                    size="sm"
                    src={employee.avatar}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{employee.name}</span>
                    <span className="text-tiny text-default-400">
                      {employee.email}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>
          <Select
            label="Status"
            placeholder="Select status"
            selectedKeys={[formData.status]}
            radius="sm"
            onSelectionChange={(keys) =>
              handleSelectChange("status")(Array.from(keys)[0])
            }
            className="rounded-lg border-gray-200 w-full"
            classNames={{
              trigger: "bg-[#EEEEEE] ",
            }}
          >
            <SelectItem key="new">New</SelectItem>
            <SelectItem key="inprogress">In Progress</SelectItem>
            <SelectItem key="completed">Done</SelectItem>
          </Select>
        </div>

        {/* Attachments section */}
        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">Attachment:</p>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Before attachments box */}
            <div className="flex-1 border border-[#EDEDED] rounded-md p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between mb-2 sm:mb-0">
              <div className="flex items-center gap-2 mb-2 min-h-[48px] flex-wrap">
                {beforeAttachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    <div className="w-12 h-12 bg-[#222] border border-[#EDEDED] rounded-full overflow-hidden flex items-center justify-center">
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
                      className="absolute -top-1 -right-1 bg-[#222] border border-[#EDEDED] rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={() => removeAttachment("before", index)}
                      style={{ boxShadow: "0 0 0 2px #EDEDED" }}
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-12 h-12 bg-[#fff] border border-[#EDEDED] rounded-full flex items-center justify-center cursor-pointer">
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
              <p className="text-xs text-[#616161] text-center font-medium">
                Before
              </p>
            </div>
            {/* After attachments box */}
            <div className="flex-1 border border-[#EDEDED] rounded-md p-4 bg-[#fff] min-h-[90px] flex flex-col justify-between">
              <div className="flex items-center gap-2 mb-2 min-h-[48px] flex-wrap">
                {afterAttachments.map((attachment, index) => (
                  <div key={index} className="relative">
                    <div className="w-12 h-12 bg-[#EDEDED] border border-[#EDEDED] rounded-full overflow-hidden flex items-center justify-center">
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
                      className="absolute -top-1 -right-1 bg-[#222] border border-[#BDBDBD] rounded-full w-4 h-4 flex items-center justify-center"
                      onClick={() => removeAttachment("after", index)}
                      style={{ boxShadow: "0 0 0 2px #EDEDED" }}
                    >
                      <X size={10} className="text-white" />
                    </button>
                  </div>
                ))}
                <label className="w-12 h-12 bg-[#fff] border border-[#BDBDBD] rounded-full flex items-center justify-center cursor-pointer">
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
              <p className="text-xs text-[#616161] text-center font-medium">
                After
              </p>
            </div>
          </div>
          {/* General attachments button below */}
          <Button
            color="primary"
            variant="light"
            as="span"
            className="cursor-pointer mt-6 w-full font-bold text-left text-[#BDBDBD] text-lg tracking-tight"
            style={{
              letterSpacing: 0,
              background: "none",
              border: "none",
              boxShadow: "none",
            }}
            onPress={() => document.getElementById("generalFileInput").click()}
          >
            + Add Attachment
            <input
              id="generalFileInput"
              type="file"
              multiple
              accept="image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => handleFileChange("general", e)}
            />
          </Button>
          {/* Show general attachments as a row below the button if any */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="relative">
                  <div className="w-12 h-12 bg-[#222] border border-[#BDBDBD] rounded-full overflow-hidden flex items-center justify-center">
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
                    className="absolute -top-1 -right-1 bg-[#222] border border-[#BDBDBD] rounded-full w-4 h-4 flex items-center justify-center"
                    onClick={() => removeAttachment("general", index)}
                    style={{ boxShadow: "0 0 0 2px #EDEDED" }}
                  >
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button
            color="success"
            className="mr-0 sm:mr-2 text-white"
            type="submit"
            radius="sm"
            isLoading={submitting}
            isDisabled={submitting || !projectId}
            disabled={!canEditCurrentTask()}
          >
            Save
          </Button>
          {task && task._id && (
            <Button
              color="danger"
              variant="light"
              radius="sm"
              onPress={() => setShowDeleteModal(true)}
              isDisabled={submitting}
              disabled={!userPermissions.hasDeletePermission}
              type="button"
            >
              <Trash2 className="text-primary" />
            </Button>
          )}
          {!task && (
            <Button
              color="danger"
              variant="light"
              radius="sm"
              onPress={onClose}
              isDisabled={submitting}
              type="button"
            >
              <X className="text-primary" />
            </Button>
          )}
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={handleDelete}
            submitting={submitting}
          />
        </div>
      </form>
    </Card>
  );
};

export default TaskForm;
