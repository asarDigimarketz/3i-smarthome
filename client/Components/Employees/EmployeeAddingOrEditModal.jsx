import { useState } from "react";
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
import { DateRangePicker } from "@heroui/date-picker";
import { Plus, Upload, FileText, X } from "lucide-react";

export const EmployeeModal = ({ isOpen, onOpenChange, employeeData }) => {
  const isEditing = !!employeeData;
  const [formData, setFormData] = useState({
    firstName: employeeData?.name?.split(" ")[0] || "",
    lastName: employeeData?.name?.split(" ").slice(1).join(" ") || "",
    phoneNumber: employeeData?.phone || "",
    emailId: employeeData?.email || "",
    addressLine1: employeeData?.addressLine1 || "",
    cityTownVillage: employeeData?.cityTownVillage || "",
    district: employeeData?.district || "",
    state: employeeData?.state || "",
    country: employeeData?.country || "",
    pincode: employeeData?.pincode || "",
    department: employeeData?.department || "",
    role: employeeData?.role || "",
    dateOfJoining: employeeData?.dateOfJoining || null,
    dateOfBirth: employeeData?.dateOfBirth || null,
    note: employeeData?.note || "",
    status: employeeData?.status || "Active",
  });

  const roleOptions = [
    { key: "manager", label: "Manager" },
    { key: "developer", label: "Developer" },
    { key: "designer", label: "Designer" },
    { key: "analyst", label: "Analyst" },
    { key: "specialist", label: "Specialist" },
  ];

  const statusOptions = [
    { key: "Active", label: "Active" },
    { key: "Inactive", label: "Inactive" },
  ];

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
                      icon={<Plus size={24} className="text-gray-500" />}
                    />
                  </div>
                  <p className="text-sm text-gray-600">Upload profile image</p>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({ ...formData, firstName: e.target.value })
                    }
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
                      setFormData({ ...formData, lastName: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Phone Number"
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Email ID"
                    placeholder="Email ID"
                    type="email"
                    value={formData.emailId}
                    onChange={(e) =>
                      setFormData({ ...formData, emailId: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Address line 1"
                    placeholder="Address line 1"
                    value={formData.addressLine1}
                    onChange={(e) =>
                      setFormData({ ...formData, addressLine1: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="City/Town/Village"
                    placeholder="City/Town/Village"
                    value={formData.cityTownVillage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cityTownVillage: e.target.value,
                      })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="District"
                    placeholder="District"
                    value={formData.district}
                    onChange={(e) =>
                      setFormData({ ...formData, district: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="State"
                    placeholder="State"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Country"
                    placeholder="Country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Pincode"
                    placeholder="Pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Input
                    label="Department"
                    placeholder="Department"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                    classNames={{
                      input: "text-sm",
                      label: "text-sm font-medium",
                    }}
                  />
                  <Select
                    label="Role"
                    placeholder="Select role"
                    selectedKeys={formData.role ? [formData.role] : []}
                    onSelectionChange={(keys) => {
                      const selectedKey = Array.from(keys)[0];
                      setFormData({ ...formData, role: selectedKey });
                    }}
                    classNames={{
                      label: "text-sm font-medium",
                      trigger: "text-sm",
                    }}
                  >
                    {roleOptions.map((role) => (
                      <SelectItem key={role.key} value={role.key}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </Select>
                  <DateRangePicker
                    label="Date of Joining"
                    classNames={{
                      label: "text-sm font-medium",
                      input: "text-sm",
                    }}
                  />
                  <DateRangePicker
                    label="Date of Birth"
                    classNames={{
                      label: "text-sm font-medium",
                      input: "text-sm",
                    }}
                  />
                </div>

                <Textarea
                  label="Note"
                  placeholder="Note"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  classNames={{
                    input: "text-sm",
                    label: "text-sm font-medium",
                  }}
                />

                <Select
                  label="Status"
                  placeholder="Select status"
                  selectedKeys={[formData.status]}
                  onSelectionChange={(keys) => {
                    const selectedKey = Array.from(keys)[0];
                    setFormData({ ...formData, status: selectedKey });
                  }}
                  classNames={{
                    label: "text-sm font-medium",
                    trigger: "text-sm",
                  }}
                >
                  {statusOptions.map((status) => (
                    <SelectItem key={status.key} value={status.key}>
                      {status.label}
                    </SelectItem>
                  ))}
                </Select>

                {/* Attachment Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attachment
                  </label>
                  <Card className="border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
                    <CardBody className="p-4">
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="flat"
                          startContent={<Upload size={16} />}
                          className="text-sm"
                        >
                          Upload
                        </Button>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <FileText size={16} />
                          <span>ashraful.pdf</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        *Attach purchase order and
                      </p>
                    </CardBody>
                  </Card>
                </div>
              </div>
            </ModalBody>
            <ModalFooter>
              <Button
                color="default"
                variant="flat"
                onPress={onClose}
                className="px-8"
              >
                Cancel
              </Button>
              <Button
                color="danger"
                onPress={() => {
                  console.log(
                    isEditing ? "Updating employee" : "Adding employee",
                    formData
                  );
                  onClose();
                }}
                className="px-8 bg-red-600"
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
