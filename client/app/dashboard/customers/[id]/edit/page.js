"use client";
import { CustomerForm } from "../../../../../Components/Customers/CustomerForm.jsx";
import PermissionGuard from "../../../../../Components/auth/PermissionGuard";
import React from "react";

export default function EditCustomerPage({ params }) {
  const { id } = React.use(params);
  return (
    <PermissionGuard requiredPermission="customers" requiredAction="update">
      <CustomerForm isEdit={true} customerId={id} />
    </PermissionGuard>
  );
}
