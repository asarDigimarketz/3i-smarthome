import Customers from "../../../Components/Customers/Customers";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="customers" requiredAction="view">
      <Customers />
    </PermissionGuard>
  );
};

export default page;
