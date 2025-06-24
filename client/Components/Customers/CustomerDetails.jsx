"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import ProjectCard from "../Dashboard/ProjectCard.jsx";
import { ArrowLeft, Edit2, Mail, MapPin, Phone, Plus } from "lucide-react";
import axios from "axios";

const CustomerDetail = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <div>
          <h1 className="text-2xl font-bold text-primary">Customer Details</h1>
          <p className="text-default-500">Manage Customer List</p>
        </div>

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

      {/* Customer Info */}
      <Card className="bg-red-50 border-none">
        <CardBody className="p-6">
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
                  <span>{customer.fullAddress}</span>
                </div>
              </div>
            </div>

            <Link href={`/dashboard/customers/${id}/edit`}>
              <Button isIconOnly variant="light" className="self-start">
                <Edit2 width={18} />
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-50 border-none">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-default-500">Total Projects</p>
            <p className="text-3xl font-bold">{customer.totalProjects || 0}</p>
          </CardBody>
        </Card>

        <Card className="bg-gray-50 border-none">
          <CardBody className="p-6 flex flex-col items-center justify-center">
            <p className="text-default-500">Total amount Spent</p>
            <p className="text-3xl font-bold">
              {customer.formattedTotalSpent ||
                `₹${customer.totalSpent?.toLocaleString("en-IN") || "0"}`}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {customer.projects && customer.projects.length > 0 ? (
          customer.projects.map((project) => (
            <ProjectCard
              key={project._id}
              id={project._id}
              customer={customer.customerName}
              status={project.projectStatus}
              service={project.services}
              amount={`₹${
                project.projectAmount?.toLocaleString("en-IN") || "0"
              }`}
              date={new Date(project.projectDate).toLocaleDateString()}
              address={customer.fullAddress}
              progress={project.progress || "0%"}
              color="bg-blue-500"
            />
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            No projects found for this customer
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
