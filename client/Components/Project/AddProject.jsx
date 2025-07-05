"use client";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { ChevronDown, Calendar, Upload } from "lucide-react";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link.js";
import { ProjectStatusSelect } from "./ProjectStatusSelect.jsx";
import { ServicesSelect } from "../Proposal/ServiceSelect.jsx";
import DashboardHeader from "../header/DashboardHeader.jsx";

export function AddProjectPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
  });

  const [errors, setErrors] = useState({});

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

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        addToast({
          title: "Invalid file type",
          description: "Please select a PDF, JPEG, PNG, DOC, or DOCX file",
          color: "danger",
        });
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          title: "File too large",
          description: "File size must be less than 10MB",
          color: "danger",
        });
        return;
      }

      setSelectedFile(file);
    }
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
        } else {
          submitData.append(key, formData[key]);
        }
      });

      // Append file if selected
      if (selectedFile) {
        submitData.append("attachment", selectedFile);
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
        submitData,
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
          description: "Project created successfully",
          color: "success",
        });

        router.push("/dashboard/projects");
      } else {
        throw new Error(response.data.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Create project error:", error);

      addToast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to create project",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <DashboardHeader title="Add Project" className="mb-4" />
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
                  Project Attachment
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
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
              <span className="text-gray-500 text-xs justify-center">
                {selectedFile
                  ? selectedFile.name
                  : "*Attach project docs/pdf/jpeg/png"}
              </span>
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
