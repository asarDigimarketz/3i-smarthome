"use client";

import React, { useState, useEffect } from "react";
import { Trash2, Edit, Check, Plus } from "lucide-react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import apiClient from "../../../lib/axios";
import RolesResponsibilitySkeleton from "./RolesResponsibilitySkeleton";
import PermissionGuard from "../../auth/PermissionGuard";
import { DeleteConfirmModal } from "../../ui/delete-confirm-modal.jsx";
import { usePermissions } from "../../../lib/utils";

// All available pages in the system
const permissions = [
  "Dashboard",
  "Employees",
  "Customers",
  "Projects",
  "Proposals",
  "Tasks",
];

const actions = ["View", "Create", "Edit", "Delete"];

export default function RolesResponsibility() {
  const { 
    canCreate, 
    canEdit, 
    canDelete, 
    canView,
    getUserPermissions 
  } = usePermissions();

  // Get permissions using the hook
  const userPermissions = getUserPermissions("settings");

  const [role, setRole] = useState("");
  const [permissionsState, setPermissionsState] = useState({});
  const [roles, setRoles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

  useEffect(() => {
    if (canView("settings")) {
      fetchRoles();
    }
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get(`/api/rolesAndPermission`);
      setRoles(response.data.roles);
    } catch (error) {
      console.error("Error fetching roles:", error);
      addToast({
        title: "Error",
        description: "Failed to fetch roles. Please try again.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <RolesResponsibilitySkeleton />;
  }

  const handlePermissionChange = (description, action) => {
    setPermissionsState((prev) => {
      const currentState = { ...prev };

      // If selecting any action other than View, ensure View is also selected
      if (action !== "View") {
        const newActionState = !(currentState[description]?.[action] || false);
        return {
          ...currentState,
          [description]: {
            ...currentState[description],
            [action]: newActionState,
            // Force View to be true if any other permission is being enabled
            View: newActionState
              ? true
              : // If disabling an action, keep View true if any other action is still enabled
                currentState[description]?.Create ||
                currentState[description]?.Edit ||
                currentState[description]?.Delete ||
                currentState[description]?.View,
          },
        };
      }

      // If unchecking View, uncheck all other permissions as well
      if (action === "View" && !!currentState[description]?.View) {
        return {
          ...currentState,
          [description]: {
            View: false,
            Create: false,
            Edit: false,
            Delete: false,
          },
        };
      }

      // Normal View toggle if enabling View
      return {
        ...currentState,
        [description]: {
          ...currentState[description],
          [action]: !(currentState[description]?.[action] || false),
        },
      };
    });
  };

  const handleSubmit = async () => {
    if (!role.trim()) {
      addToast({
        title: "Validation Error",
        description: "Role name is required",
        color: "danger",
      });
      return;
    }

    // Check permissions before submitting
    if (isEditing && !userPermissions.hasEditPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit roles",
        color: "danger",
      });
      return;
    }

    if (!isEditing && !userPermissions.hasAddPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to add roles",
        color: "danger",
      });
      return;
    }

    // Validate that at least one permission is selected
    const hasAnyPermission = Object.values(permissionsState).some((pagePerms) =>
      Object.values(pagePerms).some((action) => action)
    );

    if (!hasAnyPermission) {
      addToast({
        title: "Validation Error",
        description: "Please select at least one permission for this role",
        color: "danger",
      });
      return;
    }

    const roleData = {
      role,
      permissions: Object.entries(permissionsState)
        .map(([page, actions]) => ({
          page,
          url:
            page === "Dashboard"
              ? `/dashboard`
              : `/dashboard/${page.toLowerCase()}`,
          actions: {
            view: actions.View || false,
            add: actions.Create || false,
            edit: actions.Edit || false,
            delete: actions.Delete || false,
          },
        }))
        .filter((permission) =>
          // Only include pages that have at least one permission enabled
          Object.values(permission.actions).some((action) => action)
        ),
    };

    try {
      if (isEditing) {
        await apiClient.put(`/api/rolesAndPermission`, { ...roleData, id: editId });
        addToast({
          title: "Success",
          description: "Role updated successfully!",
          color: "success",
        });
      } else {
        await apiClient.post(`/api/rolesAndPermission`, roleData);
        addToast({
          title: "Success",
          description: "Role added successfully!",
          color: "success",
        });
      }
      fetchRoles();
      resetForm();
    } catch (error) {
      console.error("Error submitting role:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      addToast({
        title: "Error",
        description: isEditing
          ? `Failed to update role: ${errorMessage}`
          : `Failed to add role: ${errorMessage}`,
        color: "danger",
      });
    }
  };

  const handleEdit = (role) => {
    if (!userPermissions.hasEditPermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to edit roles",
        color: "danger",
      });
      return;
    }
    setRole(role.role);
    const editPermissions = role.permissions.reduce((acc, permission) => {
      acc[permission.page] = {
        View: permission.actions.view || false,
        Create: permission.actions.add || false,
        Edit: permission.actions.edit || false,
        Delete: permission.actions.delete || false,
      };
      return acc;
    }, {});
    setPermissionsState(editPermissions);
    setIsEditing(true);
    setEditId(role._id);
  };

  const handleDeleteClick = (role) => {
    if (!userPermissions.hasDeletePermission) {
      addToast({
        title: "Access Denied",
        description: "You don't have permission to delete roles",
        color: "danger",
      });
      return;
    }
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    try {
      await apiClient.delete(`/api/rolesAndPermission`, { data: { id: roleToDelete._id } });
      addToast({
        title: "Success",
        description: "Role deleted successfully!",
        color: "success",
      });
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Unknown error occurred";
      addToast({
        title: "Error",
        description: `Failed to delete role: ${errorMessage}`,
        color: "danger",
      });
    } finally {
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };

  const resetForm = () => {
    setRole("");
    setPermissionsState({});
    setIsEditing(false);
    setEditId(null);
  };

  return (
    <PermissionGuard requiredPermission="settings" requiredAction="view">
      <div className="mx-auto space-y-8 bg-white rounded-lg p-4 md:p-8 shadow-sm min-h-[811px]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary">
              Roles & Responsibilities
            </h1>
            <p className="text-default-500">
              Manage user roles and permissions
            </p>
          </div>
        </div>

        <main>
          {/* Show form only if user has add or edit permission */}
          {(userPermissions.hasAddPermission ||
            userPermissions.hasEditPermission) && (
            <div className="mb-8 p-6 border rounded-lg bg-gray-50">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">
                {isEditing ? "Edit Role" : "Add New Role"}
              </h2>

              <div className="mb-6">
                <label
                  htmlFor="role"
                  className="block mb-2 font-semibold text-gray-700"
                >
                  Role Name
                </label>
                <Input
                  id="role"
                  placeholder="Enter role name (e.g., Manager, Technician, etc.)"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  variant="bordered"
                  radius="sm"
                  classNames={{
                    inputWrapper: " h-[50px] border-[#E0E5F2]",
                  }}
                  className="max-w-md"
                  isInvalid={!role.trim() && role !== ""}
                  errorMessage={
                    !role.trim() && role !== "" ? "Role name is required" : ""
                  }
                />
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">
                  Permissions
                </h3>
                <div className="rounded-lg overflow-hidden border">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary">
                        <th className="p-3 text-left font-semibold text-white">
                          Module
                        </th>
                        {actions.map((action) => (
                          <th
                            key={action}
                            className="p-3 text-center font-semibold text-white"
                          >
                            {action}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {permissions.map((description, index) => (
                        <tr
                          key={description}
                          className={`border-b border-gray-200 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          } hover:bg-blue-50 transition-colors`}
                        >
                          <td className="p-3 text-gray-700 font-medium">
                            {description}
                          </td>
                          {actions.map((action) => (
                            <td
                              key={`${description}-${action}`}
                              className="p-3 text-center"
                            >
                              <button
                                type="button"
                                className="w-6 h-6 mx-auto flex items-center justify-center hover:scale-110 transition-transform"
                                onClick={() =>
                                  handlePermissionChange(description, action)
                                }
                              >
                                {permissionsState[description]?.[action] ? (
                                  <Check className="w-6 h-6 text-green-500" />
                                ) : (
                                  <div className="w-6 h-6 border-2 border-gray-300 rounded hover:border-gray-400 transition-colors" />
                                )}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  className="bg-primary hover:bg-primary/90 text-white"
                  onClick={handleSubmit}
                  startContent={
                    isEditing ? (
                      <Edit className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )
                  }
                >
                  {isEditing ? "Update Role" : "Add Role"}
                </Button>
                {isEditing && (
                  <Button variant="flat" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Roles List */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              Existing Roles ({roles.length})
            </h2>
            {roles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-4">👥</div>
                <p>No roles found. Create your first role to get started.</p>
              </div>
            ) : (
              <div className="rounded-lg overflow-hidden border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-primary">
                      <th className="p-3 text-left font-semibold text-white">
                        No
                      </th>
                      <th className="p-3 text-left font-semibold text-white">
                        Role
                      </th>
                      <th className="p-3 text-left font-semibold text-white">
                        Permissions
                      </th>
                      <th className="p-3 text-right font-semibold text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((role, index) => (
                      <tr
                        key={role._id}
                        className={`border-b border-gray-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50"
                        } hover:bg-blue-50 transition-colors`}
                      >
                        <td className="p-3 text-gray-700">{index + 1}</td>
                        <td className="p-3 text-gray-700 font-medium">
                          {role.role}
                        </td>
                        <td className="p-3 text-gray-700">
                          <div className="space-y-1">
                            {role.permissions.map((permission) => {
                              const enabledActions = Object.entries(
                                permission.actions
                              )
                                .filter(([, value]) => value)
                                .map(
                                  ([key]) =>
                                    key.charAt(0).toUpperCase() + key.slice(1)
                                );

                              return enabledActions.length > 0 ? (
                                <div key={permission.page} className="text-sm">
                                  <span className="font-medium text-primary">
                                    {permission.page}:
                                  </span>{" "}
                                  <span className="text-gray-600">
                                    {enabledActions.join(", ")}
                                  </span>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex justify-end gap-1">
                            {userPermissions.hasEditPermission && (
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onClick={() => handleEdit(role)}
                                className="hover:bg-blue-100"
                              >
                                <Edit className="h-4 w-4 text-blue-600" />
                              </Button>
                            )}
                            {userPermissions.hasDeletePermission && (
                              <Button
                                isIconOnly
                                variant="light"
                                size="sm"
                                onClick={() => handleDeleteClick(role)}
                                className="hover:bg-red-100"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
          title="Confirm Role Deletion"
          description={
            <>
              Are you sure you want to delete the role{" "}
              <strong>&quot;{roleToDelete?.role}&quot;</strong>?
              <br />
              <br />
              <span className="text-red-600 font-medium">
                ⚠️ Warning: This action cannot be undone and will also delete
                all associated employee accounts.
              </span>
            </>
          }
          confirmText="Delete Role"
          cancelText="Cancel"
        />
      </div>
    </PermissionGuard>
  );
}
