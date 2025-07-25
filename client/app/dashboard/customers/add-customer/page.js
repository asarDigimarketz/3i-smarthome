"use client";
import { CustomerForm } from "../../../../Components/Customers/CustomerForm.jsx";
import PermissionGuard from "../../../../Components/auth/PermissionGuard";

export default function AddCustomerPage() {
  return (
    <PermissionGuard requiredPermission="customers" requiredAction="create">
      <CustomerForm isEdit={false} />
    </PermissionGuard>
  );
}
