"use client";
import { CustomerForm } from "../../../../../Components/Customers/CustomerForm.jsx";

export default function EditCustomerPage({ params }) {
  return <CustomerForm isEdit={true} customerId={params.id} />;
}
