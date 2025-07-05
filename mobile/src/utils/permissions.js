// Permission utility functions for mobile app

// Permission actions
export const PERMISSION_ACTIONS = {
  VIEW: 'view',
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'delete'
};

// Page permissions mapping
export const PAGE_PERMISSIONS = {
  '/': 'Dashboard',
  '/proposal': 'Proposals',
  '/projects': 'Projects',
  '/tasks': 'Tasks',
  '/customer': 'Customers',
  '/employee': 'Employees',
  '/notifications': 'Notifications',
  '/settings': 'Settings',
  '/settings/Employee': 'Employee Settings',
  '/settings/EmailConfigure': 'Email Configuration',
  '/settings/NotificationConfigure': 'Notification Configuration'
};

export const URL_TO_ROUTE = {
  '/dashboard': 'index',
  '/dashboard/proposals': 'proposal',
  '/dashboard/projects': 'projects',
  '/dashboard/tasks': 'tasks',
  '/dashboard/customers': 'customer',
  // Add more as needed
};

export function mapUrlToTabRoute(url) {
  return URL_TO_ROUTE[url] || null;
}

/**
 * Check if user has permission for a specific page and action
 * @param {Object} user - User object with permissions
 * @param {string} page - Page to check permission for
 * @param {string} action - Action to check (view, add, edit, delete)
 * @returns {boolean} - Whether user has permission
 */
export const hasPermission = (user, page, action = 'view') => {
  if (!user || !user.permissions) return false;
  const permission = user.permissions.find(p => p.page === page);
  if (!permission) return false;
  return permission.actions[action] === true;
};

/**
 * Check if user can access a specific route
 * @param {Object} user - User object with permissions
 * @param {string} route - Route to check
 * @param {string} action - Action to check (default: view)
 * @returns {boolean} - Whether user can access the route
 */
export const canAccessRoute = (user, route, action = 'view') => {
  const page = PAGE_PERMISSIONS[route];
  if (!page) return true;
  return hasPermission(user, page, action);
};

/**
 * Get user's accessible routes based on permissions
 * @param {Object} user - User object with permissions
 * @returns {Array} - Array of accessible routes
 */
export const getAccessibleRoutes = (user) => {
  if (!user || !user.permissions) return [];
  // Return the URLs from the user's permissions where view is true
  return user.permissions
    .filter(p => p.actions && p.actions.view === true && p.url)
    .map(p => p.url);
};

/**
 * Filter menu items based on user permissions (uses url property if present)
 * @param {Array} menuItems - Array of menu items
 * @param {Object} user - User object with permissions
 * @returns {Array} - Filtered menu items
 */
export const filterMenuItemsByPermissions = (menuItems, user) => {
  if (!user || !user.permissions) return [];
  return menuItems.filter(item => {
    const url = item.url || item.route;
    return user.permissions.some(
      p => (p.url === url || p.page === PAGE_PERMISSIONS[url]) && p.actions.view === true
    );
  });
};

/**
 * Check if user can perform action on a specific page
 * @param {Object} user - User object with permissions
 * @param {string} page - Page name
 * @param {string} action - Action to check
 * @returns {boolean} - Whether user can perform the action
 */
export const canPerformAction = (user, page, action) => {
  return hasPermission(user, page, action);
};

/**
 * Check if user has permission for a specific url (for page guards)
 * @param {Object} user - User object with permissions
 * @param {string} url - The url to check (should match permission url)
 * @param {string} action - Action to check (default: view)
 * @returns {boolean}
 */
export function hasPagePermission(user, url, action = 'view') {
  if (!user || !user.permissions) return false;
  return user.permissions.some(
    p => (p.url === url || p.page === PAGE_PERMISSIONS[url]) && p.actions && p.actions[action]
  );
}

export function getPageActions(user, url) {
  if (!user || !user.permissions) return {};
  const perm = user.permissions.find(
    p => (p.url === url || p.page === PAGE_PERMISSIONS[url])
  );
  return perm ? perm.actions : {};
} 