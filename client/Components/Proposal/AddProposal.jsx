"use client";
import { Divider } from "@heroui/divider";
import { Card } from "@heroui/card";
import { Textarea } from "@heroui/input";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import Link from "next/link";
import { StatusSelect } from "./StatusSelect.jsx";
import { ServicesSelect } from "./ServiceSelect.jsx";
import DashboaardHeader from "../header/DashboardHeader.jsx";
import { Upload, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import apiClient from "../../lib/axios";
import { useRouter, useSearchParams } from "next/navigation";
import { addToast } from "@heroui/toast";
import { usePermissions } from "../../lib/utils";

export function AddProposalPage({ isEdit = false, proposalId = null }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { canCreate, canEdit, canView } = usePermissions();
  
  // Get return URL from search params or default to proposal page
  const returnUrl = searchParams.get('returnUrl') || '/dashboard/proposal';
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]); // For new uploads (multiple)
  const [removedAttachments, setRemovedAttachments] = useState([]); // For removing existing attachments (edit mode)
  const [amountOptions, setAmountOptions] = useState([]);
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    addressLine: "",
    city: "",
    district: "",
    state: "",
    country: "India",
    pincode: "",
    services: "",
    projectDescription: "",
    projectAmount: "",
    size: "",
    status: "Warm",
    comment: "",
    date: new Date().toISOString().split("T")[0],
    attachments: [],
  });
  const [errors, setErrors] = useState({});

  // Autocomplete states for customer search
  const [customerOptions, setCustomerOptions] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce function for API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch customers by email or contact (suggest by either field, deduplicate, prioritize exact matches)
  const fetchCustomers = async (search) => {
    if (!search || search.length < 2) {
      setCustomerOptions([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiClient.get(`/api/customers?search=${encodeURIComponent(search)}`);

      let customers = response.data.data?.customers || [];

      // Filter for matches in either field
      let filtered = customers.filter(
        (c) =>
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.contactNumber && c.contactNumber.includes(search))
      );

      // Prioritize exact matches
      filtered = [
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() === search.toLowerCase() ||
            c.contactNumber === search
        ),
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() !== search.toLowerCase() &&
            c.contactNumber !== search
        ),
      ];

      // Deduplicate by _id
      const seen = new Set();
      filtered = filtered.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });

      setCustomerOptions(filtered);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomerOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced version of fetchCustomers
  const debouncedFetchCustomers = debounce(fetchCustomers, 300);

  // When a customer is selected, autofill the form
  const autofillCustomer = (customer) => {
    if (!customer) return;

    setFormData((prev) => ({
      ...prev,
      customerName: customer.customerName || "",
      contactNumber: customer.contactNumber || "",
      email: customer.email || "",
      addressLine: customer.address?.addressLine || "",
      city: customer.address?.city || "",
      district: customer.address?.district || "",
      state: customer.address?.state || "",
      country: customer.address?.country || "India",
      pincode: customer.address?.pincode || "",
    }));

    // Update input values
    setEmailInput(customer.email || "");
    setContactInput(customer.contactNumber || "");
  };

  // Handle customer selection from autocomplete
  const handleCustomerSelection = (key) => {
    if (!key) {
      setSelectedCustomer(null);
      return;
    }

    const customer = customerOptions.find((c) => c._id === key);
    if (customer) {
      setSelectedCustomer(customer);
      autofillCustomer(customer);
    }
  };

  // Handle manual input changes
  const handleEmailInputChange = (value) => {
    setEmailInput(value);
    setFormData((prev) => ({ ...prev, email: value }));

    // Clear selection if input doesn't match selected customer
    if (selectedCustomer && selectedCustomer.email !== value) {
      setSelectedCustomer(null);
    }

    // Search for customers
    debouncedFetchCustomers(value);
  };

  const handleContactInputChange = (value) => {
    setContactInput(value);
    setFormData((prev) => ({ ...prev, contactNumber: value }));

    // Clear selection if input doesn't match selected customer
    if (selectedCustomer && selectedCustomer.contactNumber !== value) {
      setSelectedCustomer(null);
    }

    // Search for customers
    debouncedFetchCustomers(value);
  };

  // Fetch proposal data for edit mode
  useEffect(() => {
    if (isEdit && proposalId) {
      fetchProposalData();
    }
  }, [isEdit, proposalId]);

  const fetchProposalData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/proposals/${proposalId}`);
      if (response.data.success) {
        const proposal = response.data.data.proposal;
        setFormData((prev) => ({
          ...prev,
          customerName: proposal.customerName || "",
          contactNumber: proposal.contactNumber || "",
          email: proposal.email || "",
          addressLine: proposal.address?.addressLine || "",
          city: proposal.address?.city || "",
          district: proposal.address?.district || "",
          state: proposal.address?.state || "",
          country: proposal.address?.country || "India",
          pincode: proposal.address?.pincode || "",
          services: proposal.services || "",
          projectDescription: proposal.projectDescription || "",
          projectAmount: proposal.projectAmount || "",
          size: proposal.size || "",
          status: proposal.status || "Warm",
          comment: proposal.comment || "",
          date: proposal.date
            ? new Date(proposal.date).toISOString().split("T")[0]
            : "",
          attachments: Array.isArray(proposal.attachments)
            ? proposal.attachments
            : [],
        }));

        // Update input values for edit mode
        setEmailInput(proposal.email || "");
        setContactInput(proposal.contactNumber || "");

        if (proposal.amountOptions) {
          setAmountOptions(proposal.amountOptions);
        }
      }
    } catch (error) {
      console.error("Error fetching proposal:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch proposal data",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

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
      newErrors.contactNumber = "Please enter a valid 10-digit Indian mobile number";
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
    if (!formData.addressLine.trim()) {
      newErrors.addressLine = "Address line is required";
    } else if (formData.addressLine.trim().length < 5) {
      newErrors.addressLine = "Address line must be at least 5 characters";
    } else if (formData.addressLine.trim().length > 200) {
      newErrors.addressLine = "Address line must not exceed 200 characters";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    } else if (formData.city.trim().length < 2) {
      newErrors.city = "City name must be at least 2 characters";
    } else if (formData.city.trim().length > 50) {
      newErrors.city = "City name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.city.trim())) {
      newErrors.city = "City name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.district.trim()) {
      newErrors.district = "District is required";
    } else if (formData.district.trim().length < 2) {
      newErrors.district = "District name must be at least 2 characters";
    } else if (formData.district.trim().length > 50) {
      newErrors.district = "District name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.district.trim())) {
      newErrors.district = "District name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    } else if (formData.state.trim().length < 2) {
      newErrors.state = "State name must be at least 2 characters";
    } else if (formData.state.trim().length > 50) {
      newErrors.state = "State name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.state.trim())) {
      newErrors.state = "State name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    } else if (formData.country.trim().length < 2) {
      newErrors.country = "Country name must be at least 2 characters";
    } else if (formData.country.trim().length > 50) {
      newErrors.country = "Country name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.country.trim())) {
      newErrors.country = "Country name can only contain letters, spaces, dots, hyphens, and apostrophes";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode.trim())) {
      newErrors.pincode = "Please enter a valid 6-digit Indian pincode";
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

    // Date validation
    if (!formData.date) {
      newErrors.date = "Date is required";
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (selectedDate < oneYearAgo) {
        newErrors.date = "Date cannot be more than 1 year in the past";
      } else if (selectedDate > oneYearFromNow) {
        newErrors.date = "Date cannot be more than 1 year in the future";
      }
    }

    // Comment validation (optional but if provided, validate length)
    if (formData.comment && formData.comment.trim().length > 500) {
      newErrors.comment = "Comment must not exceed 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle file selection (multiple)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    // Validate each file
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
          title: "Invalid File Type",
          description: `File ${file.name} is not a supported type`,
          color: "danger",
        });
        return false;
      }
      if (file.size > maxSize) {
        addToast({
          title: "File Too Large",
          description: `File ${file.name} exceeds 10MB limit`,
          color: "danger",
        });
        return false;
      }
      return true;
    });
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    e.target.value = null;
  };

  // Remove a new file before upload
  const handleRemoveSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an existing attachment (edit mode)
  const handleRemoveExistingAttachment = (index) => {
    if (!formData.attachments || !formData.attachments[index]) return;
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

  // Handle form submission
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

    setLoading(true);

    try {
      // Add current project amount to amountOptions if not already present
      const currentAmountFormatted = `₹${parseInt(
        formData.projectAmount
      ).toLocaleString("en-IN")}`;
      if (!amountOptions.includes(currentAmountFormatted)) {
        setAmountOptions((prev) => [...prev, currentAmountFormatted]);
      }

      // Create FormData for file upload
      const submitData = new FormData();

      // Add all form fields
      submitData.append("customerName", formData.customerName);
      submitData.append("contactNumber", formData.contactNumber);
      submitData.append("email", formData.email);
      submitData.append(
        "address",
        JSON.stringify({
          addressLine: formData.addressLine,
          city: formData.city,
          district: formData.district,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        })
      );
      submitData.append("services", formData.services);
      submitData.append("projectDescription", formData.projectDescription);
      submitData.append("projectAmount", formData.projectAmount);
      submitData.append("size", formData.size);
      submitData.append("status", formData.status);
      submitData.append("comment", formData.comment);
      submitData.append("date", formData.date);

      // Include updated amountOptions with the current amount
      const updatedAmountOptions = amountOptions.includes(
        currentAmountFormatted
      )
        ? amountOptions
        : [...amountOptions, currentAmountFormatted];
      submitData.append("amountOptions", JSON.stringify(updatedAmountOptions));

      // Add files if selected (use correct field name)
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          submitData.append("attachments", file);
        });
      }

      // Add removed attachments for edit mode (send as filenames, not objects, and filter out nulls)
      if (isEdit && removedAttachments.length > 0) {
        const filenames = removedAttachments
          .map(
            (att) => att && (att.filename || (att._doc && att._doc.filename))
          )
          .filter(Boolean); // Remove null/undefined
        if (filenames.length > 0) {
          submitData.append("removeAttachments", JSON.stringify(filenames));
        }
      }

      // Make API call
      let response;
      if (isEdit) {
        response = await apiClient.put(`/api/proposals/${proposalId}`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await apiClient.post(`/api/proposals`, submitData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        let message = isEdit
          ? "Proposal updated successfully!"
          : "Proposal created successfully!";

        // Check if project was automatically created
        if (response.data.data.project) {
          message +=
            " A project has been automatically created from this confirmed proposal.";
        }

        // Check if customer was created
        if (response.data.data.customer) {
          message += " Customer information has been saved.";
        }

        addToast({
          title: "Success",
          description: message,
          color: "success",
        });
        if (isEdit) {
          router.push(returnUrl);
        } else {
          router.push("/dashboard/proposal");
        }
      }
    } catch (error) {
      console.error("Error creating proposal:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create proposal",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Check permissions on component mount
  useEffect(() => {
    if (isEdit && !canEdit("proposal")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit proposals",
        color: "danger",
      });
      router.push("/dashboard/proposal");
      return;
    }

    if (!isEdit && !canCreate("proposal")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to create proposals",
        color: "danger",
      });
      router.push("/dashboard/proposal");
      return;
    }
  }, [isEdit, canCreate, canEdit, router]);

  // Show access denied if no view permission
  if (!canView("proposal")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Access Denied
          </h3>
          <p className="text-gray-500">
            You don't have permission to view proposals.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="mb-6">
        <DashboaardHeader title={isEdit ? "Edit Proposal" : "Add Proposal"} />
      </div>

      <Card className="p-6" shadow="sm">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <div>
              <label className="block text-gray-700 mb-2">
                Contact Number *
              </label>
              <Autocomplete
                label=""
                placeholder="Enter contact number"
                inputValue={contactInput}
                onInputChange={(value) => {
                  handleContactInputChange(value);
                  // Clear error when user starts typing
                  if (errors.contactNumber) {
                    setErrors((prev) => ({ ...prev, contactNumber: "" }));
                  }
                }}
                selectedKey={selectedCustomer?._id}
                onSelectionChange={handleCustomerSelection}
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
                  handleEmailInputChange(value);
                  // Clear error when user starts typing
                  if (errors.email) {
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }
                }}
                selectedKey={selectedCustomer?._id}
                onSelectionChange={handleCustomerSelection}
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
                placeholder="Date"
                type="date"
                radius="sm"
                variant="bordered"
                className="w-full"
                classNames={{
                  inputWrapper: " h-[50px] border-[#E0E5F2]",
                }}
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                isInvalid={!!errors.date}
                errorMessage={errors.date}
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 mb-2">Address *</label>
            </div>

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
                type="number"
                isInvalid={!!errors.pincode}
                errorMessage={errors.pincode}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Services *</label>
              <ServicesSelect
                value={formData.services}
                onChange={(value) => handleInputChange("services", value)}
                isInvalid={!!errors.services}
                errorMessage={errors.services}
                required
                aria-label="Select service"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <StatusSelect
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
                isInvalid={!!errors.status}
                errorMessage={errors.status}
                required
                aria-label="Select status"
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Project Amount *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Select
                    placeholder="Select  amount"
                    radius="sm"
                    variant="bordered"
                    className="w-full"
                    classNames={{
                      trigger: " h-[50px] border-[#E0E5F2]",
                    }}
                    selectedKeys={
                      formData.projectAmount
                        ? [`₹${parseInt(formData.projectAmount).toLocaleString(
                          "en-IN"
                        )}`]
                        : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedAmount = Array.from(keys)[0];
                      if (selectedAmount) {
                        const numericValue = selectedAmount
                          .replace(/[₹,]/g, "")
                          .trim();
                        handleInputChange("projectAmount", numericValue);
                      }
                    }}
                    renderValue={() =>
                      formData.projectAmount
                        ? `₹${parseInt(formData.projectAmount).toLocaleString(
                          "en-IN"
                        )}`
                        : ""
                    }
                  >
                    {amountOptions.map((amount) => (
                      <SelectItem key={amount} value={amount}>
                        {amount}
                      </SelectItem>
                    ))}
                  </Select>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Enter Amount"
                      type="number"
                      radius="sm"
                      variant="bordered"
                      size="sm"
                      className="flex-1"
                      classNames={{
                        inputWrapper: " h-[50px] border-[#E0E5F2]",
                      }}
                      value={formData.projectAmount}
                      onChange={(e) =>
                        handleInputChange("projectAmount", e.target.value)
                      }
                      isInvalid={!!errors.projectAmount}
                      errorMessage={errors.projectAmount}
                    />
                    <Button
                      size="lg"
                      radius="sm"
                      color="primary"
                      variant="bordered"
                      onClick={() => {
                        if (formData.projectAmount) {
                          const newAmount = `₹${parseInt(
                            formData.projectAmount
                          ).toLocaleString("en-IN")}`;
                          if (!amountOptions.includes(newAmount)) {
                            setAmountOptions((prev) => [...prev, newAmount]);
                          }
                          // Clear the input after adding
                          handleInputChange("projectAmount", "");
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>

                </div>
                <div>
                  <label className="block text-gray-700 mb-2">Size *</label>
                  <div className="flex">
                    <Input
                      placeholder="1200X1000"
                      radius="sm"
                      variant="bordered"
                      className="w-full rounded-r-none"
                      classNames={{
                        inputWrapper: " h-[50px] border-[#E0E5F2] ",
                      }}
                      value={formData.size}
                      onChange={handleSizeChange}
                      onKeyDown={handleSizeKeyDown}
                      isInvalid={!!errors.size}
                      errorMessage={errors.size}
                      required
                      endContent={
                        <span className="text-xs text-[#999999] border-[#00000080] border-l-medium px-3">
                          Size
                        </span>
                      }
                    />
                  </div>
                </div>
              </div>

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
                required
              />
            </div>

            <div className="col-span-1 md:col-span-2 grid gap-y-4">
              <div className="flex items-center gap-4">
                <label className="block text-gray-700 mb-2">
                  Proposal Attachments
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

              <div className="flex flex-wrap gap-2 mt-2">
                {Array.isArray(formData.attachments) &&
                  formData.attachments.map((att, idx) => (
                    <div
                      key={att._id || att.url}
                      className="flex items-center bg-gray-100 rounded px-2 py-1"
                    >
                      <a
                        href={
                          att.url && att.url.startsWith("http")
                            ? att.url
                            : att.attachmentUrl || `/${att.url || att.filename}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline max-w-xs truncate"
                        download={att.originalName || true}
                        title={att.originalName || "Attachment"}
                      >
                        {att.originalName || att.filename || "Attachment"}
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
                      *Attach proposal docs/pdf/jpeg/png
                    </span>
                  )}
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-end gap-4">
            <Link href={returnUrl}>
              <Button
                variant="bordered"
                radius="full"
                className="px-8 text-primary"
                isDisabled={loading}
              >
                Cancel
              </Button>
            </Link>

            <Button
              color="primary"
              radius="full"
              className="px-8"
              type="submit"
              isLoading={loading}
              isDisabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}