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
import { Card, CardBody } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { DatePicker } from "@heroui/date-picker";
import { addToast } from "@heroui/toast";
import { Plus, Upload, FileText, X, Trash2 } from "lucide-react";
import { parseDate } from "@internationalized/date";

export const EmployeeModal = ({
  isOpen,
  onOpenChange,
  employeeData,
  onSuccess,
}) => {
  const isEditing = !!employeeData;
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
  const [departments] = useState([
    { name: "Installation", createdAt: new Date() },
    { name: "Service", createdAt: new Date() },
    { name: "Sales", createdAt: new Date() },
    { name: "Support", createdAt: new Date() },
  ]);

  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch roles from API
  const fetchRoles = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/rolesAndPermission`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRoles(data.roles);
        }
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
          department: emp.department?.name || "",
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
    if (!formData.address.pincode.trim())
      newErrors.pincode = "Pincode is required";

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

  const handleDocumentChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setDocuments((prev) => [...prev, ...files]);
    }
  };

  const removeDocument = (index) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
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
      const selectedDepartment = departments.find(
        (d) => d.name === formData.department
      );
      if (selectedDepartment) {
        formDataToSend.append("department", JSON.stringify(selectedDepartment));
      }

      // Avatar file
      if (avatar) {
        formDataToSend.append("avatar", avatar);
      }

      // Document files
      documents.forEach((doc) => {
        formDataToSend.append("documents", doc);
      });

      const url = isEditing
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/employeeManagement/${employeeData.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/employeeManagement`;

      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok && data.success) {
        addToast({
          title: "Success",
          description: `Employee ${
            isEditing ? "updated" : "created"
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

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="2xl"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        base: "max-w-2xl",
        header: "bg-red-600 text-white p-4",
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
                className="text-white hover:bg-red-700"
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
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    isInvalid={!!errors.firstName}
                    errorMessage={errors.firstName}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    isInvalid={!!errors.lastName}
                    errorMessage={errors.lastName}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Mobile Number"
                    placeholder="Mobile Number"
                    value={formData.mobileNo}
                    onChange={(e) =>
                      handleInputChange("mobileNo", e.target.value)
                    }
                    isInvalid={!!errors.mobileNo}
                    errorMessage={errors.mobileNo}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Email ID"
                    placeholder="Email ID"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Select
                    label="Gender"
                    placeholder="Select gender"
                    selectedKeys={formData.gender ? [formData.gender] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("gender", selectedKey);
                    }}
                    isInvalid={!!errors.gender}
                    errorMessage={errors.gender}
                    classNames={{
                      label: "text-sm font-medium",
                      trigger: "text-sm",
                    }}
                  >
                    <SelectItem key="male">Male</SelectItem>
                    <SelectItem key="female">Female</SelectItem>
                    <SelectItem key="other">Other</SelectItem>
                  </Select>
                  <DatePicker
                    label="Date of Birth"
                    value={formData.dateOfBirth}
                    onChange={(date) => handleInputChange("dateOfBirth", date)}
                    isInvalid={!!errors.dateOfBirth}
                    errorMessage={errors.dateOfBirth}
                    showMonthAndYearPickers={true}
                    classNames={{
                      label: "text-sm font-medium",
                      input: "text-sm",
                    }}
                  />
                  <Input
                    label="Address Line"
                    placeholder="Address Line"
                    value={formData.address.addressLine}
                    onChange={(e) =>
                      handleAddressChange("addressLine", e.target.value)
                    }
                    isInvalid={!!errors.addressLine}
                    errorMessage={errors.addressLine}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="City"
                    placeholder="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      handleAddressChange("city", e.target.value)
                    }
                    isInvalid={!!errors.city}
                    errorMessage={errors.city}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="District"
                    placeholder="District"
                    value={formData.address.district}
                    onChange={(e) =>
                      handleAddressChange("district", e.target.value)
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      handleAddressChange("state", e.target.value)
                    }
                    isInvalid={!!errors.state}
                    errorMessage={errors.state}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Country"
                    placeholder="Country"
                    value={formData.address.country}
                    onChange={(e) =>
                      handleAddressChange("country", e.target.value)
                    }
                    isInvalid={!!errors.country}
                    errorMessage={errors.country}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Pincode"
                    value={formData.address.pincode}
                    onChange={(e) =>
                      handleAddressChange("pincode", e.target.value)
                    }
                    isInvalid={!!errors.pincode}
                    errorMessage={errors.pincode}
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Select
                    label="Department"
                    placeholder="Select department"
                    selectedKeys={
                      formData.department ? [formData.department] : []
                    }
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("department", selectedKey);
                    }}
                    isInvalid={!!errors.department}
                    errorMessage={errors.department}
                    classNames={{
                      label: "text-sm font-medium",
                      trigger: "text-sm",
                    }}
                  >
                    {departments.map((dept) => (
                      <SelectItem key={dept.name} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Role"
                    placeholder="Select role"
                    selectedKeys={formData.role ? [formData.role] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("role", selectedKey);
                    }}
                    isInvalid={!!errors.role}
                    errorMessage={errors.role}
                    classNames={{
                      label: "text-sm font-medium",
                      trigger: "text-sm",
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
                    value={formData.dateOfHiring}
                    onChange={(date) => handleInputChange("dateOfHiring", date)}
                    isInvalid={!!errors.dateOfHiring}
                    errorMessage={errors.dateOfHiring}
                    showMonthAndYearPickers={true}
                    classNames={{
                      label: "text-sm font-medium",
                      input: "text-sm",
                    }}
                  />
                  <Select
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={[formData.status]}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("status", selectedKey);
                    }}
                    classNames={{
                      label: "text-sm font-medium",
                      trigger: "text-sm",
                    }}
                  >
                    <SelectItem key="active">Active</SelectItem>
                    <SelectItem key="inactive">Inactive</SelectItem>
                  </Select>
                </div>

                <Textarea
                  label="Notes"
                  placeholder="Additional notes about the employee"
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />

                {/* Document Upload Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documents
                  </label>
                  <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="flat"
                          startContent={<Upload size={16} />}
                          className="text-sm"
                          onPress={() => documentInputRef.current?.click()}
                        >
                          Upload Documents
                        </Button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Upload employee documents (ID proof, certificates, etc.)
                      </p>
                      <input
                        ref={documentInputRef}
                        type="file"
                        multiple
                        onChange={handleDocumentChange}
                        className="hidden"
                      />
                    </CardBody>
                  </Card>

                  {/* Document List */}
                  {documents.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-2">
                            <FileText size={16} className="text-gray-500" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <Button
                            isIconOnly
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => removeDocument(index)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
