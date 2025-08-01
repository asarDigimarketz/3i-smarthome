import ProposalDashboard from "../../../Components/Proposal/Proposal";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

export default function Page() {
  return (
    <PermissionGuard requiredPermission="proposal" requiredAction="view">
      <ProposalDashboard />
    </PermissionGuard>
  );
}
