import { AddProposalPage } from "../../../../Components/Proposal/AddProposal";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="proposal" requiredAction="create">
      <AddProposalPage />
    </PermissionGuard>
  );
};

export default page;
