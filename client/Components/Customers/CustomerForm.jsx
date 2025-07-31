"use client";
import { useState, useEffect } from "react";
import { Card } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import { Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import DashboardHeader from "../header/DashboardHeader";
import { usePermissions } from "../../lib/utils";
import axios from "axios";
export function CustomerForm({ isEdit = false, customerId = null }) {
  const router = useRouter();
  const { canCreate, canEdit } = usePermissions();
  const [loading, setLoading] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    addressLine: "",
    city: "",
    district: "",
    state: "",
    country: "",
    pincode: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [duplicateWarnings, setDuplicateWarnings] = useState({});

  // Fetch customer data for edit mode
  useEffect(() => {
    if (isEdit && customerId) {
      fetchCustomerData();
    }
  }, [isEdit, customerId]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (window.duplicateCheckTimeout) {
        clearTimeout(window.duplicateCheckTimeout);
      }
    };
  }, []);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/customers/${customerId}`);

      if (response.data.success) {
        const customer = response.data.data.customer;
        setFormData({
          customerName: customer.customerName || "",
          contactNumber: customer.contactNumber || "",
          email: customer.email || "",
          addressLine: customer.address?.addressLine || "",
          city: customer.address?.city || "",
          district: customer.address?.district || "",
          state: customer.address?.state || "",
          country: customer.address?.country || "",
          pincode: customer.address?.pincode || "",
          notes: customer.notes || "",
        });
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch customer data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check for duplicate customers in projects
  const checkDuplicateInProjects = async (contactNumber, email) => {
    try {
      setCheckingDuplicates(true);
      const duplicateWarnings = {};

      // Check for contact number duplicates in projects
      if (contactNumber?.trim()) {
        const contactResponse = await apiClient.get(`/api/projects?search=${encodeURIComponent(contactNumber)}&limit=10`);

        if (
          contactResponse.data.success &&
          contactResponse.data.data.length > 0
        ) {
          const matchingProjects = contactResponse.data.data.filter(
            (project) => project.contactNumber === contactNumber
          );

          if (matchingProjects.length > 0) {
            duplicateWarnings.contactNumber = `Contact number exists in ${matchingProjects.length
              } project(s): ${matchingProjects
                .map((p) => p.customerName)
                .join(", ")}`;
          }
        }
      }

      // Check for email duplicates in projects
      if (email?.trim()) {
        const emailResponse = await apiClient.get(`/api/projects?search=${encodeURIComponent(email)}&limit=10`);

        if (emailResponse.data.success && emailResponse.data.data.length > 0) {
          const matchingProjects = emailResponse.data.data.filter(
            (project) => project.email?.toLowerCase() === email.toLowerCase()
          );

          if (matchingProjects.length > 0) {
            duplicateWarnings.email = `Email exists in ${matchingProjects.length
              } project(s): ${matchingProjects
                .map((p) => p.customerName)
                .join(", ")}`;
          }
        }
      }

      setDuplicateWarnings(duplicateWarnings);
      return duplicateWarnings;
    } catch (error) {
      console.error("Error checking duplicates:", error);
      return {};
    } finally {
      setCheckingDuplicates(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Clear duplicate warning when user changes the field
    if (duplicateWarnings[field]) {
      setDuplicateWarnings((prev) => ({
        ...prev,
        [field]: "",
      }));
    }

    // Check for duplicates when contact number or email changes (with debounce)
    if (field === "contactNumber" || field === "email") {
      // Clear existing timeout
      if (window.duplicateCheckTimeout) {
        clearTimeout(window.duplicateCheckTimeout);
      }

      // Set new timeout for duplicate check
      window.duplicateCheckTimeout = setTimeout(() => {
        if (field === "contactNumber" && value.trim()) {
          checkDuplicateInProjects(value, formData.email);
        } else if (field === "email" && value.trim()) {
          checkDuplicateInProjects(formData.contactNumber, value);
        }
      }, 1000); // 1 second debounce
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
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = "Address line is required";
    }
    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    }
    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }
    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check permissions before submitting
    if (isEdit) {
      if (!canEdit("customers")) {
        addToast({
          title: "Access Denied",
          description: "You don't have permission to edit customers",
          color: "danger",
        });
        return;
      }
    } else {
      if (!canCreate("customers")) {
        addToast({
          title: "Access Denied",
          description: "You don't have permission to create customers",
          color: "danger",
        });
        return;
      }
    }

    if (!validateForm()) {
      return;
    }

    // Check for duplicates one more time before submitting
    const duplicates = await checkDuplicateInProjects(
      formData.contactNumber,
      formData.email
    );

    // Show confirmation dialog if duplicates found
    if (Object.keys(duplicates).length > 0) {
      const duplicateMessages = Object.values(duplicates).join("\n");
      const confirmMessage = `Warning: Potential duplicates found:\n\n${duplicateMessages}\n\nDo you want to continue anyway?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }
    }

    setLoading(true);

    try {
      // Prepare data for API
      const submitData = {
        customerName: formData.customerName,
        contactNumber: formData.contactNumber,
        email: formData.email,
        address: {
          addressLine: formData.addressLine,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        },
        notes: formData.notes,
      };
      if (!isEdit && Object.keys(duplicates).length > 0) {
        addToast({
          title: "Error",
          description: "Customer already exists",
          color: "danger",
        });
        return;
      }
      // Make API call
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${customerId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/customers `;

      const method =
        (isEdit && customerId) || Object.keys(duplicates).length > 0
          ? "put"
          : "post";

      const response = await axios[method](url, submitData, {
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });

      if (response.data.success) {
        addToast({
          title: "Success",
          description: isEdit
            ? "Customer updated successfully!"
            : "Customer created successfully!",
          color: "success",
        });
        router.push("/dashboard/customers");
      }
    } catch (error) {
      console.error("Error saving customer:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save customer",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6">
      <div className="mb-6">
        <DashboardHeader title={isEdit ? "Edit Customer" : "Add Customer"} />
      </div>

      <Card className="p-6" shadow="sm">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Name */}
            <div>
              <label className="block text-gray-700 mb-2">
                Customer Name *
              </label>
              <Input
                placeholder="Customer Name"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                isInvalid={!!errors.customerName}
                errorMessage={errors.customerName}
                required
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-gray-700 mb-2">
                Contact Number *
              </label>
              <Input
                placeholder="Contact Number"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
                isInvalid={!!errors.contactNumber}
                errorMessage={errors.contactNumber}
                required
              />
              {checkingDuplicates && (
                <div className="text-blue-500 text-sm mt-1">
                  Checking for duplicates...
                </div>
              )}
              {duplicateWarnings.contactNumber && (
                <div className="text-orange-500 text-sm mt-1 p-2 bg-orange-50 rounded">
                  ⚠️ {duplicateWarnings.contactNumber}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-700 mb-2">Email *</label>
              <Input
                placeholder="Email"
                type="email"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                isInvalid={!!errors.email}
                errorMessage={errors.email}
                required
              />
              {checkingDuplicates && (
                <div className="text-blue-500 text-sm mt-1">
                  Checking for duplicates...
                </div>
              )}
              {duplicateWarnings.email && (
                <div className="text-orange-500 text-sm mt-1 p-2 bg-orange-50 rounded">
                  ⚠️ {duplicateWarnings.email}
                </div>
              )}
            </div>

            {/* Address Section Header */}
            <div className="col-span-1 md:col-span-2">
              <Divider className="my-4" />
              <label className="block text-gray-700 mb-4 text-lg font-semibold">
                Address Information *
              </label>
            </div>

            {/* Address Line */}
            <div>
              <Input
                placeholder="Address Line"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.addressLine}
                onChange={(e) =>
                  handleInputChange("addressLine", e.target.value)
                }
                isInvalid={!!errors.addressLine}
                errorMessage={errors.addressLine}
                required
              />
            </div>

            {/* City */}
            <div>
              <Input
                placeholder="City/Town/Village"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                isInvalid={!!errors.city}
                errorMessage={errors.city}
                required
              />
            </div>

            {/* District */}
            <div>
              <Input
                placeholder="District"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                isInvalid={!!errors.district}
                errorMessage={errors.district}
                required
              />
            </div>

            {/* State */}
            <div>
              <Input
                placeholder="State"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                isInvalid={!!errors.state}
                errorMessage={errors.state}
                required
              />
            </div>

            {/* Country */}
            <div>
              <Input
                placeholder="Country"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                isInvalid={!!errors.country}
                errorMessage={errors.country}
                required
              />
            </div>

            {/* Pincode */}
            <div>
              <Input
                placeholder="Pincode"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                isInvalid={!!errors.pincode}
                errorMessage={errors.pincode}
                required
              />
            </div>

            {/* Notes */}
            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 mb-2">Notes</label>
              <Textarea
                placeholder="Additional notes about the customer"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                rows={4}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
              />
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-end gap-4">
            <Button
              as={Link}
              href="/dashboard/customers"
              variant="bordered"
              radius="full"
              className="px-8"
            >
              Cancel
            </Button>

            <Button
              color="primary"
              radius="full"
              className="px-8"
              type="submit"
              isLoading={loading}
              disabled={loading || checkingDuplicates}
              startContent={!loading && <Save />}
            >
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
