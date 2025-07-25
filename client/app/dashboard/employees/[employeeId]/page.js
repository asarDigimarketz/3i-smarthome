import EmployeeDetail from "../../../../Components/Employees/EmployeeDetails";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";

const page = () => {
  return (
    <PermissionGuard requiredPermission="employees" requiredAction="view">
      <EmployeeDetail />
    </PermissionGuard>
  );
};

export default page;
