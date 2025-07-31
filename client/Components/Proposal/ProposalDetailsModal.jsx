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
import { X, FileText, ChevronDown, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import apiClient from "../../lib/axios";
import { addToast } from "@heroui/toast";
import { usePermissions } from "../../lib/utils";

const ProposalDetailsModal = ({
  isOpen,
  onClose,
  proposalData = {},
  onUpdate,
  onDelete,
}) => {
  const router = useRouter();
  const { canEdit, canDelete } = usePermissions();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [newAmount, setNewAmount] = useState("");
  const [originalStatus, setOriginalStatus] = useState(""); // Track original status
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
    attachments: null,
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
        attachments: proposalData.attachments || null,
      });

      // Set original status
      setOriginalStatus(proposalData.status || "Warm");

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
        addToast({
          title: "Invalid File Type",
          description: "Please select a valid file (PDF, JPEG, PNG, DOC, DOCX)",
          color: "danger",
        });
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        addToast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          color: "danger",
        });
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

  // Handle amount selection from dropdown
  const handleAmountSelect = (selectedAmount) => {
    const numericValue = parseInt(selectedAmount.replace(/[^\d]/g, ""));
    setFormData((prev) => ({
      ...prev,
      projectAmount: numericValue,
    }));
  };

  // Handle adding current amount to options
  const handleAddCurrentAmount = () => {
    const currentAmountFormatted = `₹${formData.projectAmount.toLocaleString(
      "en-IN"
    )}`;
    if (!amountOptions.includes(currentAmountFormatted)) {
      setAmountOptions((prev) => [...prev, currentAmountFormatted]);
      addToast({
        title: "Success",
        description: "Amount added to options",
        color: "success",
      });
    } else {
      addToast({
        title: "Info",
        description: "Amount already exists in options",
        color: "primary",
      });
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
    if (!canEdit("proposal")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit proposals",
        color: "danger",
      });
      return;
    }

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
        submitData.append("attachments", selectedFile);
      }

      const response = await apiClient.put(`/api/proposals/${proposalData._id}`, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        addToast({
          title: "Success",
          description: "Proposal updated successfully!",
          color: "success",
        });
        setIsEditing(false);
        onUpdate && onUpdate(); // Refresh the table
        onClose();
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update proposal",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle edit - navigate to edit page
  const handleEdit = () => {
    if (!canEdit("proposals")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit proposals",
        color: "danger",
      });
      return;
    }
    onClose(); // Close modal first
    router.push(`/dashboard/proposal/edit/${proposalData._id}`);
  };

  // Handle delete
  const handleDelete = () => {
    if (!canDelete("proposal")) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to delete proposals",
        color: "danger",
      });
      return;
    }
    if (confirm("Are you sure you want to delete this proposal?")) {
      onDelete && onDelete(proposalData._id);
      onClose();
    }
  };

  // Handle project confirmation
  const handleProjectConfirmed = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting project confirmation for proposal:', proposalData._id);

      // First, update proposal status to Confirmed
      const statusResponse = await apiClient.patch(`/api/proposals/${proposalData._id}/field`, {
        field: "status",
        value: "Confirmed",
      });

      console.log('✅ Status update response:', statusResponse.data);

      if (statusResponse.data.success) {
        // Check if the status update response indicates a project was already created
        if (statusResponse.data.message?.includes("project created automatically")) {
          console.log('✅ Project was created automatically during status update');
          addToast({
            title: "Success",
            description: "Project confirmed and created successfully!",
            color: "success",
          });
          onUpdate && onUpdate(); // Refresh the table
          onClose();
          return;
        }

        // Only try to create project if it wasn't created automatically
        console.log('🏗️ Project not created automatically, creating manually...');
        try {
          const projectResponse = await apiClient.post(`/api/projects/from-proposal/${proposalData._id}`, {});

          console.log('✅ Project creation response:', projectResponse.data);

          if (projectResponse.data.success) {
            addToast({
              title: "Success",
              description: "Project confirmed and created successfully!",
              color: "success",
            });
            onUpdate && onUpdate(); // Refresh the table
            onClose();
          } else {
            addToast({
              title: "Warning",
              description: "Proposal confirmed but failed to create project",
              color: "warning",
            });
          }
        } catch (projectError) {
          console.error('❌ Error creating project from proposal:', projectError.response?.data);

          // Handle specific error cases
          if (projectError.response?.data?.message?.includes("already exists")) {
            console.log('✅ Project already exists - treating as success');
            addToast({
              title: "Success",
              description: "Project confirmed! (Project already exists for this proposal)",
              color: "success",
            });
            onUpdate && onUpdate(); // Refresh the table
            onClose();
          } else if (projectError.response?.data?.message?.includes("Only confirmed proposals")) {
            addToast({
              title: "Error",
              description: "Proposal status update failed. Please try again.",
              color: "danger",
            });
          } else {
            addToast({
              title: "Error",
              description: projectError.response?.data?.message || "Failed to create project from proposal",
              color: "danger",
            });
          }
        }
      } else {
        console.error('❌ Status update failed:', statusResponse.data);
        addToast({
          title: "Error",
          description: "Failed to update proposal status",
          color: "danger",
        });
      }
    } catch (error) {
      console.error("❌ Error confirming project:", error.response?.data);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to confirm project",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Render amount section
  // Replace your renderAmountSection function with this fixed version:

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
              variant="bordered"
              className="w-40"
              type="number"
              disabled={originalStatus === "Confirmed"}
            />
            <Button
              size="sm"
              color="primary"
              className="px-3"
              onPress={handleAddAmount}
              disabled={originalStatus === "Confirmed"}
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
              disabled={originalStatus === "Confirmed"}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <Dropdown radius="md">
              <DropdownTrigger>
                <Button
                  variant="bordered"
                  className="justify-between min-w-40 border-gray-300"
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
                  handleAmountSelect(key);
                }}
                disabledKeys={originalStatus === "Confirmed" ? amountOptions : ["close"]}
                closeOnSelect={false}
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
              onPress={() => setShowAmountInput(true)} // Show input to add new amount
              disabled={!canEdit("proposal") || originalStatus === "Confirmed"}
            >
              Add
            </Button>
            {/* <Button
              size="sm"
              color="primary"
              className="px-3"
              onPress={() => {
                handleFixAmount();
              }}
              disabled={loading}
            >
              {loading ? "Fixing..." : "Fix"}
            </Button> */}
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
        <div className="text-black font-[400]">
          {formData.comment || "No comment"}
        </div>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      aria-label="Proposal Details"
      placement="center"
      backdrop="blur"
      scrollBehavior="inside"
      hideCloseButton
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "border-none shadow-2xl",
        header: "border-b-1 border-gray-200",
        body: "py-6 !scrollbar-w-0 scrollbar-none overscroll-y-contain", // Hide scrollbar and its width
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
                radius="full"
                onPress={onClose}
                className="text-primary bg-white hover:bg-gray-100 min-w-8 w-8 h-8 "
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
                    <div className="text-black font-[400]">
                      {formData.customerName}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date:
                  </label>
                  <div className="text-black font-[400]">{formData.date}</div>
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
                    <div className="text-black font-[400]">
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
                    <div className="text-black font-[400]">
                      {formData.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address:
                </label>
                <div className="text-black font-[400]">
                  {`${formData.address.addressLine}, ${formData.address.city}, ${formData.address.district}, ${formData.address.state}, ${formData.address.country} - ${formData.address.pincode}`}
                </div>
              </div>

              {/* Service and Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service:
                  </label>
                  <div className="text-black font-[400]">
                    {formData.services}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description:
                  </label>
                  <div className="text-black font-[400] text-sm">
                    {formData.projectDescription}
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Size:
                </label>
                <div className="text-black font-[400]">
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
                <Select
                  selectedKeys={new Set([formData.status])}
                  variant="bordered"
                  radius="md"
                  className="max-w-[160px]"
                  aria-label="Proposal status"
                  classNames={{
                    trigger: "border-gray-300",
                  }}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    if (statusOptions.some((s) => s.key === selectedKey)) {
                      handleInputChange("status", selectedKey);
                    }
                  }}
                  disallowEmptySelection={true}
                  isDisabled={originalStatus === "Confirmed"}
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </Select>
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
                        disabled={originalStatus === "Confirmed"}
                      >
                        {selectedFile ? "Change File" : "Upload File"}
                      </Button>
                    </label>
                    <span className="text-sm text-gray-600">
                      {selectedFile
                        ? selectedFile.name
                        : formData.attachments &&
                          Array.isArray(formData.attachments) &&
                          formData.attachments.length > 0
                          ? formData.attachments.map((att, idx) => (
                            <span
                              key={att._id || att.filename || idx}
                              className="block"
                            >
                              {att.originalName || att.filename}
                            </span>
                          ))
                          : formData.attachments &&
                            formData.attachments.originalName
                            ? formData.attachments.originalName
                            : "No file selected"}
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-2 border border-gray-200 rounded-lg">
                    {formData.attachments &&
                      Array.isArray(formData.attachments) &&
                      formData.attachments.length > 0 ? (
                      formData.attachments.map((att, idx) => (
                        <div
                          key={att._id || att.filename || idx}
                          className="flex items-center gap-2"
                        >
                          <FileText size={16} className="text-blue-600" />
                          <a
                            href={
                              att.url || att.attachmentUrl || `/${att.filename}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-700 hover:underline"
                          >
                            {att.originalName || att.filename}
                          </a>
                        </div>
                      ))
                    ) : formData.attachments &&
                      formData.attachments.originalName ? (
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue-600" />
                        <a
                          href={
                            formData.attachments.url ||
                            formData.attachments.attachmentUrl ||
                            `/${formData.attachments.filename}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-700 hover:underline"
                        >
                          {formData.attachments.originalName ||
                            formData.attachments.filename}
                        </a>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-700">
                        No attachment
                      </span>
                    )}
                  </div>
                )}
              </div>
            </ModalBody>

            {/* Modal Footer */}
            <ModalFooter className="px-6 py-4 flex justify-around">
              <div className="flex gap-2">

                <Button
                  color="primary"
                  onPress={handleSave}
                  className="px-6"
                  disabled={loading || !canEdit("proposal") || originalStatus === "Confirmed"}
                  radius="md"
                >
                  save
                </Button>


                <Button
                  onPress={handleEdit}
                  className="px-6 bg-[#616161] text-white"
                  disabled={loading || !canEdit("proposal") || originalStatus === "Confirmed"}
                  radius="md"
                >
                  Edit
                </Button>

                <Button
                  onPress={handleDelete}
                  className="px-6 text-white bg-[#999999]"
                  disabled={loading || !canDelete("proposal") || originalStatus === "Confirmed"}
                  radius="md"
                >
                  Delete
                </Button>
              </div>
              {/* <Button
                color="success"
                variant="solid"
                className="px-6"
                onPress={handleProjectConfirmed}
                disabled={loading || originalStatus === "Confirmed"}
              >
                {loading ? "Confirming..." : originalStatus === "Confirmed" ? "Already Confirmed" : "Project Confirmed"}
              </Button> */}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProposalDetailsModal;
