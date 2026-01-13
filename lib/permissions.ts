import { UserRole } from "@prisma/client";

export type Permission =
  | "view:dashboard"
  | "manage:inventory"
  | "manage:production"
  | "manage:orders"
  | "manage:tours"
  | "view:analytics"
  | "manage:promotions"
  | "view:passport"
  | "admin:all";

const rolePermissions: Record<UserRole, Permission[]> = {
  VISITOR: ["view:dashboard", "view:passport"],
  SHOP: [
    "view:dashboard",
    "manage:inventory",
    "manage:orders",
    "manage:tours",
    "view:analytics",
    "manage:promotions",
  ],
  FARM: [
    "view:dashboard",
    "manage:inventory",
    "manage:production",
    "manage:orders",
    "manage:tours",
    "view:analytics",
  ],
  ADMIN: ["admin:all"],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = rolePermissions[role];
  return permissions.includes("admin:all") || permissions.includes(permission);
}

export function canAccessRoute(role: UserRole, route: string): boolean {
  // Public routes
  if (route.startsWith("/map") || route.startsWith("/tours") || route === "/") {
    return true;
  }

  // Dashboard routes
  if (route.startsWith("/dashboard")) {
    if (route.includes("/production") && !hasPermission(role, "manage:production")) {
      return false;
    }
    if (route.includes("/promotions") && !hasPermission(role, "manage:promotions")) {
      return false;
    }
    if (route.includes("/passport") && role !== UserRole.VISITOR) {
      return false;
    }
    return hasPermission(role, "view:dashboard");
  }

  // Admin routes
  if (route.startsWith("/admin")) {
    return role === UserRole.ADMIN;
  }

  return true;
}
