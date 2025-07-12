"use client";
import { CustomerForm } from "../../../../../Components/Customers/CustomerForm.jsx";
import React from "react";

export default function EditCustomerPage({ params }) {
  const { id } = React.use(params);
  return <CustomerForm isEdit={true} customerId={id} />;
}
