import CustomerDetail from "../../../../Components/Customers/CustomerDetails";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="customers" requiredAction="view">
      <CustomerDetail />
    </PermissionGuard>
  );
};

export default page;
