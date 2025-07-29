// Shared customer autocomplete logic for AddProject and AddProposal
import { useState, useCallback } from "react";
import apiClient from "../../lib/axios";

export function useCustomerAutocomplete() {
  const [customerOptions, setCustomerOptions] = useState([]);
  const [emailInput, setEmailInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce function for API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Fetch customers by email or contact
  const fetchCustomers = async (search) => {
    if (!search || search.length < 2) {
      setCustomerOptions([]);
      return;
    }
    setIsSearching(true);
    try {
      const response = await apiClient.get(`/api/customers?search=${encodeURIComponent(search)}`);
      let customers = response.data.data?.customers || [];
      // Filter for matches in either field
      let filtered = customers.filter(
        (c) =>
          (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
          (c.contactNumber && c.contactNumber.includes(search))
      );
      // Prioritize exact matches
      filtered = [
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() === search.toLowerCase() ||
            c.contactNumber === search
        ),
        ...filtered.filter(
          (c) =>
            c.email?.toLowerCase() !== search.toLowerCase() &&
            c.contactNumber !== search
        ),
      ];
      // Deduplicate by _id
      const seen = new Set();
      filtered = filtered.filter((c) => {
        if (seen.has(c._id)) return false;
        seen.add(c._id);
        return true;
      });
      setCustomerOptions(filtered);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setCustomerOptions([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced version
  const debouncedFetchCustomers = useCallback(
    debounce(fetchCustomers, 300),
    []
  );

  // Autofill form fields
  const autofillCustomer = (customer, setFormData) => {
    if (!customer) return;
    setFormData((prev) => ({
      ...prev,
      customerName: customer.customerName || "",
      contactNumber: customer.contactNumber || "",
      email: customer.email || "",
      address: {
        ...prev.address,
        addressLine: customer.address?.addressLine || "",
        city: customer.address?.city || "",
        district: customer.address?.district || "",
        state: customer.address?.state || "",
        country: customer.address?.country || "India",
        pincode: customer.address?.pincode || "",
      },
    }));
    setEmailInput(customer.email || "");
    setContactInput(customer.contactNumber || "");
  };

  // Handle selection
  const handleCustomerSelection = (key, setFormData) => {
    if (!key) {
      setSelectedCustomer(null);
      return;
    }
    const customer = customerOptions.find((c) => c._id === key);
    if (customer) {
      setSelectedCustomer(customer);
      autofillCustomer(customer, setFormData);
    }
  };

  // Handle input changes
  const handleEmailInputChange = useCallback((value, setFormData) => {
    setEmailInput(value);
    setFormData((prev) => ({ ...prev, email: value }));
    if (selectedCustomer && selectedCustomer.email !== value) {
      setSelectedCustomer(null);
    }
    debouncedFetchCustomers(value);
  }, [selectedCustomer, debouncedFetchCustomers]);

  const handleContactInputChange = useCallback((value, setFormData) => {
    setContactInput(value);
    setFormData((prev) => ({ ...prev, contactNumber: value }));
    if (selectedCustomer && selectedCustomer.contactNumber !== value) {
      setSelectedCustomer(null);
    }
    debouncedFetchCustomers(value);
  }, [selectedCustomer, debouncedFetchCustomers]);

  return {
    customerOptions,
    emailInput,
    contactInput,
    selectedCustomer,
    isSearching,
    handleCustomerSelection,
    handleEmailInputChange,
    handleContactInputChange,
  };
}
