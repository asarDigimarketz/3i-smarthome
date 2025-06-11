"use client";
import { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card } from "@heroui/card";
import { ChevronDown, Calendar, Upload } from "lucide-react";
import { Textarea } from "@heroui/input";
import { Divider } from "@heroui/divider";
import Link from "next/link.js";
import { ProjectStatusSelect } from "./ProjectStatusSelect.jsx";
import { ServicesSelect } from "../Proposal/ServiceSelect.jsx";

export function AddProjectPage() {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">Add Project</h1>
      </div>

      <Card className="p-6" shadow="sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2">Customer Name</label>
            <Input
              placeholder="Customer Name"
              radius="sm"
              variant="bordered"
              className="w-full"
              endContent={<ChevronDown className="text-gray-400" />}
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Contact Number</label>
            <Input
              placeholder="Contact Number"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Email Id</label>
            <Input
              placeholder="Email Id"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <Input
              placeholder="Date"
              radius="sm"
              variant="bordered"
              className="w-full"
              endContent={<Calendar className="text-gray-400" />}
            />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 mb-2">Address</label>
          </div>

          <div>
            <Input
              placeholder="Address Line"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="City/Town/Village"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="District"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="State"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="Country"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <Input
              placeholder="Pincode"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">comment</label>
            <Textarea
              placeholder="Comment"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Services</label>
            <ServicesSelect />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">
              Project Description
            </label>
            <Textarea
              placeholder="Project Description"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Size</label>
            <div className="flex">
              <Input
                placeholder="Size"
                radius="sm"
                variant="bordered"
                className="w-full rounded-r-none"
              />
              <div className="flex items-center justify-center px-4 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500">
                Sqt
              </div>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-2">Project Amount</label>
            <Input
              placeholder="Amount"
              radius="sm"
              variant="bordered"
              className="w-full"
            />
          </div>

          <div className="relative">
            <label className="block text-gray-700 mb-2">Status</label>
            <ProjectStatusSelect />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-gray-700 mb-2">
              Project Attachment
            </label>
            <div className="flex items-center gap-4">
              <Button color="danger" radius="sm" startContent={<Upload />}>
                Upload
              </Button>
              <span className="text-gray-500 text-sm">
                *Attach project docs/pdf/jpeg/png
              </span>
            </div>
          </div>
        </div>

        <Divider className="my-6" />

        <div className="flex justify-end gap-4">
          <Link href="/dashboard/projects">
            <Button variant="bordered" radius="full" className="px-8">
              Cancel
            </Button>
          </Link>

          <Button color="danger" radius="full" className="px-8">
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
