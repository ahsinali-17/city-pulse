"use client";

import { useState, useTransition, useMemo } from "react";
import {
  UserPlus,
  Shield,
  ShieldCheck,
  HardHat,
  User,
  Trash2,
  Search,
  Plus,
  ChevronDown,
  Building2,
  AlertTriangle,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateUserRole, updateUserDepartment, deleteUser, createDepartment, deleteDepartment } from "@/app/admin/users/actions";

// ─── Types ──────────────────────────────────────────────
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

// ─── Role Config ────────────────────────────────────────
const ROLES = ["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] as const;

const roleConfig: Record<string, { icon: React.ElementType; color: string; bg: string; label: string }> = {
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

// ─── Delete Confirmation Modal ──────────────────────────
function DeleteConfirmation({
  userName,
  onConfirm,
  onCancel,
  isPending,
}: {
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl p-6 max-w-sm w-full mx-4 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-950/40 rounded-lg">
            <AlertTriangle className="size-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Delete User</h3>
            <p className="text-xs text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">
          Are you sure you want to permanently delete <strong>{userName}</strong>? Their tickets will be kept, but any reporter or crew assignments will be cleared.
        </p>
        <div className="flex items-center gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-3.5 mr-1.5" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Individual User Row ────────────────────────────────
function UserRow({
  user,
  departments,
  currentAdminId,
}: {
  user: StaffUser;
  departments: Department[];
  currentAdminId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [error, setError] = useState("");

  const isSelf = user.id === currentAdminId;
  const config = roleConfig[user.role] || roleConfig.CITIZEN;
  const RoleIcon = config.icon;

  const handleRoleChange = (newRole: string) => {
    setError("");
    startTransition(async () => {
      try {
        await updateUserRole(user.id, newRole as any);
      } catch (err: any) {
        setError(err.message || "Failed to update role.");
      }
    });
  };

  const handleDepartmentChange = (deptId: string) => {
    setError("");
    startTransition(async () => {
      try {
        await updateUserDepartment(user.id, deptId === "none" ? null : deptId);
      } catch (err: any) {
        setError(err.message || "Failed to update department.");
      }
    });
  };

  const handleDelete = () => {
    setError("");
    startTransition(async () => {
      try {
        await deleteUser(user.id);
      } catch (err: any) {
        setError(err.message || "Failed to delete user.");
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
                {ROLES.map((r) => (
                  <option key={r} value={r}>
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
              value={user.departmentId || "none"}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              disabled={isPending || isSelf}
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
              {departments.map((d) => (
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
            <DeleteConfirmation
              userName={user.name}
              onConfirm={handleDelete}
              onCancel={() => setDeleteTarget(false)}
              isPending={isPending}
            />
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Department Manager ─────────────────────────────────
function DepartmentManager({ departments }: { departments: Department[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const handleCreate = () => {
    if (!newName.trim()) return;
    setError("");
    startTransition(async () => {
      try {
        await createDepartment(newName, newDesc);
        setNewName("");
        setNewDesc("");
      } catch (err: any) {
        setError(err.message || "Failed to create department.");
      }
    });
  };

  const handleDelete = (deptId: string) => {
    setError("");
    startTransition(async () => {
      try {
        await deleteDepartment(deptId);
        setDeleteTarget(null);
      } catch (err: any) {
        setError(err.message || "Failed to delete department.");
      }
    });
  };

  return (
    <Card className="shadow-sm">
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Building2 className="size-4 text-indigo-500" />
          Department Management
          <Badge variant="secondary" className="text-[10px] ml-1">
            {departments.length}
          </Badge>
          <ChevronDown
            className={`size-4 ml-auto text-muted-foreground transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </CardTitle>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 space-y-4">
          {/* Existing departments */}
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <div
                key={dept.id}
                className="group flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Building2 className="size-3 text-slate-400" />
                <span>{dept.name}</span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(dept)}
                  disabled={isPending}
                  aria-label={`Delete ${dept.name}`}
                  title={`Delete ${dept.name}`}
                  className="ml-1 inline-flex items-center justify-center rounded-md p-1 text-slate-400 transition-colors hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400 disabled:opacity-30"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
            {departments.length === 0 && (
              <p className="text-xs text-muted-foreground italic">No departments created yet.</p>
            )}
          </div>

          {/* Add new department form */}
          <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Input
              type="text"
              placeholder="Department name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              disabled={isPending}
              className="flex-1 bg-white dark:bg-slate-900 text-xs"
            />
            <Input
              type="text"
              placeholder="Description (optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              disabled={isPending}
              className="flex-1 bg-white dark:bg-slate-900 text-xs"
            />
            <Button
              size="sm"
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
              className="shrink-0"
            >
              {isPending ? (
                <Loader2 className="size-3.5 mr-1.5 animate-spin" />
              ) : (
                <Plus className="size-3.5 mr-1.5" />
              )}
              Add Department
            </Button>
          </div>

          {/* Error */}
          {error && (
            <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-lg px-3 py-2 flex items-center gap-2">
              <AlertTriangle className="size-3.5 shrink-0" />
              {error}
              <button onClick={() => setError("")} className="ml-auto hover:text-red-700">
                <X className="size-3" />
              </button>
            </div>
          )}

          {deleteTarget && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-300">
                    Delete {deleteTarget.name}?
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    Users and tickets will be unassigned. This cannot be undone.
                  </p>
                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(deleteTarget.id)}
                      disabled={isPending}
                      className="h-7 text-xs"
                    >
                      {isPending ? <Loader2 className="mr-1.5 size-3 animate-spin" /> : <Trash2 className="mr-1.5 size-3" />}
                      Delete department
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setDeleteTarget(null)}
                      disabled={isPending}
                      className="h-7 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

// ─── Main Component ─────────────────────────────────────
export function StaffManagementClient({
  allUsers,
  departments,
  currentAdminId,
}: {
  allUsers: StaffUser[];
  departments: Department[];
  currentAdminId: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesSearch =
        searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  // KPI counts
  const counts = useMemo(() => {
    const map: Record<string, number> = { CITIZEN: 0, FIELD_WORKER: 0, MANAGER: 0, ADMIN: 0 };
    allUsers.forEach((u) => {
      if (map[u.role] !== undefined) map[u.role]++;
    });
    return map;
  }, [allUsers]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
          <UserPlus className="size-6 text-purple-600 dark:text-purple-400" />
          Staff Onboarding & User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Promote citizens to staff roles, assign departments, and manage all registered accounts.
        </p>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] as const).map((role) => {
          const cfg = roleConfig[role];
          const Icon = cfg.icon;
          return (
            <Card
              key={role}
              className={`shadow-sm cursor-pointer transition-all border-2 ${
                roleFilter === role
                  ? "border-blue-500 dark:border-blue-400 ring-2 ring-blue-500/20"
                  : "border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              }`}
              onClick={() => setRoleFilter(roleFilter === role ? "ALL" : role)}
            >
              <CardHeader className="pb-2">
                <CardTitle className={`text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 ${cfg.color}`}>
                  <Icon className="size-3.5" />
                  {cfg.label}s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold font-mono">{counts[role]}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Department Management */}
      <DepartmentManager departments={departments} />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="user-search"
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white dark:bg-slate-900"
          />
        </div>
        {roleFilter !== "ALL" && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRoleFilter("ALL")}
            className="text-xs shrink-0"
          >
            <X className="size-3 mr-1" />
            Clear Filter
          </Button>
        )}
        <div className="text-xs text-muted-foreground whitespace-nowrap">
          {filteredUsers.length} of {allUsers.length} users
        </div>
      </div>

      {/* Users Table */}
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/20">
          <CardTitle className="flex items-center gap-2">
            <Building2 className="size-4 text-slate-500" />
            User Directory
          </CardTitle>
          <CardDescription>
            Click a role dropdown to promote or demote a user. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-slate-50/50 dark:bg-slate-900/50 border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">User</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Joined</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    departments={departments}
                    currentAdminId={currentAdminId}
                  />
                ))}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="size-8 text-slate-300 dark:text-slate-600" />
                        <p className="font-medium">No users found</p>
                        <p className="text-xs">Try adjusting your search or filter criteria.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
