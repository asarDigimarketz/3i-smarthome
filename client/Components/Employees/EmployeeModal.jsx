import { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { Input, Textarea } from "@heroui/input";
import { Avatar } from "@heroui/avatar";
import { DatePicker } from "@heroui/date-picker";
import { addToast } from "@heroui/toast";
import { Plus, Upload, X } from "lucide-react";
import { parseDate } from "@internationalized/date";
import { usePermissions } from "../../lib/utils";
import apiClient from "../../lib/axios";

export const EmployeeModal = ({
  isOpen,
  onOpenChange,
  employeeData,
  onSuccess,
}) => {
  const isEditing = !!employeeData;
  const { canCreate, canEdit, canView } = usePermissions();
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    gender: "",
    dateOfBirth: null,
    dateOfHiring: null,
    role: "",
    department: "",
    status: "active",
    notes: "",
    address: {
      addressLine: "",
      city: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },
  });

  const [roles, setRoles] = useState([]);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [documents, setDocuments] = useState([]); // new files
  const [removedDocuments, setRemovedDocuments] = useState([]); // removed existing files
  const [existingDocuments, setExistingDocuments] = useState([]); // existing files (edit mode)
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const response = await apiClient.get(`/api/rolesAndPermission`);

      if (response.data.success) {
        setRoles(response.data.roles);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchRoles();

      // Reset form when modal opens
      if (isEditing && employeeData) {
        const emp = employeeData.originalData;
        setFormData({
          firstName: emp.firstName || "",
          lastName: emp.lastName || "",
          email: emp.email || "",
          mobileNo: emp.mobileNo || "",
          gender: emp.gender || "",
          dateOfBirth: emp.dateOfBirth
            ? parseDate(emp.dateOfBirth.split("T")[0])
            : null,
          dateOfHiring: emp.dateOfHiring
            ? parseDate(emp.dateOfHiring.split("T")[0])
            : null,
          role: emp.role?._id || "",
          department: emp.department || "",
          status: emp.status || "active",
          notes: emp.notes || "",
          address: {
            addressLine: emp.address?.addressLine || "",
            city: emp.address?.city || "",
            district: emp.address?.district || "",
            state: emp.address?.state || "",
            country: emp.address?.country || "",
            pincode: emp.address?.pincode || "",
          },
        });
        setAvatarPreview(emp.avatar);
        setExistingDocuments(emp.documents || []); // <-- use documents
      } else {
        // Reset form for new employee
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          mobileNo: "",
          gender: "",
          dateOfBirth: null,
          dateOfHiring: null,
          role: "",
          department: "",
          status: "active",
          notes: "",
          address: {
            addressLine: "",
            city: "",
            district: "",
            state: "",
            country: "",
            pincode: "",
          },
        });
        setAvatarPreview(null);
        setExistingDocuments([]); // <-- use documents
      }

      setAvatar(null);
      setDocuments([]);
      setErrors({});
    }
  }, [isOpen, isEditing, employeeData]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields validation
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.mobileNo.trim())
      newErrors.mobileNo = "Mobile number is required";
    if (!formData.gender) newErrors.gender = "Gender is required";
    if (!formData.dateOfBirth)
      newErrors.dateOfBirth = "Date of birth is required";
    if (!formData.dateOfHiring)
      newErrors.dateOfHiring = "Date of hiring is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.department) newErrors.department = "Department is required";

    // Address validation
    if (!formData.address.addressLine.trim())
      newErrors.addressLine = "Address is required";
    if (!formData.address.city.trim()) newErrors.city = "City is required";
    if (!formData.address.state.trim()) newErrors.state = "State is required";
    if (!formData.address.country.trim())
      newErrors.country = "Country is required";
    if (!formData.address.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile number validation (10 digits)
    const mobileRegex = /^\d{10}$/;
    if (formData.mobileNo && !mobileRegex.test(formData.mobileNo)) {
      newErrors.mobileNo = "Mobile number must be 10 digits";
    }

    // Pincode validation (6 digits)
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    if (formData.address.pincode && !pincodeRegex.test(formData.address.pincode)) {
      newErrors.pincode = "Please enter a valid 6-digit Indian pincode";
    }

    // Age validation (minimum 18 years)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth.toString());
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 18) {
        newErrors.dateOfBirth = "Employee must be at least 18 years old";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        [field]: undefined,
      }));
    }
  };

  const handleAddressChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        addToast({
          title: "File too large",
          description: "Avatar file size should be less than 5MB",
          color: "danger",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        addToast({
          title: "Invalid file type",
          description: "Please upload an image file",
          color: "danger",
        });
        return;
      }

      setAvatar(file);
      const reader = new FileReader();
      reader.onload = (e) => setAvatarPreview(e.target.result);
      reader.readAsDataURL(file);
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
          description: `${file.name} is not a supported file type`,
          color: "danger",
        });
        return false;
      }
      if (file.size > maxSize) {
        addToast({
          title: "File too large",
          description: `${file.name} exceeds 10MB size limit`,
          color: "danger",
        });
        return false;
      }
      return true;
    });
    setDocuments((prev) => [...prev, ...validFiles]);
    event.target.value = null;
  };

  // Remove a new file before upload
  const handleRemoveSelectedFile = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Remove an existing document (edit mode)
  const handleRemoveExistingDocument = (index) => {
    // Always send the full url for removed documents
    const doc = existingDocuments[index];
    setRemovedDocuments((prev) => [
      ...prev,
      doc.url ? doc.url : doc, // fallback to doc if url missing
    ]);
    setExistingDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle form submission with permission check
  const handleSubmit = async (e) => {
    // e.preventDefault();
    if (isEditing && !canEdit("employees")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit employees",
        color: "danger",
      });
      return;
    }

    if (!isEditing && !canCreate("employees")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to create employees",
        color: "danger",
      });
      return;
    }

    if (!validateForm()) {
      addToast({
        title: "Validation Error",
        description: "Please fix the errors in the form",
        color: "danger",
      });
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();

      // Basic employee data
      formDataToSend.append("firstName", formData.firstName);
      formDataToSend.append("lastName", formData.lastName);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("mobileNo", formData.mobileNo);
      formDataToSend.append("gender", formData.gender);
      formDataToSend.append("dateOfBirth", formData.dateOfBirth.toString());
      formDataToSend.append("dateOfHiring", formData.dateOfHiring.toString());
      formDataToSend.append("status", formData.status);
      formDataToSend.append("notes", formData.notes);

      // Address data - append each field individually
      formDataToSend.append(
        "address[addressLine]",
        formData.address.addressLine
      );
      formDataToSend.append("address[city]", formData.address.city);
      formDataToSend.append("address[district]", formData.address.district);
      formDataToSend.append("address[state]", formData.address.state);
      formDataToSend.append("address[country]", formData.address.country);
      formDataToSend.append("address[pincode]", formData.address.pincode);

      // Role data
      const selectedRole = roles.find((r) => r._id === formData.role);
      if (selectedRole) {
        formDataToSend.append(
          "role",
          JSON.stringify({
            _id: selectedRole._id,
            role: selectedRole.role,
            createdAt: selectedRole.createdAt,
          })
        );
      }

      // Department data
      // Department is now a free text input, just send the value
      formDataToSend.append("department", formData.department);

      // Avatar file
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      } else if (avatarPreview && isEditing) {
        // If no new avatar is selected but we have an existing one, send the existing avatar URL
        formDataToSend.append("existingAvatar", avatarPreview);
      }

      // Documents
      documents.forEach((file) => {
        formDataToSend.append("documents", file);
      });
      // Removed documents
      if (removedDocuments.length > 0) {
        formDataToSend.append(
          "removedDocuments",
          JSON.stringify(removedDocuments)
        );
      }
      // Existing documents
      if (existingDocuments.length > 0) {
        formDataToSend.append(
          "existingDocuments",
          JSON.stringify(existingDocuments)
        );
      }

      let response;
      if (isEditing) {
        response = await apiClient.put(`/api/employeeManagement/${employeeData.id}`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        response = await apiClient.post(`/api/employeeManagement`, formDataToSend, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      if (response.data.success) {
        addToast({
          title: "Success",
          description: `Employee ${isEditing ? "updated" : "created"
            } successfully`,
          color: "success",
        });
        if (isEditing) {
          // Update user role only when editing existing employee
          try {
            const selectedRole = roles.find((r) => r._id === formData.role);
            const roleUpdateResponse = await fetch(`/api/auth/updateRole`, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email,
                roleId: selectedRole?._id,
              }),
            });

            if (!roleUpdateResponse.ok) {
              throw new Error("Failed to update user role");
            }

            addToast({
              title: "Success",
              description: "Employee and role updated successfully",
              color: "success",
            });
          } catch (error) {
            console.error("Error updating user role:", error);
            addToast({
              title: "Error",
              description: "Employee updated but failed to update role",
              color: "danger",
            });
          }
        } else {
          // For new employee - create user account
          try {
            const selectedRole = roles.find((r) => r._id === formData.role);
            const registerResponse = await fetch(`/api/auth/register`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: `${formData.firstName} ${formData.lastName}`,
                email: formData.email,
                password: "DefaultPassword123!", // You might want to generate this or send via email
                roleId: selectedRole?._id,
              }),
            });

            const registerResult = await registerResponse.json();

            if (registerResponse.ok) {
              addToast({
                title: "Success",
                description:
                  "Employee created and user account registered successfully",
                color: "success",
              });
            } else {
              addToast({
                title: "Warning",
                description:
                  "Employee created but user account registration failed: " +
                  (registerResult.message || "Unknown error"),
                color: "warning",
              });
            }
          } catch (error) {
            console.error("Error creating user account:", error);
            addToast({
              title: "Warning",
              description: "Employee created but failed to create user account",
              color: "warning",
            });
          }
        }
        onSuccess && onSuccess();
        onOpenChange(false);
      } else {
        throw new Error(
          data.message ||
          `Failed to ${isEditing ? "update" : "create"} employee`
        );
      }
    } catch (error) {
      console.error("Error submitting employee:", error);
      addToast({
        title: "Error",
        description:
          error.message ||
          `Failed to ${isEditing ? "update" : "create"} employee`,
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Show access denied if no view permission
  if (!canView("employees")) {
    return (
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader>Access Denied</ModalHeader>
          <ModalBody>
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🔒</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Access Denied
              </h3>
              <p className="text-gray-500">
                You don't have permission to view employee details.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onPress={() => onOpenChange(false)}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="xl"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        base: "max-w-xl mx-auto rounded-xl",
        header: "bg-primary-600 text-white p-4 rounded-t-xl",
        body: "px-6 py-4",
        footer: "px-6 pb-6",
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">
                {isEditing ? "Edit Employee" : "Add Employee"}
              </h2>
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-primary-600 bg-white rounded-full hover:bg-white hover:text-primary-700 transition-colors"
              >
                <X size={20} />
              </Button>
            </ModalHeader>
            <ModalBody>
              <div className="space-y-4">
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center mb-6">
                  <div className="relative">
                    <Avatar
                      className="w-24 h-24 bg-gray-200 mb-2"
                      src={avatarPreview}
                      icon={<Plus size={24} className="text-gray-500" />}
                    />
                    <Button
                      isIconOnly
                      size="sm"
                      color="primary"
                      className="absolute -bottom-2 -right-2"
                      onPress={() => fileInputRef.current?.click()}
                    >
                      <Upload size={16} />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600">Upload profile image</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Last Name"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Mobile Number"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.mobileNo}
                    onChange={(e) =>
                      handleInputChange("mobileNo", e.target.value)
                    }
                    isInvalid={!!errors.mobileNo}
                    errorMessage={errors.mobileNo}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Email ID"
                    labelPlacement={"outside"}
                    variant="bordered"
                    type="email"
                    disabled={isEditing ? true : false}
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Select
                    label="Gender"
                    labelPlacement={"outside"}
                    variant="bordered"
                    selectedKeys={formData.gender ? [formData.gender] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("gender", selectedKey);
                    }}
                    isInvalid={!!errors.gender}
                    errorMessage={errors.gender}
                    classNames={{
                      trigger: "border-[#E0E5F2]  h-[50px]",
                    }}
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                  </Select>
                  <DatePicker
                    label="Date of Birth"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleInputChange("dateOfBirth", date)}
                    isInvalid={!!errors.dateOfBirth}
                    errorMessage={errors.dateOfBirth}
                    showMonthAndYearPickers={true}
                    classNames={{
                      label: "text-sm font-regular",
                      input: "text-sm",
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Address Line"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.address.addressLine}
                    onChange={(e) =>
                      handleAddressChange("addressLine", e.target.value)
                    }
                    isInvalid={!!errors.addressLine}
                    errorMessage={errors.addressLine}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="City"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    isInvalid={!!errors.city}
                    errorMessage={errors.city}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="District"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.address.district}
                    onChange={(e) =>
                      handleAddressChange("district", e.target.value)
                    }
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="State"
                    labelPlacement={"outside"}
                    value={formData.address.state}
                    variant="bordered"
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    isInvalid={!!errors.state}
                    errorMessage={errors.state}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Country"
                    labelPlacement={"outside"}
                    value={formData.address.country}
                    variant="bordered"
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    isInvalid={!!errors.country}
                    errorMessage={errors.country}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Pincode"
                    labelPlacement={"outside"}
                    value={formData.address.pincode}
                    variant="bordered"
                    onChange={(e) =>
                      handleAddressChange("pincode", e.target.value)
                    }
                    isInvalid={!!errors.pincode}
                    errorMessage={errors.pincode}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Input
                    label="Department"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.department}
                    onChange={(e) =>
                      handleInputChange("department", e.target.value)
                    }
                    isInvalid={!!errors.department}
                    errorMessage={errors.department}
                    classNames={{
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Select
                    label="Role"
                    labelPlacement={"outside"}
                    variant="bordered"
                    selectedKeys={
                      roles.some((r) => r._id === formData.role)
                        ? [formData.role]
                        : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("role", selectedKey);
                    }}
                    isInvalid={!!errors.role}
                    errorMessage={errors.role}
                    classNames={{
                      trigger: "border-[#E0E5F2]  h-[50px]",
                    }}
                  >
                    {roles.map((role) => (
                      <SelectItem key={role._id} value={role._id}>
                        {role.role}
                      </SelectItem>
                    ))}
                  </Select>
                  <DatePicker
                    label="Date of Hiring"
                    labelPlacement={"outside"}
                    variant="bordered"
                    value={formData.dateOfHiring}
                    onChange={(date) => handleInputChange("dateOfHiring", date)}
                    isInvalid={!!errors.dateOfHiring}
                    errorMessage={errors.dateOfHiring}
                    showMonthAndYearPickers={true}
                    classNames={{
                      label: "text-sm font-regular",
                      input: "text-sm",
                      inputWrapper: " h-[50px] border-[#E0E5F2]",
                    }}
                  />
                  <Select
                    label="Status"
                    labelPlacement={"outside"}
                    variant="bordered"
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("status", selectedKey);
                    }}
                    classNames={{
                      trigger: "border-[#E0E5F2]  h-[50px]",
                    }}
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="inactive">Inactive</SelectItem>
                  </Select>
                </div>

                <Textarea
                  label="Notes"
                  labelPlacement={"outside"}
                  variant="bordered"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  classNames={{
                    inputWrapper: " h-[50px] border-[#E0E5F2]",
                  }}
                />

                {/* Documents Section */}
                <div className="col-span-2">
                  <label className="block text-gray-700 mb-2">
                    Employee Documents
                  </label>
                  <div className="flex items-center gap-4 mb-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="employee-documents-upload"
                    />
                    <label htmlFor="employee-documents-upload">
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
                  {/* List all documents (existing and new) */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {/* Existing documents (edit mode) */}
                    {Array.isArray(existingDocuments) &&
                      existingDocuments.map((doc, idx) => (
                        <div
                          key={doc._id || doc.url || idx}
                          className="flex items-center bg-gray-100 rounded px-2 py-1"
                        >
                          <a
                            href={
                              doc.url && doc.url.startsWith("http")
                                ? doc.url
                                : `/${doc.url}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline max-w-xs truncate"
                            download={doc.originalName || true}
                            title={doc.originalName || "Document"}
                          >
                            {doc.originalName || "Document"}
                          </a>
                          <Button
                            type="button"
                            isIconOnly
                            color="primary"
                            className="ml-2"
                            onPress={() => handleRemoveExistingDocument(idx)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    {/* New files (not yet uploaded) */}
                    {documents.map((file, idx) => (
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
                    {(!Array.isArray(existingDocuments) ||
                      existingDocuments.length === 0) &&
                      documents.length === 0 && (
                        <span className="text-gray-500 text-xs">
                          *Attach employee docs/pdf/jpeg/png
                        </span>
                      )}
                  </div>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="flat"
                onPress={onClose}
                className="px-8"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={handleSubmit}
                className="px-8 bg-red-600"
                isLoading={loading}
                disabled={loading}
              >
                {isEditing ? "Update" : "Save"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};
