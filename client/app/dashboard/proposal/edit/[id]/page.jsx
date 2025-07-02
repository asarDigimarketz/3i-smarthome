"use client";
import { AddProposalPage } from "../../../../../Components/Proposal/AddProposal";
import { useParams } from "next/navigation";

export default function EditProposalPage() {
  const params = useParams();
  const proposalId = params.id;

  return <AddProposalPage isEdit={true} proposalId={proposalId} />;
}
