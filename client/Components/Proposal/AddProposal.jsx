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
import { Calendar, Upload } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { addToast } from "@heroui/toast";

export function AddProposalPage({ isEdit = false, proposalId = null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [amountOptions, setAmountOptions] = useState([]);
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
    services: "",
    projectDescription: "",
    projectAmount: "",
    size: "",
    status: "Warm",
    comment: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Fetch proposal data for edit mode
  useEffect(() => {
    if (isEdit && proposalId) {
      fetchProposalData();
    }
  }, [isEdit, proposalId]);

  const fetchProposalData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalId}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        const proposal = response.data.data.proposal;
        setFormData({
          customerName: proposal.customerName || "",
          contactNumber: proposal.contactNumber || "",
          email: proposal.email || "",
          addressLine: proposal.address?.addressLine || "",
          city: proposal.address?.city || "",
          district: proposal.address?.district || "",
          state: proposal.address?.state || "",
          country: proposal.address?.country || "",
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
        });

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

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      const requiredFields = [
        "customerName",
        "contactNumber",
        "email",
        "addressLine",
        "city",
        "district",
        "state",
        "country",
        "pincode",
        "services",
        "projectDescription",
        "projectAmount",
        "size",
      ];
      const missingFields = requiredFields.filter((field) => !formData[field]);
      if (missingFields.length > 0) {
        addToast({
          title: "Error",
          description: `Please fill in all required fields: ${missingFields.join(
            ", "
          )}`,
          color: "danger",
        });
        setLoading(false);
        return;
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
      submitData.append("amountOptions", JSON.stringify(amountOptions));

      // Add file if selected
      if (selectedFile) {
        submitData.append("attachment", selectedFile);
      }

      // Make API call
      const url = isEdit
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/proposals`;

      const method = isEdit ? "put" : "post";

      const response = await axios[method](url, submitData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        },
      });

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
        router.push("/dashboard/proposal");
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

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">
          {isEdit ? "Edit Proposal" : "Add Proposal"}
        </h1>
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
                value={formData.customerName}
                onChange={(e) =>
                  handleInputChange("customerName", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Contact Number *
              </label>
              <Input
                placeholder="Contact Number"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.contactNumber}
                onChange={(e) =>
                  handleInputChange("contactNumber", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Email Id *</label>
              <Input
                placeholder="Email Id"
                type="email"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Date *</label>
              <Input
                placeholder="Date"
                type="date"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                endContent={<Calendar className="text-gray-400" />}
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
                value={formData.addressLine}
                onChange={(e) =>
                  handleInputChange("addressLine", e.target.value)
                }
                required
              />
            </div>

            <div>
              <Input
                placeholder="City/Town/Village"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                placeholder="District"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.district}
                onChange={(e) => handleInputChange("district", e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                placeholder="State"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.state}
                onChange={(e) => handleInputChange("state", e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                placeholder="Country"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                required
              />
            </div>

            <div>
              <Input
                placeholder="Pincode"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.pincode}
                onChange={(e) => handleInputChange("pincode", e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Services *</label>
              <ServicesSelect
                value={formData.services}
                onChange={(value) => handleInputChange("services", value)}
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
                value={formData.projectDescription}
                onChange={(e) =>
                  handleInputChange("projectDescription", e.target.value)
                }
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Project Amount *
              </label>
              <div className="space-y-2">
                <Select
                  placeholder="Select or enter amount"
                  radius="sm"
                  variant="bordered"
                  className="w-full"
                  value={
                    formData.projectAmount
                      ? `₹${parseInt(formData.projectAmount).toLocaleString(
                          "en-IN"
                        )}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue = value.replace(/[^\d]/g, "");
                    handleInputChange("projectAmount", numericValue);
                  }}
                >
                  {amountOptions.map((amount) => (
                    <SelectItem key={amount} value={amount}>
                      {amount}
                    </SelectItem>
                  ))}
                </Select>
                <div className="flex gap-2">
                  <Input
                    placeholder="Or enter custom amount"
                    type="number"
                    radius="sm"
                    variant="bordered"
                    size="sm"
                    className="flex-1"
                    value={formData.projectAmount}
                    onChange={(e) =>
                      handleInputChange("projectAmount", e.target.value)
                    }
                  />
                  <Button
                    size="sm"
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
                      }
                    }}
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Size *</label>
              <div className="flex">
                <Input
                  placeholder="Size"
                  radius="sm"
                  variant="bordered"
                  className="w-full rounded-r-none"
                  value={formData.size}
                  onChange={(e) => handleInputChange("size", e.target.value)}
                  required
                />
                <div className="flex items-center justify-center px-4 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500">
                  Sqt
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Status</label>
              <StatusSelect
                value={formData.status}
                onChange={(value) => handleInputChange("status", value)}
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">Comment</label>
              <Textarea
                placeholder="Comment"
                radius="sm"
                variant="bordered"
                className="w-full"
                value={formData.comment}
                onChange={(e) => handleInputChange("comment", e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2">
              <label className="block text-gray-700 mb-2">
                Project Attachment
              </label>
              <div className="flex items-center gap-4">
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
                    color="danger"
                    radius="sm"
                    startContent={<Upload />}
                    className="cursor-pointer"
                  >
                    Upload
                  </Button>
                </label>
                <span className="text-gray-500 text-sm">
                  {selectedFile
                    ? selectedFile.name
                    : "*Attach project docs/pdf/jpeg/png"}
                </span>
              </div>
            </div>
          </div>

          <Divider className="my-6" />

          <div className="flex justify-end gap-4">
            <Link href="/dashboard/proposal">
              <Button variant="bordered" radius="full" className="px-8">
                Cancel
              </Button>
            </Link>

            <Button
              color="danger"
              radius="full"
              className="px-8"
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
