const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.32:5000';
const API_KEY = process.env.EXPO_PUBLIC_API_KEY || 'a05f3614632a268ef4766209e8fb5bfef639572f819c559a79237626fef1d9d6';
// Create a new role
export const createRole = async (roleData) => {
  const response = await fetch(`${API_URL}/api/rolesAndPermission`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify(roleData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Role creation failed');
  return data;
};

// Update an existing role
export const updateRole = async (roleId, roleData) => {
  const response = await fetch(`${API_URL}/api/rolesAndPermission`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ ...roleData, id: roleId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Role update failed');
  return data;
};

// Delete a role
export const deleteRole = async (roleId) => {
  const response = await fetch(`${API_URL}/api/rolesAndPermission`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
    body: JSON.stringify({ id: roleId }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Role deletion failed');
  return data;
};
