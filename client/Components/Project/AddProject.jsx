"use client";
import { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { X, Upload } from "lucide-react";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import Link from "next/link.js";
import { ProjectStatusSelect } from "./ProjectStatusSelect.jsx";
import { ServicesSelect } from "../Proposal/ServiceSelect.jsx";
import DashboardHeader from "../header/DashboardHeader.jsx";

export function AddProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [isLoading, setIsLoading] = useState(false);
  // Use arrays for attachments
  const [selectedFiles, setSelectedFiles] = useState([]); // new files
  const [removedAttachments, setRemovedAttachments] = useState([]); // removed existing files
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    address: {
      addressLine: "",
      city: "",
      district: "",
      state: "",
      country: "India",
      pincode: "",
    },
    services: "",
    projectDescription: "",
    size: "",
    projectAmount: "",
    comment: "",
    projectStatus: "new",
    projectDate: new Date().toISOString().split("T")[0],
    attachments: [], // for existing attachments (edit mode)
  });
  const [errors, setErrors] = useState({});

  // Fetch project data if editing
  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      axios
        .get(`${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`, {
          headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
        })
        .then((res) => {
          if (res.data.success && res.data.data) {
            const p = res.data.data;
            setFormData({
              customerName: p.customerName || "",
              contactNumber: p.contactNumber || "",
              email: p.email || "",
              address: p.address || {
                addressLine: "",
                city: "",
                district: "",
                state: "",
                country: "India",
                pincode: "",
              },
              services: p.services || "",
              projectDescription: p.projectDescription || "",
              size: p.size || "",
              projectAmount: p.projectAmount || "",
              comment: p.comment || "",
              projectStatus: p.projectStatus || "new",
              projectDate:
                p.projectDate &&
                new Date(p.projectDate).toISOString().split("T")[0],
              attachments: Array.isArray(p.attachments) ? p.attachments : [],
            });
          }
        })
        .catch(() => {
          addToast({
            title: "Error",
            description: "Failed to load project for editing",
            color: "danger",
          });
        })
        .finally(() => setIsLoading(false));
    }
  }, [projectId]);

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [section, subField] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [subField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // File input handler for multiple files
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 10 * 1024 * 1024;
    const validFiles = files.filter((file) => {
      if (!allowedTypes.includes(file.type)) {
        addToast({
          title: "Invalid file type",
          description: `File ${file.name} is not a supported type`,
          color: "danger",
        });
        return false;
      }
      if (file.size > maxSize) {
        addToast({
          title: "File too large",
          description: `File ${file.name} exceeds 10MB limit`,
          color: "danger",
        });
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    // Reset input value so same file can be re-added if removed
    event.target.value = null;
  };

  // Remove a new file before upload
  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an existing attachment (edit mode)
  const handleRemoveExistingAttachment = (index) => {
    setRemovedAttachments((prev) => [...prev, formData.attachments[index]]);
    setFormData((prev) => {
      const newAttachments = Array.isArray(prev.attachments)
        ? prev.attachments.filter((_, i) => i !== index)
        : [];
      return {
        ...prev,
        attachments: newAttachments,
      };
    });
  };

  const validateForm = () => {
    const newErrors = {};

    // Required field validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    }
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.address.addressLine.trim()) {
      newErrors["address.addressLine"] = "Address line is required";
    }
    if (!formData.address.city.trim()) {
      newErrors["address.city"] = "City is required";
    }
    if (!formData.address.district.trim()) {
      newErrors["address.district"] = "District is required";
    }
    if (!formData.address.state.trim()) {
      newErrors["address.state"] = "State is required";
    }
    if (!formData.address.pincode.trim()) {
      newErrors["address.pincode"] = "Pincode is required";
    }
    if (!formData.services) {
      newErrors.services = "Service selection is required";
    }
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required";
    }
    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    }
    if (!formData.projectAmount || formData.projectAmount <= 0) {
      newErrors.projectAmount =
        "Project amount is required and must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        color: "danger",
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = new FormData();

      // Append form data
      Object.keys(formData).forEach((key) => {
        if (key === "address") {
          submitData.append(key, JSON.stringify(formData[key]));
        } else if (key !== "attachments") {
          submitData.append(key, formData[key]);
        }
      });

      // Always send the current attachments (remaining after removal) as JSON
      if (formData.attachments.length > 0) {
        submitData.append("attachments", JSON.stringify(formData.attachments));
      }
      // Append new files
      selectedFiles.forEach((file) => {
        submitData.append("attachments", file);
      });
      // If all attachments are removed and no new files, send empty attachments array
      if (formData.attachments.length === 0 && selectedFiles.length === 0) {
        submitData.append("attachments", "[]");
      }
      // Send removed attachment IDs/URLs for backend cleanup
      if (removedAttachments.length > 0) {
        submitData.append(
          "removedAttachments",
          JSON.stringify(removedAttachments.map((a) => a._id || a.url))
        );
      }

      let response;
      if (projectId) {
        response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
          submitData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
      } else {
        response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
          submitData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );
      }

      if (response.data.success) {
        addToast({
          title: "Success",
          description: projectId
            ? "Project updated successfully"
            : "Project created successfully",
          color: "success",
        });

        router.push("/dashboard/projects");
      } else {
        throw new Error(response.data.message || "Failed to save project");
      }
    } catch (error) {
      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to save project",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <DashboardHeader
          title={projectId ? "Edit Project" : "Add Project"}
          className="mb-4"
        />
      </div>
      <form onSubmit={handleSubmit}>
        <Card className="p-6" shadow="sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2">
                Customer Name *
              </label>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Customer Name"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                isInvalid={!!errors.customerName}
                errorMessage={errors.customerName}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Contact Number *
              </label>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Contact Number"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
                isInvalid={!!errors.contactNumber}
                errorMessage={errors.contactNumber}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email Id *</label>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Email Id"
                type="email"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date *</label>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Date"
                type="date"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.projectDate}
                onChange={(e) =>
                  handleInputChange("projectDate", e.target.value)
                }
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 mb-2">Address *</label>
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Address Line"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.addressLine}
                onChange={(e) =>
                  handleInputChange("address.addressLine", e.target.value)
                }
                isInvalid={!!errors["address.addressLine"]}
                errorMessage={errors["address.addressLine"]}
              />
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="City/Town/Village"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.city}
                onChange={(e) =>
                  handleInputChange("address.city", e.target.value)
                }
                isInvalid={!!errors["address.city"]}
                errorMessage={errors["address.city"]}
              />
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="District"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.district}
                onChange={(e) =>
                  handleInputChange("address.district", e.target.value)
                }
                isInvalid={!!errors["address.district"]}
                errorMessage={errors["address.district"]}
              />
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="State"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.state}
                onChange={(e) =>
                  handleInputChange("address.state", e.target.value)
                }
                isInvalid={!!errors["address.state"]}
                errorMessage={errors["address.state"]}
              />
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Country"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.country}
                onChange={(e) =>
                  handleInputChange("address.country", e.target.value)
                }
              />
            </div>

            <div>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Pincode"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.address.pincode}
                onChange={(e) =>
                  handleInputChange("address.pincode", e.target.value)
                }
                isInvalid={!!errors["address.pincode"]}
                errorMessage={errors["address.pincode"]}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Size *</label>
              <div className="flex">
                <Input
                  classNames={{
                    inputWrapper: " h-[50px] border-[#E0E5F2]",
                  }}
                  placeholder="Size"
                  radius="sm"
                  variant="bordered"
                  className="w-full rounded-r-none"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  isInvalid={!!errors.size}
                  endContent={
                    <span className="text-xs text-[#999999] border-[#00000080] border-l-medium px-3">
                      Sqt
                    </span>
                  }
                />
              </div>
              {errors.size && (
                <div className="text-red-500 text-sm mt-1">{errors.size}</div>
              )}
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Services *</label>
              <ServicesSelect
                value={formData.services}
                onChange={(value) => handleInputChange("services", value)}
                isInvalid={!!errors.services}
                errorMessage={errors.services}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Project Amount *
              </label>
              <Input
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                placeholder="Amount"
                type="number"
                min="0"
                step="0.01"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.projectAmount}
                onChange={(e) =>
                  handleInputChange(
                    "projectAmount",
                    parseFloat(e.target.value) || ""
                  )
                }
                isInvalid={!!errors.projectAmount}
                errorMessage={errors.projectAmount}
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">₹</span>
                  </div>
                }
              />
            </div>

            <div className="relative">
              <label className="block text-gray-700 mb-2">Status</label>
              <ProjectStatusSelect
                value={formData.projectStatus}
                onChange={(value) => handleInputChange("projectStatus", value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Comment</label>
              <Textarea
                placeholder="Comment"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">
                Project Description *
              </label>
              <Textarea
                placeholder="Project Description"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.projectDescription}
                onChange={(e) =>
                  handleInputChange("projectDescription", e.target.value)
                }
                isInvalid={!!errors.projectDescription}
                errorMessage={errors.projectDescription}
              />
            </div>
            <div className="col-span-1 md:col-span-2 grid gap-y-4">
              <div className="flex items-center gap-4">
                <label className="block text-gray-700 mb-2">
                  Project Attachments
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button
                    as="span"
                    color="primary"
                    radius="sm"
                    startContent={<Upload />}
                    className="cursor-pointer"
                  >
                    Upload
                  </Button>
                </label>
              </div>
              {/* List all attachments (existing and new) */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Existing attachments (edit mode) */}
                {Array.isArray(formData.attachments) &&
                  formData.attachments.map((att, idx) => (
                    <div
                      key={att._id || att.url}
                      className="flex items-center bg-gray-100 rounded px-2 py-1"
                    >
                      <a
                        href={
                          att.url.startsWith("http") ? att.url : `/${att.url}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate"
                        download={att.originalName || true}
                        title={att.originalName || "Attachment"}
                      >
                        {att.originalName || "Attachment"}
                      </a>
                      <Button
                        type="button"
                        isIconOnly
                        color="primary"
                        className="ml-2"
                        onPress={() => handleRemoveExistingAttachment(idx)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                {/* New files (not yet uploaded) */}
                {selectedFiles.map((file, idx) => (
                  <div
                    key={file.name + idx}
                    className="flex items-center bg-gray-100 rounded px-2 py-1"
                  >
                    <span className="truncate max-w-xs" title={file.name}>
                      {file.name}
                    </span>
                    <Button
                      type="button"
                      size="xs"
                      color="primary"
                      variant="light"
                      className="ml-2"
                      onPress={() => handleRemoveSelectedFile(idx)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                {(!Array.isArray(formData.attachments) ||
                  formData.attachments.length === 0) &&
                  selectedFiles.length === 0 && (
                    <span className="text-gray-500 text-xs">
                      *Attach project docs/pdf/jpeg/png
                    </span>
                  )}
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/projects">
              <Button
                variant="bordered"
                radius="full"
                className="px-8 text-primary"
                isDisabled={isLoading}
              >
                Cancel
              </Button>
            </Link>

            <Button
              color="primary"
              radius="full"
              className="px-8"
              type="submit"
              isLoading={isLoading}
              isDisabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
