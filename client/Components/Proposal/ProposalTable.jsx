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
      amount: "₹30,000",
      status: "Hot",
    },
    {
      customerName: "Varadharajan M",
      contact: "+91 84353 756453",
      location: "23/98,selva 1st, Iyerbunglow, Madurai-625015",
      size: "1400 X 1950 sqt",
      comment: "Quotation sent & confirmed",
      amount: "₹22,000",
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
        return "bg-red-100 text-red-800 border-red-200";
      case "Cold":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Warm":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
          <div className="font-medium text-gray-900">{item[columnKey]}</div>
        );
      case "comment":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">{item[columnKey]}</span>
            <button className="text-gray-400 hover:text-gray-600">
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        );
      case "amount":
        return (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              {item[columnKey]}
            </span>
            <button className="text-gray-400 hover:text-gray-600">
              <Eye className="w-4 h-4" />
            </button>
          </div>
        );
      case "status":
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                item[columnKey]
              )}`}
            >
              {item[columnKey]}
            </span>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>
        );
      default:
        return <div className="text-gray-600">{item[columnKey]}</div>;
    }
  };

  return (
    <Table
      aria-label="Proposals table"
      sortDescriptor={sortDescriptor}
      onSortChange={setSortDescriptor}
      className="bg-white rounded-lg shadow-sm border border-gray-200"
      classNames={{
        base: "min-h-[400px] p-0", // Added p-0 to remove padding
        table: "min-w-full",
        thead: "bg-red-50",
        th: "text-red-600 font-semibold p-2",
        tr: "hover:bg-gray-50 transition-colors",
        td: "p-2",
        wrapper: "p-0", // Added wrapper with no padding
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
          <TableRow key={item.customerName}>
            {(columnKey) => (
              <TableCell>{renderCell(item, columnKey)}</TableCell>
            )}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default ProposalTable;
