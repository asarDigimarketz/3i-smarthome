import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import Link from "next/link.js";
import { StatusDropdown } from "../Proposal/status-dropdown.jsx";
import ProposalFilters from "../Proposal/ProposalFilters.jsx";
import { ProjectCards } from "./ProjectCards.jsx";
import { Plus, Search } from "lucide-react";

export function ProjectsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-red-600">Projects</h1>
        <p className="text-gray-500 mt-1">Manage all your projects.</p>
      </div>

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
          <StatusDropdown />

          <Link href="/dashboard/projects/add-project">
            <Button color="danger" radius="sm" startContent={<Plus />}>
              Add New
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-brand-light-red rounded-lg mb-6 p-4">
        <ProposalFilters />
      </div>

      <ProjectCards />
    </div>
  );
}
