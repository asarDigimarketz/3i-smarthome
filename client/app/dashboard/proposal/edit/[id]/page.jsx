"use client";
import { AddProposalPage } from "../../../../../Components/Proposal/AddProposal";
import PermissionGuard from "../../../../../Components/auth/PermissionGuard";
import { useParams } from "next/navigation";

export default function EditProposalPage() {
  const params = useParams();
  const proposalId = params.id;

  return (
    <PermissionGuard requiredPermission="proposal" requiredAction="update">
      <AddProposalPage isEdit={true} proposalId={proposalId} />
    </PermissionGuard>
  );
}
