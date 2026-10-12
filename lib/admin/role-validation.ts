export type UserRole = "CITIZEN" | "FIELD_WORKER" | "MANAGER" | "ADMIN";

export function getAllowedRoleTransitions(currentRole: UserRole): UserRole[] {
  if (currentRole === "ADMIN") {
    return ["CITIZEN", "FIELD_WORKER"];
  }

  if (currentRole === "MANAGER") {
    return ["CITIZEN", "FIELD_WORKER"];
  }

  if (currentRole === "FIELD_WORKER") {
    return ["CITIZEN", "MANAGER"];
  }

  return ["FIELD_WORKER", "MANAGER"];
}

export function isRoleChangeAllowed(currentRole: UserRole, nextRole: UserRole): boolean {
  return getAllowedRoleTransitions(currentRole).includes(nextRole);
}

export function isDepartmentAssignmentAllowed(role: UserRole, departmentId: string | null): boolean {
  if (role === "CITIZEN") {
    return false;
  }

  if (role === "ADMIN") {
    return false;
  }

  if (role === "MANAGER") {
    return Boolean(departmentId && departmentId.length > 0);
  }

  return Boolean(departmentId && departmentId.length > 0);
}
