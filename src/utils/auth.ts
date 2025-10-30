export const ROLE_HOME_ROUTES = {
  ADMIN: "/admin",
  MASTER: "/admin",
  USER: "/dashboard",
}

export const isAdminOrMaster = (role?: string): boolean => {
  return role === "ADMIN" || role === "MASTER";
};