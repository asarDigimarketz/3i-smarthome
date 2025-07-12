"use client";
import { ChevronDown, Edit3, Eye, Check, X, Edit } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableColumn,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import ProposalDetailsModal from "./ProposalDetailsModal";
import { addToast } from "@heroui/toast";

const ProposalTable = ({
  searchQuery,
  statusFilter,
  dateRange,
  serviceFilter,
  page = 1,
  setTotalPages = () => {},
}) => {
  const router = useRouter();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortDescriptor, setSortDescriptor] = useState();
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCell, setEditingCell] = useState({ row: null, column: null });
  const [editValue, setEditValue] = useState("");

  // Fetch proposals from API
  const fetchProposals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      // Add search parameter
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      // Add status filter
      if (statusFilter) {
        params.append("status", statusFilter);
      }

      // Add date range filter
      if (dateRange && dateRange.start && dateRange.end) {
        params.append("dateFrom", dateRange.start.toString());
        params.append("dateTo", dateRange.end.toString());
      }

      // Add service filter
      if (serviceFilter) {
        params.append("service", serviceFilter);
      }

      // Add pagination
      params.append("page", page);
      params.append("limit", "5"); // Get more records for table
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals?${params.toString()}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );
      if (response.data.success) {
        setProposals(response.data.data.proposals);
        if (setTotalPages && response.data.data.pagination) {
          setTotalPages(response.data.data.pagination.total || 1);
        }
      }
    } catch (error) {
      console.error("Error fetching proposals:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch proposals",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch proposals on component mount and when filters/page change
  useEffect(() => {
    fetchProposals();
  }, [searchQuery, statusFilter, dateRange, serviceFilter, page]);

  const handleRowClick = (proposal) => {
    // Only open modal if we're not currently editing
    if (!editingCell.row && !editingCell.column) {
      setSelectedProposal(proposal);
      setIsModalOpen(true);
    }
  };

  const handleStartEdit = (e, item, columnKey) => {
    if (e && typeof e.stopPropagation === "function") {
      e.stopPropagation();
    }
    setEditingCell({ row: item._id, column: columnKey });

    // Set appropriate edit value based on column type
    if (columnKey === "projectAmount") {
      setEditValue(item.projectAmount?.toString() || "0");
    } else {
      setEditValue(item[columnKey] || "");
    }
  };

  const handleSaveEdit = async (item) => {
    try {
      let updateData = {
        field: editingCell.column,
        value: editValue,
      };

      // If updating project amount, also update amountOptions
      if (editingCell.column === "projectAmount") {
        const currentAmountFormatted = `₹${parseInt(editValue).toLocaleString(
          "en-IN"
        )}`;
        const currentAmountOptions = item.amountOptions || [];

        if (!currentAmountOptions.includes(currentAmountFormatted)) {
          updateData.amountOptions = [
            ...currentAmountOptions,
            currentAmountFormatted,
          ];
        }
      }

      const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${item._id}/field`,
        updateData,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        // Update local state
        setProposals((prev) =>
          prev.map((proposal) =>
            proposal._id === item._id
              ? {
                  ...proposal,
                  [editingCell.column]:
                    editingCell.column === "projectAmount"
                      ? parseInt(editValue)
                      : editValue,
                  ...(updateData.amountOptions && {
                    amountOptions: updateData.amountOptions,
                  }),
                }
              : proposal
          )
        );

        setEditingCell({ row: null, column: null });
        setEditValue("");

        addToast({
          title: "Success",
          description: "Proposal updated successfully",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error updating proposal:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to update proposal",
        color: "danger",
      });
    }
  };

  const handleCancelEdit = (e) => {
    setEditingCell({ row: null, column: null });
    setEditValue("");
  };

  const handleDelete = async (proposalId) => {
    if (!confirm("Are you sure you want to delete this proposal?")) {
      return;
    }

    try {
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/api/proposals/${proposalId}`,
        {
          headers: {
            "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
          },
        }
      );

      if (response.data.success) {
        // Remove from local state
        setProposals((prev) =>
          prev.filter((proposal) => proposal._id !== proposalId)
        );
        addToast({
          title: "Success",
          description: "Proposal deleted successfully",
          color: "success",
        });
      }
    } catch (error) {
      console.error("Error deleting proposal:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to delete proposal",
        color: "danger",
      });
    }
  };

  // Exact colors from your design system
  const getStatusColor = (status) => {
    switch (status) {
      case "Hot":
        return "#C92125"; // Exact red from image
      case "Cold":
        return "#00AED6"; // Exact cyan from image
      case "Warm":
        return "#FDEBB0"; // Exact warm color from image
      case "Scrap":
        return "#999999"; // Exact gray from image
      case "Confirmed":
        return "#BEEED0"; // Exact green from image
      default:
        return "#6B7280"; // Default gray
    }
  };

  const getStatusBackgroundColor = (status) => {
    switch (status) {
      case "Hot":
        return "#F7DBDD"; // Exact light pink from image
      case "Cold":
        return "#D9FCFF"; // Exact light cyan from image
      case "Warm":
        return "#FFDEB0"; // Exact light orange from image
      case "Scrap":
        return "#999999"; // Light gray for scrap
      case "Confirmed":
        return "#BEEED0"; // Exact light green from image
      default:
        return "#F3F4F6"; // Default light gray
    }
  };

  const getServiceBackgroundColor = (service) => {
    if (!service) return "#FAE9EA"; // White for no service

    switch (service) {
      case "Home Cinema":
        return "#F3F3FF"; // Exact light purple from image
      case "Home Automation":
        return "#E8FAFF"; // Exact light blue from image
      case "Security System":
        return "#DEF2FF"; // Exact light blue from image (same as Home Automation)
      case "Outdoor Audio Solution":
        return "#FFE9F6"; // Exact light cream/yellow from image
      default:
        return "#FAE9EA"; // White for unknown services
    }
  };

  const columns = [
    { key: "customerName", label: "Customer Name", allowsSorting: true },
    { key: "contactNumber", label: "Contact" },
    { key: "fullAddress", label: "Location" },
    { key: "size", label: "Size" },
    { key: "comment", label: "Comment" },
    { key: "formattedAmount", label: "Amount", allowsSorting: true },
    { key: "status", label: "Status", allowsSorting: true },
  ];

  const renderCell = (item, columnKey) => {
    const isEditing =
      editingCell.row === item._id && editingCell.column === columnKey;

    switch (columnKey) {
      case "customerName":
        return (
          <div className="font-semibold text-gray-900">{item[columnKey]}</div>
        );
      case "contactNumber":
        return <div className="text-gray-700">{item[columnKey]}</div>;
      case "fullAddress":
        return (
          <div className="text-gray-700 max-w-[200px]">
            {item.address
              ? `${item.address.addressLine}, ${item.address.city}, ${item.address.district}, ${item.address.state} - ${item.address.pincode}`
              : "N/A"}
          </div>
        );
      case "size":
        return <div className="text-gray-700">{item[columnKey]} sqt</div>;
      case "comment":
        return (
          <div className="flex items-center space-x-2">
            <span className="text-gray-700">
              {item[columnKey] || "No comment"}
            </span>
          </div>
        );
      case "formattedAmount":
        return (
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">
              ₹{item.projectAmount?.toLocaleString("en-IN") || "0"}
            </span>
          </div>
        );
      case "status":
        return (
          <div className="flex items-center space-x-2">
            <span
              className="px-3 py-1 rounded-md text-xs font-medium border cursor-pointer"
              style={{
                color: "#383838",
                backgroundColor: getStatusBackgroundColor(item[columnKey]),
                borderColor: getStatusColor(item[columnKey]) + "33", // 20% opacity border
              }}
              onClick={(e) => handleStartEdit(e, item, columnKey)}
            >
              {item[columnKey]}
            </span>
          </div>
        );
      default:
        return <div className="text-gray-700">{item[columnKey]}</div>;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Loading proposals...</div>
      </div>
    );
  }

  // Get header background color based on service filter
  const getHeaderBackgroundColor = () => {
    if (!serviceFilter) return "#FAE9EA"; // White for "All" or no filter

    switch (serviceFilter) {
      case "Home Cinema":
        return "#F3F3FF"; // Light purple
      case "Home Automation":
        return "#E8FAFF"; // Light blue
      case "Security System":
        return "#DEF2FF"; // Light blue (same as Home Automation)
      case "Outdoor Audio Solution":
        return "#FFE9F6"; // Light cream/yellow
      default:
        return "#FAE9EA"; // White for unknown services
    }
  };

  // Get header text color based on service filter
  const getHeaderTextColor = () => {
    if (!serviceFilter) return "#C92125"; // Primary red for "All"

    switch (serviceFilter) {
      case "Home Cinema":
        return "#5500FF"; // Purple
      case "Home Automation":
        return "#00A8D6"; // Blue
      case "Security System":
        return "#0068AD"; // Blue
      case "Outdoor Audio Solution":
        return "#DB0A89"; // Pink
      default:
        return "#C92125"; // Primary red for unknown services
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
      <Table
        aria-label="Proposals table"
        sortDescriptor={sortDescriptor}
        onSortChange={setSortDescriptor}
        removeWrapper
        classNames={{
          base: "w-full bg-white shadow-sm rounded-lg overflow-hidden",
          wrapper: "overflow-x-auto",
          table: "w-full min-w-[700px]", // Ensures horizontal scroll on small screens
          thead: "[&>tr]:first:shadow-none ",
          th: [
            "font-medium",
            "text-sm",
            "py-4",
            "px-6",
            "first:pl-6",
            "last:pr-6",
            "whitespace-nowrap",
            "transition-colors",
            "duration-200",
            "text-primary-600",
            "bg-gray-50",
            "!rounded-none", // Force remove any border radius
          ],
          tr: [
            "group",
            "border-b",
            "border-gray-200",
            "transition-colors",
            "hover:opacity-90",
          ],
          td: [
            "px-6",
            "py-4",
            "first:pl-6",
            "last:pr-6",
            "border-b-0",
            "text-sm",
            "max-w-[220px]",
            "break-words",
          ],
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
              style={{
                backgroundColor: getHeaderBackgroundColor(),
                color: getHeaderTextColor(),
              }}
            >
              {column.label}
            </TableColumn>
          )}
        </TableHeader>
        <TableBody items={proposals} emptyContent="No proposals found">
          {(item) => (
            <TableRow
              key={item._id}
              className="h-16 cursor-pointer"
              onClick={() => handleRowClick(item)}
              style={{
                backgroundColor: getServiceBackgroundColor(item.services),
              }}
            >
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      {selectedProposal && (
        <ProposalDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          proposalData={selectedProposal}
          onUpdate={fetchProposals}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default ProposalTable;
