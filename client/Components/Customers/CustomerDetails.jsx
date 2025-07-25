"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { ArrowLeft, Edit2, Mail, MapPin, Phone, Plus } from "lucide-react";
import axios from "axios";
import DashboardHeader from "../header/DashboardHeader.jsx";
import { Pagination } from "@heroui/pagination";

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectPage, setProjectPage] = useState(1);
  const [projectTotalPages, setProjectTotalPages] = useState(1);

  // Fetch customer data
  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/customers/${id}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        setCustomer(response.data.data.customer);
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      setError("Failed to fetch customer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCustomer();
    }
  }, [id]);
  const getServiceColor = (service) => {
    switch (service) {
      case "Home Cinema":
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
      case "Home Automation":
        return "bg-gradient-to-br from-[#026BB7] to-[#5DEAFF]";
      case "Security System":
        return "bg-gradient-to-br from-[#014C95] to-[#36B9F6]";
      case "Outdoor Audio Solution":
        return "bg-gradient-to-br from-[#DF2795] to-[#EB7AB7]";
      default:
        return "bg-gradient-to-br from-[#613EFF] to-[#9CBFFF]";
    }
  };
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading customer details...</div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8 text-red-500">
          {error || "Customer not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <DashboardHeader
          title="Customer Details"
          description="View and manage your customers"
        />

        <div className="flex gap-2">
          <Button
            as={Link}
            href="/dashboard/customers"
            variant="flat"
            startContent={<ArrowLeft />}
          >
            Back
          </Button>
          <Button color="primary" startContent={<Plus />}>
            Add
          </Button>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Customer Info */}
        <div className="bg-red-50 border-none rounded-md mb-6">
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between">
              <div>
                <h2 className="text-2xl font-bold">{customer.customerName}</h2>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Phone className="text-primary" width={18} />
                    <span>{customer.contactNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="text-primary" width={18} />
                    <span>{customer.email}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="text-primary mt-1" width={18} />
                    <span>{`${customer.address?.addressLine || ""} , ${
                      customer.address?.city || ""
                    } , ${customer.address?.district || ""} - ${
                      customer.address?.pincode || ""
                    }`}</span>
                  </div>
                </div>
              </div>

              <Link href={`/dashboard/customers/${id}/edit`}>
                <Button isIconOnly variant="light" className="self-start">
                  <Edit2 width={18} />
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#F8F8F8] border-none rounded-xl">
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-default-500">Total Projects</p>
              <p className="text-3xl font-bold">
                {customer.totalProjects || 0}
              </p>
            </div>
          </div>

          <div className="bg-[#F8F8F8] border-none rounded-md">
            <div className="p-6 flex flex-col items-center justify-center">
              <p className="text-default-500">Total amount Spent</p>
              <p className="text-3xl font-bold">
                {customer.formattedTotalSpent ||
                  `₹${customer.totalSpent?.toLocaleString("en-IN") || "0"}`}
              </p>
            </div>
          </div>
        </div>

        {/* Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {customer.projects && customer.projects.length > 0 ? (
            customer.projects
              .slice((projectPage - 1) * 6, projectPage * 6)
              .map((project) => {
                // Ensure service is a string
                let service = Array.isArray(project.services)
                  ? project.services[0] || "Unknown"
                  : project.services || "Unknown";
                // Ensure progress is a string in the format completedTasks/totalTasks
                let progress = "0/0";
                if (
                  typeof project.completedTasks === "number" &&
                  typeof project.totalTasks === "number"
                ) {
                  progress = `${project.completedTasks}/${project.totalTasks}`;
                } else if (typeof project.progress === "string") {
                  progress = project.progress;
                } else if (typeof project.progress === "number") {
                  progress = `${project.progress}%`;
                }
                // Ensure assignedEmployees is always an array
                let assignedEmployees = Array.isArray(project.assignedEmployees)
                  ? project.assignedEmployees
                  : [];
                return (
                  <ProjectCard
                    key={project._id}
                    id={project._id}
                    customer={customer.customerName}
                    status={project.projectStatus}
                    service={service}
                    amount={`₹${
                      project.projectAmount?.toLocaleString("en-IN") || "0"
                    }`}
                    date={new Date(project.projectDate).toLocaleDateString()}
                    address={`${project.address?.addressLine || ""} , ${
                      project.address?.city || ""
                    } , ${project.address?.district || ""} - ${
                      project.address?.pincode || ""
                    }`}
                    progress={progress}
                    assignedEmployees={project.assignedEmployees || []}
                    color={getServiceColor(service)}
                  />
                );
              })
          ) : (
            <div className="col-span-2 text-center py-8 text-gray-500">
              No projects found for this customer
            </div>
          )}
        </div>
        {customer.projects && customer.projects.length > 6 && (
          <div className="flex justify-center mt-6">
            <Pagination
              total={Math.ceil(customer.projects.length / 6)}
              page={projectPage}
              onChange={setProjectPage}
              showControls
              radius="sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
