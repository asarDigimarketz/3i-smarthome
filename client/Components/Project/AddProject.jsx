"use client";
import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { useCustomerAutocomplete } from "./_CustomerAutocompleteLogic";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { X, Upload } from "lucide-react";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import apiClient from "../../lib/axios";
import Link from "next/link.js";
import { ProjectStatusSelect } from "./ProjectStatusSelect.jsx";
import { ServicesSelect } from "../Proposal/ServiceSelect.jsx";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { usePermissions } from "../../lib/utils";
import axios from "axios";

export function AddProjectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const { canCreate, canEdit, canView } = usePermissions();
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

  // Check permissions on component mount
  useEffect(() => {
    const isEdit = !!projectId;

    if (isEdit && !canEdit("projects")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit projects",
        color: "danger",
      });
      router.push("/dashboard/projects");
      return;
    }

    if (!isEdit && !canCreate("projects")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to create projects",
        color: "danger",
      });
      router.push("/dashboard/projects");
      return;
    }
  }, [projectId, canCreate, canEdit, router]);

  // Show access denied if no view permission
  if (!canView("projects")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view projects.
          </p>
        </div>
      </div>
    );
  }

  // Customer Autocomplete logic (shared with AddProposal)
  const {
    customerOptions,
    emailInput,
    contactInput,
    selectedCustomer,
    isSearching,
    handleCustomerSelection,
    handleEmailInputChange,
    handleContactInputChange,
  } = useCustomerAutocomplete();

  // Fetch project data if editing
  useEffect(() => {
    if (projectId) {
      setIsLoading(true);
      apiClient.get(`/api/projects/${projectId}`)
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

            // Update input values for autocomplete fields
            // Use a separate effect to avoid infinite loops
            if (p.email || p.contactNumber) {
              // Use setTimeout to ensure this runs after the current render cycle
              setTimeout(() => {
                if (p.email) {
                  handleEmailInputChange(p.email, setFormData);
                }
                if (p.contactNumber) {
                  handleContactInputChange(p.contactNumber, setFormData);
                }
              }, 100);
            }
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
  }, [projectId]); // Keep only projectId as dependency

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

  // Handle size input with automatic X formatting
  const handleSizeChange = (e) => {
    let value = e.target.value;

    // Only allow numbers and X
    value = value.replace(/[^\dX]/g, '');

    // Ensure only one X exists
    const xCount = (value.match(/X/g) || []).length;
    if (xCount > 1) {
      // Keep only the first X
      const firstXIndex = value.indexOf('X');
      value = value.substring(0, firstXIndex + 1) + value.substring(firstXIndex + 1).replace(/X/g, '');
    }

    // Ensure X is not at the beginning or end
    if (value.startsWith('X')) {
      value = value.substring(1);
    }
    if (value.endsWith('X') && value.length > 1 && value.charAt(value.length - 2) === 'X') {
      value = value.substring(0, value.length - 1);
    }

    handleInputChange("size", value);
  };

  // Handle size keydown for space bar
  const handleSizeKeyDown = (e) => {
    if (e.key === ' ') {
      e.preventDefault();
      const currentValue = formData.size;

      // Only add X if there's no X already and there are digits
      if (!currentValue.includes('X') && currentValue.length > 0 && /^\d+$/.test(currentValue)) {
        handleInputChange("size", currentValue + 'X');
      }
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

    // Customer Name validation
    if (!formData.customerName.trim()) {
      newErrors.customerName = "Customer name is required";
    } else if (formData.customerName.trim().length < 2) {
      newErrors.customerName = "Customer name must be at least 2 characters";
    } else if (formData.customerName.trim().length > 100) {
      newErrors.customerName = "Customer name must not exceed 100 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.customerName.trim())) {
      newErrors.customerName = "Customer name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    // Contact Number validation
    if (!formData.contactNumber.trim()) {
      newErrors.contactNumber = "Contact number is required";
    } else if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
      newErrors.contactNumber = "Please enter a valid 10-digit mobile number";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    } else if (formData.email.trim().length > 254) {
      newErrors.email = "Email address is too long";
    }

    // Address validation
    if (!formData.address.addressLine.trim()) {
      newErrors["address.addressLine"] = "Address line is required";
    } else if (formData.address.addressLine.trim().length < 5) {
      newErrors["address.addressLine"] = "Address line must be at least 5 characters";
    } else if (formData.address.addressLine.trim().length > 200) {
      newErrors["address.addressLine"] = "Address line must not exceed 200 characters";
    }

    if (!formData.address.city.trim()) {
      newErrors["address.city"] = "City is required";
    } else if (formData.address.city.trim().length < 2) {
      newErrors["address.city"] = "City name must be at least 2 characters";
    } else if (formData.address.city.trim().length > 50) {
      newErrors["address.city"] = "City name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.address.city.trim())) {
      newErrors["address.city"] = "City name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.address.district.trim()) {
      newErrors["address.district"] = "District is required";
    } else if (formData.address.district.trim().length < 2) {
      newErrors["address.district"] = "District name must be at least 2 characters";
    } else if (formData.address.district.trim().length > 50) {
      newErrors["address.district"] = "District name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.address.district.trim())) {
      newErrors["address.district"] = "District name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.address.state.trim()) {
      newErrors["address.state"] = "State is required";
    } else if (formData.address.state.trim().length < 2) {
      newErrors["address.state"] = "State name must be at least 2 characters";
    } else if (formData.address.state.trim().length > 50) {
      newErrors["address.state"] = "State name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.address.state.trim())) {
      newErrors["address.state"] = "State name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.address.country.trim()) {
      newErrors["address.country"] = "Country is required";
    } else if (formData.address.country.trim().length < 2) {
      newErrors["address.country"] = "Country name must be at least 2 characters";
    } else if (formData.address.country.trim().length > 50) {
      newErrors["address.country"] = "Country name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.address.country.trim())) {
      newErrors["address.country"] = "Country name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.address.pincode.trim()) {
      newErrors["address.pincode"] = "Pincode is required";
    } else if (!/^[1-9][0-9]{5}$/.test(formData.address.pincode.trim())) {
      newErrors["address.pincode"] = "Please enter a valid 6-digit Indian pincode";
    }

    // Services validation
    if (!formData.services) {
      newErrors.services = "Service selection is required";
    }

    // Project Description validation
    if (!formData.projectDescription.trim()) {
      newErrors.projectDescription = "Project description is required";
    } else if (formData.projectDescription.trim().length < 10) {
      newErrors.projectDescription = "Project description must be at least 10 characters";
    } else if (formData.projectDescription.trim().length > 1000) {
      newErrors.projectDescription = "Project description must not exceed 1000 characters";
    }

    // Size validation
    if (!formData.size.trim()) {
      newErrors.size = "Size is required";
    } else if (!/^\d+X\d+$/.test(formData.size.trim())) {
      newErrors.size = "Please enter size in format: 1200X1000";
    }

    // Project Amount validation
    if (!formData.projectAmount || formData.projectAmount <= 0) {
      newErrors.projectAmount = "Project amount is required and must be positive";
    } else if (formData.projectAmount < 1000) {
      newErrors.projectAmount = "Project amount must be at least ₹1,000";
    } else if (formData.projectAmount > 100000000) {
      newErrors.projectAmount = "Project amount must not exceed ₹10 crores";
    }

    // Project Date validation
    if (!formData.projectDate) {
      newErrors.projectDate = "Project date is required";
    } else {
      const selectedDate = new Date(formData.projectDate);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate < oneYearAgo) {
        newErrors.projectDate = "Project date cannot be more than 1 year in the past";
      } else if (selectedDate > oneYearFromNow) {
        newErrors.projectDate = "Project date cannot be more than 1 year in the future";
      }
    }

    // Comment validation (optional but if provided, validate length)
    if (formData.comment && formData.comment.trim().length > 500) {
      newErrors.comment = "Comment must not exceed 500 characters";
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
        response = await apiClient.put(`/api/projects/${projectId}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await apiClient.post(`/api/projects`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
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
      console.log(error.response.data.message);
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
              <Autocomplete
                label=""
                placeholder="Enter contact number"
                inputValue={contactInput}
                onInputChange={(value) => {
                  handleContactInputChange(value, setFormData);
                  // Clear error when user starts typing
                  if (errors.contactNumber) {
                    setErrors((prev) => ({ ...prev, contactNumber: "" }));
                  }
                }}
                selectedKey={selectedCustomer?._id}
                onSelectionChange={(key) =>
                  handleCustomerSelection(key, setFormData)
                }
                items={customerOptions}
                allowsCustomValue
                isRequired
                fullWidth
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[200px]",
                  selectorButton: "text-default-500",
                }}
                inputProps={{
                  classNames: {
                    inputWrapper: "h-[50px] border-[#E0E5F2]",
                  },
                }}
                size="lg"
                radius="sm"
                variant="bordered"
                isLoading={isSearching}
                menuTrigger="input"
                isInvalid={!!errors.contactNumber}
                errorMessage={errors.contactNumber}
              >
                {(item) => (
                  <AutocompleteItem
                    key={item._id}
                    textValue={item.contactNumber}
                  >
                    <div className="flex flex-col">
                      <span className="text-small font-medium">
                        {item.contactNumber}
                      </span>
                      <span className="text-tiny text-default-400">
                        {item.customerName} • {item.email}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email Id *</label>
              <Autocomplete
                label=""
                placeholder="Enter email address"
                inputValue={emailInput}
                onInputChange={(value) => {
                  handleEmailInputChange(value, setFormData);
                  // Clear error when user starts typing
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                selectedKey={selectedCustomer?._id}
                onSelectionChange={(key) =>
                  handleCustomerSelection(key, setFormData)
                }
                items={customerOptions}
                allowsCustomValue
                isRequired
                fullWidth
                className="w-full"
                classNames={{
                  base: "w-full",
                  listboxWrapper: "max-h-[200px]",
                  selectorButton: "text-default-500",
                }}
                inputProps={{
                  classNames: {
                    inputWrapper: "h-[50px] border-[#E0E5F2]",
                  },
                }}
                size="lg"
                radius="sm"
                variant="bordered"
                isLoading={isSearching}
                menuTrigger="input"
                isInvalid={!!errors.email}
                errorMessage={errors.email}
              >
                {(item) => (
                  <AutocompleteItem key={item._id} textValue={item.email}>
                    <div className="flex flex-col">
                      <span className="text-small font-medium">
                        {item.email}
                      </span>
                      <span className="text-tiny text-default-400">
                        {item.customerName} • {item.contactNumber}
                      </span>
                    </div>
                  </AutocompleteItem>
                )}
              </Autocomplete>
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
                isInvalid={!!errors.projectDate}
                errorMessage={errors.projectDate}
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
                isInvalid={!!errors["address.country"]}
                errorMessage={errors["address.country"]}
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
                  placeholder="1200X1000"
                  radius="sm"
                  variant="bordered"
                  className="w-full rounded-r-none"
                  value={formData.size}
                  onChange={handleSizeChange}
                  onKeyDown={handleSizeKeyDown}
                  isInvalid={!!errors.size}
                  errorMessage={errors.size}
                  endContent={
                    <span className="text-xs text-[#999999] border-[#00000080] border-l-medium px-3">
                      Size
                    </span>
                  }
                />
              </div>
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
                isInvalid={!!errors.comment}
                errorMessage={errors.comment}
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
