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

import { X, FileText, ChevronDown } from "lucide-react";

const ProposalDetailsModal = ({
  isOpen,
  onClose,
  proposalData = {},
  isEditing = false,
}) => {
  // State for managing the amount input visibility
  const [showAmountInput, setShowAmountInput] = useState(false);
  const [newAmount, setNewAmount] = useState("");

  // State management for form data
  const [formData, setFormData] = useState({
    customer: proposalData.customer || "Vinoth R",
    date: proposalData.date || "21/05/2025",
    contact: proposalData.contact || "+91 9834 578341",
    email: proposalData.email || "vinoth@gmail.com",
    address:
      proposalData.address || "123/ss colony, Thirunagar, Madurai-625018",
    service: proposalData.service || "Home Cinema",
    description:
      proposalData.description ||
      "Full home automation system including lights",
    size: proposalData.size || "2200 X 3450",
    amount: proposalData.amount || "₹30,00,000",
    comment: proposalData.comment || "Quotation sent & confirmed",
    status: proposalData.status || "Hot",
    attachment: proposalData.attachment || "pro-987665.pdf",
  });
  // Amount dropdown options matching the reference image
  const [amountOptions, setAmountOptions] = useState([
    "₹30,00,000",
    "₹32,00,000",
    "₹28,00,000",
    "₹26,00,000",
  ]);

  useEffect(() => {
    if (isEditing) {
      setShowAmountInput(true);
    }
  }, [isEditing]);

  const handleAddAmount = () => {
    if (newAmount) {
      const formattedAmount = !newAmount.startsWith("₹")
        ? `₹${newAmount}`
        : newAmount;
      setAmountOptions((prev) => [...prev, formattedAmount]);
      setFormData((prev) => ({ ...prev, amount: formattedAmount }));
      setNewAmount("");
      setShowAmountInput(false);
    }
  };

  // Status options with proper styling
  const statusOptions = [
    { key: "hot", label: "Hot", color: "primary" },
    { key: "warm", label: "Warm", color: "warning" },
    { key: "cold", label: "Cold", color: "primary" },
  ];

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = () => {
    // Form validation and save logic
    console.log("Saving proposal data:", formData);
    onClose();
  };

  const handleEdit = () => {
    console.log("Edit mode activated");
  };

  const handleDelete = () => {
    console.log("Delete proposal");
    onClose();
  };

  // Amount with Dropdown section
  const renderAmountSection = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Amount:</label>
      <div className="flex items-center gap-2">
        {showAmountInput || isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              size="sm"
              placeholder="Enter amount"
              value={newAmount || formData.amount}
              onChange={(e) => setNewAmount(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAddAmount();
                }
              }}
              variant="bordered"
              className="w-40"
              startContent="₹"
            />
            <Button
              size="sm"
              color="primary"
              className="px-3"
              onClick={handleAddAmount}
            >
              Save
            </Button>
            {!isEditing && (
              <Button
                size="sm"
                variant="bordered"
                className="px-3"
                onClick={() => setShowAmountInput(false)}
              >
                Cancel
              </Button>
            )}
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
                  {formData.amount}
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Amount options"
                onAction={(key) => handleInputChange("amount", key)}
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
              onClick={() => setShowAmountInput(true)}
            >
              Add
            </Button>
            <Button
              size="sm"
              color="primary"
              variant="bordered"
              className="px-3"
            >
              Fix
            </Button>
          </>
        )}
      </div>
    </div>
  );

  // Comment section
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
        <div className="text-gray-900">{formData.comment}</div>
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
            {/* Modal Header - Exact replication of red header design */}
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

            {/* Modal Body - Form fields with exact spacing and layout */}
            <ModalBody className="px-6 space-y-4">
              {/* Customer and Date Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Customer:
                  </label>
                  <div className="text-gray-900 font-medium">
                    {formData.customer}
                  </div>
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
                  <div className="text-gray-900">{formData.contact}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email Id:
                  </label>
                  <div className="text-gray-900">{formData.email}</div>
                </div>
              </div>
              {/* Address */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Address:
                </label>
                <div className="text-gray-900">{formData.address}</div>
              </div>
              {/* Service and Description Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Service:
                  </label>
                  <div className="text-gray-900">{formData.service}</div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Description:
                  </label>
                  <div className="text-gray-900 text-sm">
                    {formData.description}
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
              </div>{" "}
              {/* Amount with Dropdown - Exact replication */}
              {renderAmountSection()}
              {/* Comment */}
              {renderCommentSection()}
              {/* Status Dropdown */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Status:
                </label>
                <Select
                  selectedKeys={[formData.status.toLowerCase()]}
                  className="max-w-xs"
                  classNames={{
                    trigger: "border-gray-300",
                  }}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    const selectedOption = statusOptions.find(
                      (opt) => opt.key === selectedKey
                    );
                    handleInputChange("status", selectedOption?.label || "Hot");
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
              </div>
              {/* Attachment */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Attachment:
                </label>
                <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                  <FileText size={16} className="text-blue-600" />
                  <span className="text-sm text-gray-700">
                    {formData.attachment}
                  </span>
                </div>
              </div>
            </ModalBody>

            {/* Modal Footer - Action buttons with exact styling */}
            <ModalFooter className="px-6 py-4 flex justify-between">
              <div className="flex gap-2">
                <Button color="primary" onPress={handleSave} className="px-6">
                  Save
                </Button>
                <Button
                  variant="bordered"
                  onPress={handleEdit}
                  className="px-6 border-gray-400"
                >
                  Edit
                </Button>
                <Button
                  variant="bordered"
                  onPress={handleDelete}
                  className="px-6 border-gray-400"
                >
                  Delete
                </Button>
              </div>
              <Button
                color="default"
                variant="solid"
                className="bg-gray-800 text-white px-6"
              >
                Project Confirmed
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ProposalDetailsModal;
