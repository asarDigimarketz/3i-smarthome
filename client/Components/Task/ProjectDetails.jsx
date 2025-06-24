"use client";
import { useEffect, useState } from "react";
import { Card } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Calendar, ChevronDown, File } from "lucide-react";
import axios from "axios";
import { addToast } from "@heroui/toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";

const ProjectDetails = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Fetch all projects for the dropdown
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoadingProjects(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

        if (response.data.success) {
          setProjects(response.data.data || []);
        } else {
          console.error("Failed to fetch projects:", response.data.message);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Fetch selected project details
  useEffect(() => {
    const fetchProjectDetails = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${projectId}`,
          {
            headers: {
              "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
            },
          }
        );

        if (response.data.success) {
          setProject(response.data.data);
        } else {
          addToast({
            title: "Error",
            description:
              response.data.message || "Failed to fetch project details",
            color: "danger",
          });
        }
      } catch (error) {
        console.error("Error fetching project:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch project details",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, [projectId]);

  // Handle project selection change
  const handleProjectChange = (selectedId) => {
    if (selectedId) {
      router.push(`/dashboard/task?projectId=${selectedId}`);
    }
  };

  // Project selection dropdown
  const renderProjectSelector = () => (
    <div className="mb-4">
      <Select
        label="Select Project"
        placeholder="Choose a project"
        selectedKeys={projectId ? [projectId] : []}
        onSelectionChange={(keys) => handleProjectChange(Array.from(keys)[0])}
        isLoading={loadingProjects}
        className="w-full"
      >
        {projects && projects.length > 0 ? (
          projects.map((proj) => (
            <SelectItem key={proj._id} value={proj._id}>
              {proj.customerName} - {proj.services}
            </SelectItem>
          ))
        ) : (
          <SelectItem key="no-projects" isDisabled>
            No projects available
          </SelectItem>
        )}
      </Select>
    </div>
  );

  if (loading && projectId) {
    return (
      <Card className="bg-white">
        {renderProjectSelector()}
        <div className="p-4">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-2 w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded mb-4 w-1/4"></div>
            <div className="h-6 bg-gray-200 rounded mb-4 w-1/2"></div>
            <div className="h-px bg-gray-200 my-4"></div>
            {[...Array(8)].map((_, i) => (
              <div key={i} className="mb-3">
                <div className="h-4 bg-gray-200 rounded mb-1 w-1/4"></div>
                <div className="h-5 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!project) {
    return (
      <div className="w-full">
        {renderProjectSelector()}
        <Card className="bg-white">
          <div className="p-4 text-center">
            <h3 className="font-semibold">No Project Selected</h3>
            <p className="text-sm text-gray-500">
              Please select a project from the dropdown above
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // Format the amount with commas and currency symbol
  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(project.projectAmount);

  return (
    <div className="w-full">
      {renderProjectSelector()}
      <Card className="bg-white p-4">
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="font-semibold">{project.customerName}</h3>
              <p className="text-sm text-gray-500">{project.contactNumber}</p>
            </div>
            <ChevronDown className="text-gray-400" />
          </div>
          <p className="text-lg font-semibold mb-4">{formattedAmount}</p>
          <Divider className="my-2" />
          <div className="space-y-2">
            <DetailItem
              label="Address"
              value={project.fullAddress || "Not specified"}
            />
            <DetailItem
              label="Email Id"
              value={project.email || "Not specified"}
            />
            <DetailItem
              label="Description"
              value={project.projectDescription || "Not specified"}
            />
            <DetailItem label="Size" value={project.size || "Not specified"} />
            <DetailItem
              label="Customer"
              value={project.customerName || "Not specified"}
            />
            <DetailItem
              label="Phone Number"
              value={project.contactNumber || "Not specified"}
            />
            <DetailItem
              label="Service"
              value={project.services || "Not specified"}
            />
            <DetailItem
              label="Amount"
              value={formattedAmount || "Not specified"}
            />

            {project.attachment && project.attachment.url && (
              <DetailItem
                label="Attachment"
                value={
                  <div className="flex items-center text-blue-600">
                    <File className="mr-1" />
                    <span>
                      {project.attachment.originalName || "Attachment"}
                    </span>
                  </div>
                }
              />
            )}

            <DetailItem
              label="Date"
              value={
                <div className="flex items-center">
                  <Calendar className="mr-1" />
                  <span>
                    {project.projectDate
                      ? new Date(project.projectDate).toLocaleDateString(
                          "en-GB"
                        )
                      : "Not specified"}
                  </span>
                </div>
              }
            />
          </div>
        </div>
      </Card>
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-sm font-medium block">{value}</span>
  </div>
);

export default ProjectDetails;
