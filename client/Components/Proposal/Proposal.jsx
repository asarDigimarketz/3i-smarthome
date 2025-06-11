"use client";
// import TopHeader from './components/TopHeader'
import { useState } from "react";

import Link from "next/link.js";
import ProposalFilters from "./ProposalFilters.jsx";
import ProposalTable from "./ProposalTable.jsx";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { StatusDropdown } from "./status-dropdown";
import { Plus, Search } from "lucide-react";
import { DateRangePicker } from "@heroui/date-picker";

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState(null);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="flex-1">
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-3xl font-bold text-red-600">Proposal</h1>
            <p className="text-gray-500">Manage all your proposal</p>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="w-full md:w-80">
              <Input
                placeholder="Search customers/Proposal ID ..."
                startContent={<Search className="text-gray-400" />}
                radius="sm"
                variant="bordered"
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-4">
              <DateRangePicker
                label="Filter by Date"
                value={dateRange}
                onChange={setDateRange}
                radius="sm"
                variant="bordered"
                className="w-60"
                classNames={{
                  base: "bg-white",
                  inputWrapper: "border-gray-300 hover:border-gray-400",
                  input: "text-gray-700",
                  label: "text-gray-600",
                }}
              />
              <StatusDropdown />{" "}
              <Link href="/dashboard/proposal/add-proposal">
                <Button color="danger" radius="sm" startContent={<Plus />}>
                  Add New
                </Button>
              </Link>
            </div>
          </div>

          {/* Components with box shadow */}
          <div className="space-y-6 bg-white rounded-xl shadow-lg p-6">
            <div className=" ">
              <ProposalFilters />
            </div>
            <div className="p-6">
              <ProposalTable />
            </div>
            <div className="flex justify-end mt-6">
              <Pagination
                total={8}
                initialPage={1}
                page={currentPage}
                onChange={setCurrentPage}
                showControls
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
