"use client";
import { ChevronDown, Edit3, Eye } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { useState } from "react";

const ProposalTable = () => {
  const [sortDescriptor, setSortDescriptor] = useState();

  const proposals = [
    {
      customerName: "Vinoth R",
      contact: "+91 94536 345357",
      location: "123/ss colont, Thirunagar, Madurai-625018",
      size: "1200 X 3450 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹30,0000",
      status: "Hot",
    },
    {
      customerName: "Varadharajan M",
      contact: "+91 84353 756453",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      size: "1400 X 1950 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹22,0000",
      status: "Cold",
    },
    {
      customerName: "Magesh J",
      contact: "+91 75644 57345",
      location: "34 AC nagar, Goripalayam, Madurai-625002",
      size: "2500 X 1450 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹26,00,000",
      status: "Warm",
    },
    {
      customerName: "Aravind U",
      contact: "+91 85646 976234",
      location: "1A/67 Anbu Nagar, Anna Nagar, Madurai-625018",
      size: "1200 X 3450 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹22,00,000",
      status: "Hot",
    },
    {
      customerName: "Raghul T",
      contact: "+91 9834 578341",
      location: "123/ss colont, Thirunagar, Madurai-625018",
      size: "1200 X 3450 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹30,000",
      status: "Hot",
    },
    {
      customerName: "Dinesh A",
      contact: "+91 84353 756453",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      size: "1200 X 3450 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹36,00,000",
      status: "Cold",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Hot":
        return "bg-red-50 text-red-600 border border-red-200";
      case "Cold":
        return "bg-blue-50 text-blue-600 border border-blue-200";
      case "Warm":
        return "bg-yellow-50 text-yellow-600 border border-yellow-200";
      default:
        return "bg-gray-50 text-gray-600 border border-gray-200";
    }
  };

  const columns = [
    { key: "customerName", label: "Customer Name", allowsSorting: true },
    { key: "contact", label: "Contact" },
    { key: "location", label: "Location" },
    { key: "size", label: "Size" },
    { key: "comment", label: "Comment" },
    { key: "amount", label: "Amount", allowsSorting: true },
    { key: "status", label: "Status", allowsSorting: true },
  ];

  const renderCell = (item, columnKey) => {
    switch (columnKey) {
      case "customerName":
        return (
          <div className="font-semibold text-gray-900 py-2">
            {item[columnKey]}
          </div>
        );
      case "contact":
        return <div className="text-gray-700 py-2">{item[columnKey]}</div>;
      case "location":
        return (
          <div className="text-gray-700 py-2 max-w-[200px]">
            {item[columnKey]}
          </div>
        );
      case "size":
        return <div className="text-gray-700 py-2">{item[columnKey]}</div>;
      case "comment":
        return (
          <div className="flex items-center space-x-2 py-2">
            <span className="text-gray-700">{item[columnKey]}</span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-400 hover:text-gray-600 min-w-unit-6 w-6 h-6"
            >
              <Edit3 className="w-3 h-3" />
            </Button>
          </div>
        );
      case "amount":
        return (
          <div className="flex items-center space-x-2 py-2">
            <span className="font-semibold text-gray-900">
              {item[columnKey]}
            </span>
            <Button
              isIconOnly
              size="sm"
              variant="light"
              className="text-gray-400 hover:text-gray-600 min-w-unit-6 w-6 h-6"
            >
              <Eye className="w-3 h-3" />
            </Button>
          </div>
        );
      case "status":
        return (
          <div className="flex items-center space-x-2 py-2">
            <span
              className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(
                item[columnKey]
              )}`}
            >
              {item[columnKey]}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        );
      default:
        return <div className="text-gray-700 py-2">{item[columnKey]}</div>;
    }
  };

  return (
    <div className="w-full">
      <Table
        aria-label="Proposals table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        removeWrapper
        classNames={{
          base: "w-full bg-white shadow-sm rounded-lg overflow-hidden",
          wrapper: "overflow-x-auto",
          table: "w-full",
          thead: "[&>tr]:first:shadow-none",
          th: [
            "bg-transparent",
            "text-red-500",
            "font-semibold",
            "text-sm",
            "py-3",
            "px-4",
            "border-b",
            "border-gray-200",
            "first:pl-6",
            "last:pr-6",
          ],
          tr: [
            "hover:bg-gray-50",
            "border-b",
            "border-gray-100",
            "transition-colors",
          ],
          td: ["py-0", "px-4", "first:pl-6", "last:pr-6", "border-b-0"],
        }}
      >
        <TableHeader columns={columns}>
          {(column) => (
            <TableColumn
              key={column.key}
              allowsSorting={column.allowsSorting}
              aria-sort={
                sortDescriptor?.column === column.key
                  ? sortDescriptor.direction
                  : undefined
              }
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={proposals}>
          {(item) => (
            <TableRow key={item.customerName} className="h-16">
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProposalTable;
