import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { Chip } from "@heroui/chip";
import { X, FileText, ChevronDown, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";

const ProposalDetailsModal = ({
  isOpen,
  onClose,
  proposalData = {},
  onUpdate,
  onDelete,
}) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [newAmount, setNewAmount] = useState("");

  // Form data state
  const [formData, setFormData] = useState({
    customerName: "",
    contactNumber: "",
    email: "",
    address: {
      addressLine: "",
      city: "",
      district: "",
      state: "",
      country: "",
      pincode: "",
    },
    services: "",
    projectDescription: "",
    projectAmount: 0,
    size: "",
    status: "Warm",
    comment: "",
    date: "",
    attachment: null,
  });

  // Amount dropdown options
  const [amountOptions, setAmountOptions] = useState([]);

  // Initialize form data when proposalData changes
  useEffect(() => {
    if (proposalData) {
      setFormData({
        customerName: proposalData.customerName || "",
        contactNumber: proposalData.contactNumber || "",
        email: proposalData.email || "",
        address: proposalData.address || {
          addressLine: "",
          city: "",
          district: "",
          state: "",
          country: "",
          pincode: "",
        },
        services: proposalData.services || "",
        projectDescription: proposalData.projectDescription || "",
        projectAmount: proposalData.projectAmount || 0,
        size: proposalData.size || "",
        status: proposalData.status || "Warm",
        comment: proposalData.comment || "",
        date: proposalData.date
          ? new Date(proposalData.date).toLocaleDateString()
          : "",
        attachment: proposalData.attachment || null,
      });

      // Update amount options if available in proposal data
      if (
        proposalData.amountOptions &&
        Array.isArray(proposalData.amountOptions)
      ) {
        setAmountOptions(proposalData.amountOptions);
      }
    }
  }, [proposalData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      // Handle nested address fields
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
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
        alert("Please select a valid file (PDF, JPEG, PNG, DOC, DOCX)");
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }

      setSelectedFile(file);
    }
  };

  // Handle amount addition
  const handleAddAmount = () => {
    if (newAmount) {
      const numericValue = parseInt(newAmount.replace(/[^\d]/g, ""));
      const formattedAmount = `₹${numericValue.toLocaleString("en-IN")}`;

      // Add to amount options if not already present
      if (!amountOptions.includes(formattedAmount)) {
        setAmountOptions((prev) => [...prev, formattedAmount]);
      }

      // Set the project amount
      setFormData((prev) => ({
        ...prev,
        projectAmount: numericValue,
      }));
      setNewAmount("");
      setShowAmountInput(false);
    }
  };

  // Status options
  const statusOptions = [
    { key: "Hot", label: "Hot", color: "danger" },
    { key: "Warm", label: "Warm", color: "warning" },
    { key: "Cold", label: "Cold", color: "primary" },
    { key: "Scrap", label: "Scrap", color: "default" },
    { key: "Confirmed", label: "Confirmed", color: "success" },
  ];

  // Handle save
  const handleSave = async () => {
    try {
      setLoading(true);

      const submitData = new FormData();

      // Add all form fields
      submitData.append("customerName", formData.customerName);
      submitData.append("contactNumber", formData.contactNumber);
      submitData.append("email", formData.email);
      submitData.append("address", JSON.stringify(formData.address));
      submitData.append("services", formData.services);
      submitData.append("projectDescription", formData.projectDescription);
      submitData.append("projectAmount", formData.projectAmount);
      submitData.append("size", formData.size);
      submitData.append("status", formData.status);
      submitData.append("comment", formData.comment);
      submitData.append("amountOptions", JSON.stringify(amountOptions));

      // Add file if selected
      if (selectedFile) {
        submitData.append("attachment", selectedFile);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalData._id}`,
        submitData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        alert("Proposal updated successfully!");
        setIsEditing(false);
        onUpdate && onUpdate(); // Refresh the table
        onClose();
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      alert(error.response?.data?.error || "Failed to update proposal");
    } finally {
      setLoading(false);
    }
  };

  // Handle edit - navigate to edit page
  const handleEdit = () => {
    onClose(); // Close modal first
    router.push(`/dashboard/proposal/edit/${proposalData._id}`);
  };

  // Handle delete
  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      onDelete && onDelete(proposalData._id);
      onClose();
    }
  };

  // Handle project confirmation
  const handleProjectConfirmed = async () => {
    try {
      setLoading(true);

      // First, update proposal status to Confirmed
      const statusResponse = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalData._id}/field`,
        {
          field: "status",
          value: "Confirmed",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (statusResponse.data.success) {
        // Then create project from proposal
        const projectResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/from-proposal/${proposalData._id}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

        if (projectResponse.data.success) {
          alert("Project confirmed and created successfully!");
          onUpdate && onUpdate(); // Refresh the table
          onClose();
        } else {
          alert("Proposal confirmed but failed to create project");
        }
      }
    } catch (error) {
      console.error("Error confirming project:", error);
      if (
        error.response?.status === 400 &&
        error.response?.data?.error?.includes("already exists")
      ) {
        alert("Project confirmed! (Project already exists for this proposal)");
        onUpdate && onUpdate();
        onClose();
      } else {
        alert(error.response?.data?.error || "Failed to confirm project");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render amount section
  const renderAmountSection = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Selected Amount:
      </label>
      <div className="flex items-center gap-2">
        {showAmountInput ? (
          <div className="flex items-center gap-2">
            <Input
              size="sm"
              placeholder="Enter amount"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddAmount();
                }
              }}
              variant="bordered"
              className="w-40"
              type="number"
            />
            <Button
              size="sm"
              color="primary"
              className="px-3"
              onPress={handleAddAmount}
            >
              Save
            </Button>
            <Button
              size="sm"
              variant="bordered"
              className="px-3"
              onPress={() => {
                setShowAmountInput(false);
                setNewAmount("");
              }}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="justify-start min-w-40 border-gray-300"
                  endContent={<ChevronDown className="text-gray-400" />}
                >
                  ₹{formData.projectAmount.toLocaleString("en-IN")}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Amount options"
                onAction={(key) => {
                  const numericValue = parseInt(
                    key.toString().replace(/[^\d]/g, "")
                  );
                  handleInputChange("projectAmount", numericValue);
                }}
              >
                {amountOptions.map((amount) => (
                  <DropdownItem key={amount}>{amount}</DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button
              size="sm"
              color="primary"
              className="px-3"
              onPress={() => setShowAmountInput(true)}
            >
              Add New
            </Button>
          </>
        )}
      </div>
    </div>
  );

  // Render comment section
  const renderCommentSection = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Comment:</label>
      {isEditing ? (
        <Textarea
          value={formData.comment}
          onChange={(e) => handleInputChange("comment", e.target.value)}
          className="min-h-16"
          classNames={{
            input: "resize-none",
            inputWrapper: "border-gray-300",
          }}
        />
      ) : (
        <div className="text-gray-900">{formData.comment || "No comment"}</div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      aria-label="Proposal Details"
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border-none shadow-2xl",
        header: "border-b-1 border-gray-200",
        body: "py-6",
        footer: "border-t-1 border-gray-200",
      }}
      motionProps={{
        variants: {
          enter: {
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              ease: "easeOut",
            },
          },
          exit: {
            y: -20,
            opacity: 0,
            transition: {
              duration: 0.2,
              ease: "easeIn",
            },
          },
        },
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            {/* Modal Header */}
            <ModalHeader className="flex justify-between items-center bg-primary text-white px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold">Proposal Details</h2>
              <Button
                isIconOnly
                variant="light"
                onPress={onClose}
                className="text-white hover:bg-white/20 min-w-8 w-8 h-8"
                aria-label="Close modal"
              >
                <X size={20} />
              </Button>
            </ModalHeader>

            {/* Modal Body */}
            <ModalBody className="px-6 space-y-4">
              {/* Customer and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Customer:
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.customerName}
                      onChange={(e) =>
                        handleInputChange("customerName", e.target.value)
                      }
                      variant="bordered"
                    />
                  ) : (
                    <div className="text-gray-900 font-medium">
                      {formData.customerName}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date:
                  </label>
                  <div className="text-gray-900">{formData.date}</div>
                </div>
              </div>

              {/* Contact and Email Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Contact:
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.contactNumber}
                      onChange={(e) =>
                        handleInputChange("contactNumber", e.target.value)
                      }
                      variant="bordered"
                    />
                  ) : (
                    <div className="text-gray-900">
                      {formData.contactNumber}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Id:
                  </label>
                  {isEditing ? (
                    <Input
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      variant="bordered"
                      type="email"
                    />
                  ) : (
                    <div className="text-gray-900">{formData.email}</div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address:
                </label>
                <div className="text-gray-900">
                  {`${formData.address.addressLine}, ${formData.address.city}, ${formData.address.district}, ${formData.address.state}, ${formData.address.country} - ${formData.address.pincode}`}
                </div>
              </div>

              {/* Service and Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service:
                  </label>
                  <div className="text-gray-900">{formData.services}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description:
                  </label>
                  <div className="text-gray-900 text-sm">
                    {formData.projectDescription}
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Size:
                </label>
                <div className="text-gray-900">
                  {formData.size} <span className="text-gray-500">sqt</span>
                </div>
              </div>

              {/* Amount with Dropdown */}
              {renderAmountSection()}

              {/* Comment */}
              {renderCommentSection()}

              {/* Status */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                {isEditing ? (
                  <Select
                    selectedKeys={[formData.status]}
                    className="max-w-xs"
                    classNames={{
                      trigger: "border-gray-300",
                    }}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      handleInputChange("status", selectedKey);
                    }}
                  >
                    {statusOptions.map((status) => (
                      <SelectItem key={status.key} value={status.key}>
                        <Chip color={status.color} size="sm" variant="flat">
                          {status.label}
                        </Chip>
                      </SelectItem>
                    ))}
                  </Select>
                ) : (
                  <Chip
                    color={
                      statusOptions.find((s) => s.key === formData.status)
                        ?.color || "default"
                    }
                    size="sm"
                    variant="flat"
                  >
                    {formData.status}
                  </Chip>
                )}
              </div>

              {/* Attachment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Attachment:
                </label>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      className="hidden"
                      id="attachment-upload"
                    />
                    <label htmlFor="attachment-upload">
                      <Button
                        as="span"
                        color="primary"
                        size="sm"
                        startContent={<Upload size={16} />}
                        className="cursor-pointer"
                      >
                        {selectedFile ? "Change File" : "Upload File"}
                      </Button>
                    </label>
                    <span className="text-sm text-gray-600">
                      {selectedFile
                        ? selectedFile.name
                        : formData.attachment
                        ? formData.attachment.originalName
                        : "No file selected"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                    <FileText size={16} className="text-blue-600" />
                    <span className="text-sm text-gray-700">
                      {formData.attachment
                        ? formData.attachment.originalName ||
                          formData.attachment.filename
                        : "No attachment"}
                    </span>
                  </div>
                )}
              </div>
            </ModalBody>

            {/* Modal Footer */}
            <ModalFooter className="px-6 py-4 flex justify-between">
              <div className="flex gap-2">
                <Button
                  color="primary"
                  onPress={handleEdit}
                  className="px-6"
                  disabled={loading}
                >
                  Edit
                </Button>
                {formData.status !== "Confirmed" && (
                  <Button
                    variant="bordered"
                    onPress={handleDelete}
                    className="px-6 border-red-400 text-red-600 hover:bg-red-50"
                    disabled={loading}
                  >
                    Delete
                  </Button>
                )}
              </div>
              {formData.status !== "Confirmed" && (
                <Button
                  color="success"
                  variant="solid"
                  className="px-6"
                  onPress={handleProjectConfirmed}
                  disabled={loading}
                >
                  {loading ? "Confirming..." : "Project Confirmed"}
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProposalDetailsModal;
