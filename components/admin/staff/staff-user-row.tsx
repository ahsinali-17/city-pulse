"use client";

import { useState, useTransition } from "react";
import {
  Shield,
  ShieldCheck,
  HardHat,
  User,
  Trash2,
  ChevronDown,
  AlertTriangle,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateUserRole, updateUserDepartment, deleteUser } from "@/app/admin/users/actions";
import { getAllowedRoleTransitions, type UserRole } from "@/lib/admin/role-validation";
import { DeleteConfirmationModal, ChangeConfirmationModal } from "./staff-modals";

export interface StaffUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId: string | null;
  createdAt: string;
}

export interface Department {
  id: string;
  name: string;
}

export const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  CITIZEN: {
    icon: User,
    color: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-100 dark:bg-slate-800",
    label: "Citizen",
  },
  FIELD_WORKER: {
    icon: HardHat,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    label: "Field Worker",
  },
  MANAGER: {
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    label: "Manager",
  },
  ADMIN: {
    icon: Shield,
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    label: "Admin",
  },
};

export function StaffUserRow({
  user,
  departments,
  currentAdminId,
  allUsers,
}: {
  user: StaffUser;
  departments: Department[];
  currentAdminId: string;
  allUsers: StaffUser[];
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [changeConfirmation, setChangeConfirmation] = useState<{
    title: string;
    message: string;
    apply: () => Promise<void>;
  } | null>(null);
  const [error, setError] = useState("");

  const isSelf = user.id === currentAdminId;
  const config = roleConfig[user.role] || roleConfig.CITIZEN;
  const RoleIcon = config.icon;
  const adminExists = allUsers.some((entry) => entry.role === "ADMIN" && entry.id !== user.id);
  const roleOptions = (Object.keys(roleConfig) as Array<keyof typeof roleConfig>).filter((role) => {
    if (role === user.role) return true;
    if (role === "ADMIN" && adminExists) return false;
    return getAllowedRoleTransitions(user.role as UserRole).includes(role as UserRole);
  });

  const departmentOptions = departments.filter((department) => {
    if (user.role === "CITIZEN" || user.role === "ADMIN") return false;

    if (user.role === "MANAGER") {
      const hasAnotherManager = allUsers.some(
        (entry) => entry.id !== user.id && entry.role === "MANAGER" && entry.departmentId === department.id
      );
      if (hasAnotherManager && department.id !== user.departmentId) return false;
      return true;
    }

    return true;
  });

  const applyRoleChange = (newRole: string) => {
    setError("");
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole as "CITIZEN" | "FIELD_WORKER" | "MANAGER" | "ADMIN");
        setChangeConfirmation(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update role.");
      }
    });
  };

  const handleRoleChange = (newRole: string) => {
    const roleLabel = roleConfig[newRole]?.label || newRole;
    setChangeConfirmation({
      title: `Change ${user.name}'s role?`,
      message: `This will change ${user.name} to ${roleLabel}. Any active tickets assigned to a worker leaving the field-worker role will return to manager dispatch.`,
      apply: async () => applyRoleChange(newRole),
    });
  };

  const applyDepartmentChange = (deptId: string) => {
    setError("");
    startTransition(async () => {
      try {
        await updateUserDepartment(user.id, deptId === "none" ? null : deptId);
        setChangeConfirmation(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to update department.");
      }
    });
  };

  const handleDepartmentChange = (deptId: string) => {
    const departmentName = departments.find((department) => department.id === deptId)?.name || "no department";
    setChangeConfirmation({
      title: `Change ${user.name}'s department?`,
      message: `Move ${user.name} to ${departmentName}? Active tickets assigned to this field worker will become unassigned and return to manager dispatch.`,
      apply: async () => applyDepartmentChange(deptId),
    });
  };

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      try {
        await deleteUser(user.id);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to delete user.");
        setDeleteTarget(false);
      }
    });
  };

  return (
    <>
      <tr
        className={`
          group transition-colors
          ${isPending ? "opacity-60 pointer-events-none" : ""}
          ${isSelf ? "bg-purple-50/50 dark:bg-purple-950/10" : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"}
        `}
      >
        {/* User Info */}
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className={`p-1.5 rounded-lg ${config.bg}`}>
              <RoleIcon className={`size-4 ${config.color}`} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                {user.name}
                {isSelf && (
                  <span className="ml-2 text-[10px] font-mono text-purple-500 dark:text-purple-400">(you)</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        </td>

        {/* Role Selector */}
        <td className="px-4 py-3.5">
          {isSelf ? (
            <Badge className={`${config.bg} ${config.color} border-0 text-[11px] font-medium`}>
              {config.label}
            </Badge>
          ) : (
            <div className="relative">
              <select
                value={user.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={isPending}
                className={`
                  appearance-none w-full rounded-lg border px-3 py-1.5 pr-8 text-xs font-medium cursor-pointer
                  outline-none transition-colors
                  border-slate-200 dark:border-slate-700
                  bg-white dark:bg-slate-900
                  text-slate-800 dark:text-slate-200
                  hover:border-slate-300 dark:hover:border-slate-600
                  focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                `}
              >
                {roleOptions.map((r) => (
                  <option key={r} value={r} disabled={r === user.role}>
                    {roleConfig[r].label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            </div>
          )}
        </td>

        {/* Department Selector */}
        <td className="px-4 py-3.5">
          <div className="relative">
            <select
              value={user.role === "CITIZEN" || user.role === "ADMIN" ? "none" : user.departmentId || "none"}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              disabled={isPending || isSelf || user.role === "CITIZEN" || user.role === "ADMIN"}
              title={
                user.role === "CITIZEN"
                  ? "Citizens do not belong to operational departments."
                  : user.role === "ADMIN"
                    ? "Admins are not tied to a department."
                    : undefined
              }
              className={`
                appearance-none w-full rounded-lg border px-3 py-1.5 pr-8 text-xs font-medium cursor-pointer
                outline-none transition-colors
                border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-900
                text-slate-800 dark:text-slate-200
                hover:border-slate-300 dark:hover:border-slate-600
                focus:border-blue-500 focus:ring-1 focus:ring-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              <option value="none">— No Department —</option>
              {departmentOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </td>

        {/* Joined Date */}
        <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
          {new Date(user.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </td>

        {/* Actions */}
        <td className="px-4 py-3.5 text-right">
          {isSelf ? (
            <span className="text-[10px] text-muted-foreground italic">Protected</span>
          ) : (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setDeleteTarget(true)}
              disabled={isPending}
              className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </td>
      </tr>

      {/* Error Row */}
      {error && (
        <tr>
          <td colSpan={5} className="px-4 py-2">
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="size-3.5 shrink-0" />
              {error}
              <button onClick={() => setError("")} className="ml-auto hover:text-red-700">
                <X className="size-3" />
              </button>
            </div>
          </td>
        </tr>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <tr>
          <td colSpan={5} className="p-0">
            <DeleteConfirmationModal
              userName={user.name}
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(false)}
              isPending={isPending}
            />
          </td>
        </tr>
      )}
      {changeConfirmation && (
        <tr>
          <td colSpan={5} className="p-0">
            <ChangeConfirmationModal
              title={changeConfirmation.title}
              message={changeConfirmation.message}
              onConfirm={() => { void changeConfirmation.apply(); }}
              onCancel={() => setChangeConfirmation(null)}
              isPending={isPending}
            />
          </td>
        </tr>
      )}
    </>
  );
}
