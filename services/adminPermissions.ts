/**
 * Admin Permissions System
 * Role-based access control for Zahrah Luxury Admin Panel
 */

// Admin Roles
export type AdminRole = 'super_admin' | 'manager' | 'support' | 'viewer' | 'customer';

// Permission Actions
export type PermissionAction = 'view' | 'create' | 'edit' | 'delete' | 'export';

// Resources
export type Resource =
    | 'products'
    | 'orders'
    | 'customers'
    | 'analytics'
    | 'waitlist'
    | 'pages'
    | 'layout'
    | 'activity_log'
    | 'settings';

// Permission string format: "resource:action"
export type Permission = `${Resource}:${PermissionAction}`;

// Role-Permission Mapping
export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
    super_admin: [
        // Full access to everything
        'products:view', 'products:create', 'products:edit', 'products:delete', 'products:export',
        'orders:view', 'orders:create', 'orders:edit', 'orders:delete', 'orders:export',
        'customers:view', 'customers:create', 'customers:edit', 'customers:delete', 'customers:export',
        'analytics:view', 'analytics:export',
        'waitlist:view', 'waitlist:create', 'waitlist:edit', 'waitlist:delete', 'waitlist:export',
        'pages:view', 'pages:create', 'pages:edit', 'pages:delete',
        'layout:view', 'layout:edit',
        'activity_log:view', 'activity_log:export',
        'settings:view', 'settings:edit',
    ],
    manager: [
        // Full access except settings and layout
        'products:view', 'products:create', 'products:edit', 'products:delete', 'products:export',
        'orders:view', 'orders:create', 'orders:edit', 'orders:export',
        'customers:view', 'customers:export',
        'analytics:view', 'analytics:export',
        'waitlist:view', 'waitlist:edit', 'waitlist:export',
        'pages:view', 'pages:create', 'pages:edit',
        'activity_log:view',
    ],
    support: [
        // View and update orders, view customers
        'products:view',
        'orders:view', 'orders:edit',
        'customers:view',
        'waitlist:view', 'waitlist:edit',
    ],
    viewer: [
        // Read-only access
        'products:view',
        'orders:view',
        'customers:view',
        'analytics:view',
        'waitlist:view',
        'pages:view',
        'activity_log:view',
    ],
    customer: [],
};

// Admin users with their roles
export const ADMIN_USERS: Record<string, AdminRole> = {
    'admin@zahrah.com': 'super_admin',
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: AdminRole | undefined, permission: Permission): boolean {
    if (!role) return false;
    return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role can perform action on resource
 */
export function canPerform(role: AdminRole | undefined, resource: Resource, action: PermissionAction): boolean {
    return hasPermission(role, `${resource}:${action}` as Permission);
}

/**
 * Get all permissions for a role
 */
export function getPermissions(role: AdminRole): Permission[] {
    return ROLE_PERMISSIONS[role] || [];
}

/**
 * Check if user email is an admin
 */
export function isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return email in ADMIN_USERS;
}

/**
 * Get admin role for email
 */
export function getAdminRole(email: string | null | undefined): AdminRole | null {
    if (!email) return null;
    return ADMIN_USERS[email] || null;
}
