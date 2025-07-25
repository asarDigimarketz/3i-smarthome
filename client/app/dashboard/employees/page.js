import Employees from "../../../Components/Employees/Employees";
import PermissionGuard from "../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="employees" requiredAction="view">
      <Employees />
    </PermissionGuard>
  );
};

export default page;
