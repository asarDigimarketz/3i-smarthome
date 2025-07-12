"use client";

import React, { useState, useEffect, useRef } from "react";
import { Select, SelectItem } from "@heroui/select";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useSession } from "next-auth/react";
import axios from "axios";
import Image from "next/image";

const General = ({ initialHotelData }) => {
  const { data: session } = useSession();

  // Permission checks based on user's actual permissions
  const [userPermissions, setUserPermissions] = useState({
    hasEditPermission: false,
    hasViewPermission: false,
  });

  const [companyData, setCompanyData] = useState(initialHotelData);
  // const [color, setColor] = useState(initialHotelData.color || "#00569B");
  // const [colorInput, setColorInput] = useState(
  //   initialHotelData.color || "#00569B"
  // );
  const [isLoading, setIsLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState(
    initialHotelData.logoUrl || initialHotelData.logo || null
  );
  const [isImageLoading, setIsImageLoading] = useState(false);
  // const colorInputRef = useRef(null);

  // Check user permissions on component mount
  useEffect(() => {
    const checkUserPermissions = () => {
      if (!session?.user) return;

      // Hotel admin has all permissions
      if (!session.user.isEmployee) {
        setUserPermissions({
          hasEditPermission: true,
          hasViewPermission: true,
        });
        return;
      }

      // Check employee permissions for settings module
      const permissions = session.user.permissions || [];
      const settingsPermission = permissions.find(
        (p) => p.page?.toLowerCase() === "settings"
      );

      if (settingsPermission && settingsPermission.actions) {
        setUserPermissions({
          hasViewPermission: settingsPermission.actions.view || false,
          hasEditPermission: settingsPermission.actions.edit || false,
        });
      }
    };

    checkUserPermissions();
  }, [session]);

  useEffect(() => {
    setCompanyData(initialHotelData);
    // Update logo preview with the full URL if available
    setLogoPreview(initialHotelData.logo);
    // fetchColor(); // Fetch color when component mounts
  }, [initialHotelData]);

  // const fetchColor = async () => {
  //   try {
  //     const response = await axios.get("/api/hotelColor");
  //     if (response.data.success) {
  //       setColor(response.data.color);
  //       setColorInput(response.data.color); // Also update the input field
  //     }
  //   } catch (error) {
  //     console.error("Error fetching color:", error);
  //   }
  // };

  const handleInputChange = (e) => {
    if (!userPermissions.hasEditPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit settings",
        color: "danger",
      });
      return;
    }

    const { name, value } = e.target;

    if (name === "companyName") {
      handleCompanyNameChange(value);
      return;
    }

    setCompanyData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCompanyNameChange = (value) => {
    const prefix = value.slice(0, 3).toLowerCase();
    const newCompanyDb = `${prefix}-${companyData.preferenceId}`.toLowerCase();

    setCompanyData((prevData) => ({
      ...prevData,
      companyName: value,
      companyDb: newCompanyDb,
    }));
  };

  const handleFileChange = async (e) => {
    if (!userPermissions.hasEditPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit settings",
        color: "danger",
      });
      return;
    }

    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        addToast({
          title: "File Size Error",
          description: "File size should be less than 5MB",
          color: "danger",
        });
        return;
      }

      if (!file.type.startsWith("image/")) {
        addToast({
          title: "File Type Error",
          description: "Please upload an image file",
          color: "danger",
        });
        return;
      }

      setIsImageLoading(true);
      setCompanyData((prev) => ({
        ...prev,
        newLogo: file, // Store the file object directly
      }));
      setLogoPreview(URL.createObjectURL(file)); // Create a preview URL for the uploaded image
      setIsImageLoading(false);
    }
  };

  // const handleColorChange = (e) => {
  //   const newColor = e.target.value;
  //   setColorInput(newColor);
  //   if (isValidHexColor(newColor)) {
  //     setColor(newColor);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();

      // Add all company data fields to FormData
      Object.keys(companyData).forEach((key) => {
        if (
          key !== "newLogo" &&
          companyData[key] !== null &&
          companyData[key] !== undefined
        ) {
          formData.append(key, companyData[key]);
        }
      });

      // Add logo file if exists
      if (companyData.newLogo && companyData.newLogo instanceof File) {
        formData.append("logo", companyData.newLogo);
        console.log("Adding logo file to FormData:", companyData.newLogo.name);
      }

      console.log("Sending FormData with entries:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/api/settings/general`,
        formData,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const updatedData = response.data.generalData;
        setCompanyData((prev) => ({
          ...prev,
          ...updatedData,
          newLogo: null,
        }));

        // Update logo preview with the new logoUrl from response
        if (updatedData.logoUrl) {
          setLogoPreview(updatedData.logoUrl);
        }

        addToast({
          title: "Success",
          description: "Company details updated successfully!",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error updating company details:", error);
      addToast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update company details",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // const isValidHexColor = (color) => {
  //   return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
  // };

  // const triggerColorPicker = () => {
  //   colorInputRef.current?.click();
  // };

  const LogoPreview = () => (
    <div className="flex flex-col items-center space-y-4">
      {logoPreview && (
        <div className="relative w-48 h-48 border rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
          {isImageLoading ? (
            <div className="animate-pulse bg-gray-200 w-full h-full" />
          ) : (
            <Image
              src={logoPreview}
              alt="Company Logo"
              width={192}
              height={192}
              className="object-contain"
              onError={() => {
                // toast.error("Error loading image");
                setLogoPreview(null);
              }}
            />
          )}
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Input
          id="logo-upload"
          radius="sm"
          type="file"
          className="w-64"
          variant="bordered"
          classNames={{
            inputWrapper: " h-[50px] border-[#E0E5F2]",
          }}
          placeholder="Upload Logo"
          accept="image/*"
          onChange={handleFileChange}
        />
        {logoPreview && (
          <Button
            color="danger"
            variant="light"
            onClick={() => {
              setLogoPreview(null);
              setCompanyData((prev) => ({ ...prev, newLogo: null }));
            }}
          >
            Remove
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <small className="text-gray-500">
          Recommended: Square image, max 5MB (PNG, JPG)
        </small>
        {/* {userPermissions.hasEditPermission && (
          <Button
            size="sm"
            color="warning"
            variant="light"
            onClick={handleCleanupOldLogos}
            className="text-xs"
          >
            Cleanup Old Logos
          </Button>
        )} */}
      </div>
    </div>
  );

  return (
    <section
      aria-label="General Company Settings"
      className=" mx-auto space-y-8 bg-white rounded-lg p-8 shadow-sm"
    >
      <h2 className="text-2xl font-bold mb-6">Company Details</h2>
      <form
        aria-label="Company Details Form"
        className="space-y-6"
        onSubmit={handleSubmit}
      >
        <div
          aria-label="Logo Upload Section"
          className="flex flex-col items-center mb-8"
        >
          <LogoPreview />
        </div>
        <div aria-label="Company Information" className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="companyName" className="block mb-2">
              Company Name
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="companyName"
              name="companyName"
              placeholder="Company name"
              value={companyData.companyName}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="gstNo" className="block mb-2">
              GST No
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="gstNo"
              name="gstNo"
              placeholder="GST No"
              value={companyData.gstNo}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div aria-label="Contact Information" className="flex space-x-4">
          <div className="w-1/2">
            <label htmlFor="firstName" className="block mb-2">
              Contact Person
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={companyData.firstName}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="lastName" className="block mb-2">
              &nbsp;
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={companyData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div aria-label="Contact Numbers and Email" className="flex space-x-4">
          <div className="w-1/3">
            <label htmlFor="mobileNo" className="block mb-2">
              Mobile No
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="mobileNo"
              name="mobileNo"
              placeholder="Mobile No"
              value={companyData.mobileNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="landlineNo" className="block mb-2">
              Landline No
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="landlineNo"
              name="landlineNo"
              placeholder="Landline No"
              value={companyData.landlineNo}
              onChange={handleInputChange}
            />
          </div>
          <div className="w-1/3">
            <label htmlFor="emailId" className="block mb-2">
              Email ID
            </label>
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              id="emailId"
              name="emailId"
              type="email"
              placeholder="Email ID"
              value={companyData.emailId}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div aria-label="Address Information">
          <label className="block mb-2">Address</label>
          <div aria-label="Street Address" className="flex space-x-4 mb-4">
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="Door No."
              className="w-1/2"
              name="doorNo"
              value={companyData.doorNo}
              onChange={handleInputChange}
            />
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="Street Name"
              className="w-1/2"
              name="streetName"
              value={companyData.streetName}
              onChange={handleInputChange}
            />
          </div>
          <div aria-label="Location Details" className="flex space-x-4 mb-4">
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="Pin code"
              className="w-1/2"
              name="pincode"
              value={companyData.pincode}
              onChange={handleInputChange}
            />
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="District"
              className="w-1/2"
              name="district"
              value={companyData.district}
              onChange={handleInputChange}
            />
          </div>
          <div aria-label="Region Information" className="flex space-x-4">
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="State"
              className="w-1/2"
              name="state"
              value={companyData.state}
              onChange={handleInputChange}
            />
            <Input
              variant="bordered"
              radius="sm"
              classNames={{
                inputWrapper: " h-[50px] border-[#E0E5F2]",
              }}
              placeholder="Country"
              className="w-1/2"
              name="country"
              value={companyData.country}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* <div className="relative">
          <label
            htmlFor="color"
            className="block text-sm font-medium text-gray-700"
          >
            Brand Color
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <Input
              type="text"
              id="color"
              name="color"
              placeholder="#00569B"
              value={colorInput}
              onChange={handleColorChange}
              className={`flex-grow rounded-l-md ${
                !isValidHexColor(colorInput) ? "border-red-500" : ""
              }`}
            />
            <div
              className="inline-flex items-center px-3 border rounded-r-md border-l-0 border-gray-300 cursor-pointer"
              style={{
                backgroundColor: isValidHexColor(colorInput)
                  ? colorInput
                  : color,
              }}
              onClick={triggerColorPicker}
            />
            <input
              type="color"
              ref={colorInputRef}
              value={color}
              onChange={handleColorChange}
              className="hidden"
            />
          </div>
          {!isValidHexColor(colorInput) && (
            <small className="text-red-500">
              Please enter a valid hex color code (e.g., #00569B)
            </small>
          )}
        </div> */}

        <div aria-label="Form Actions" className="flex justify-end">
          <Button
            radius="full"
            className=" bg-primary text-white  w-1/6"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </section>
  );
};

export default General;
