"use client";
import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import Link from "next/link";
import { ChevronDown, Home, Plus, Search, Shield, Tv } from "lucide-react";

const customers = [
  {
    id: "1",
    name: "Vinoth R",
    phone: "+91 94536 345357",
    location: "123/ss colont, Thirunager, Madurai-625018",
    services: ["Home Cinema", "Security"],
    amount: "₹30,0000",
  },
  {
    id: "2",
    name: "Varadharajan M",
    phone: "+91 84353 756453",
    location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
    services: ["Home Automation"],
    amount: "₹22,0000",
  },
  {
    id: "3",
    name: "Magesh J",
    phone: "+91 75644 57345",
    location: "34 AC nager, Goripalayam, Madurai-625002",
    services: ["Home Cinema"],
    amount: "₹26,00,000",
  },
  {
    id: "4",
    name: "Aravind U",
    phone: "+91 85646 976234",
    location: "1A/67 Anbu Nager, Anna Nager,Madurai-625018",
    services: ["Security"],
    amount: "₹22,00,000",
  },
  {
    id: "5",
    name: "Raghul T",
    phone: "+91 9834 578341",
    location: "123/ss colont, Thirunager, Madurai-625018",
    services: ["Home Automation"],
    amount: "₹30,0000",
  },
  {
    id: "6",
    name: "Dinesh A",
    phone: "+91 84353 756453",
    location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
    services: ["Security"],
    amount: "₹30,00,000",
  },
];

const Customers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceFilter, setServiceFilter] = useState("all");

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone.includes(searchQuery) ||
      customer.location.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesService =
      serviceFilter === "all" ||
      customer.services.some((service) =>
        service.toLowerCase().includes(serviceFilter.toLowerCase())
      );

    return matchesSearch && matchesService;
  });

  const getServiceIcon = (service) => {
    switch (service) {
      case "Home Cinema":
        return <Tv className="text-blue-500" width={18} />;
      case "Security":
        return <Shield className="text-red-500" width={18} />;
      case "Home Automation":
        return <Home className="text-teal-500" width={18} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Customers</h1>
          <p className="text-default-500">Manage Your Customer Details</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search customers/Contact ..."
          startContent={<Search className="text-default-400" />}
          value={searchQuery}
          onValueChange={setSearchQuery}
          className="w-full sm:max-w-xs"
        />

        <div className="flex gap-2 ml-auto">
          <Dropdown>
            <DropdownTrigger>
              <Button variant="flat" endContent={<ChevronDown width={16} />}>
                Services
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Service filter"
              selectedKeys={new Set([serviceFilter])}
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) setServiceFilter(selected);
              }}
              selectionMode="single"
            >
              <DropdownItem key="all">All Services</DropdownItem>
              <DropdownItem key="home cinema">Home Cinema</DropdownItem>
              <DropdownItem key="home automation">Home Automation</DropdownItem>
              <DropdownItem key="security">Security System</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>

      {/* Customers Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Customers table"
            removeWrapper
            classNames={{
              th: "bg-red-50 text-default-700",
              td: "py-4",
            }}
          >
            <TableHeader>
              <TableColumn>Customer Name</TableColumn>
              <TableColumn>Contact</TableColumn>
              <TableColumn>Location</TableColumn>
              <TableColumn>Services</TableColumn>
              <TableColumn>Amount</TableColumn>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer) => (
                <TableRow
                  key={customer.id}
                  as={Link}
                  href={`/customers/${customer.id}`}
                >
                  <TableCell>
                    <div className="font-medium">{customer.name}</div>
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {customer.location}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {customer.services.map((service, index) => (
                        <div key={index}>{getServiceIcon(service)}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{customer.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  );
};

export default Customers;
