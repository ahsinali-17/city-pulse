"use client";

import { useState, useMemo } from "react";
import {
  UserPlus,
  Search,
  Building2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  StaffUserRow,
  roleConfig,
  type StaffUser,
  type Department,
} from "./staff/staff-user-row";

export type { StaffUser, Department };

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
  const [departmentFilter, setDepartmentFilter] = useState<string>("ALL");

  const filteredUsers = useMemo(() => {
    return allUsers.filter((u) => {
      const matchesSearch =
        searchQuery === "" ||
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
      const matchesDepartment =
        departmentFilter === "ALL" ||
        (!u.departmentId && departmentFilter === "NONE") ||
        u.departmentId === departmentFilter;

      return matchesSearch && matchesRole && matchesDepartment;
    });
  }, [allUsers, searchQuery, roleFilter, departmentFilter]);

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
          Promote citizens to staff roles and manage registered accounts. Department ownership is managed separately.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] as const).map((role) => {
          const cfg = roleConfig[role];
          const Icon = cfg.icon;
          return (
            <Card
              key={role}
              className={`shadow-xs cursor-pointer transition-all border-2 ${
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

      {/* Search & Filters */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="user-search"
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-white dark:bg-slate-900 rounded-xl"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                if (event.target.value !== "FIELD_WORKER" && event.target.value !== "MANAGER") {
                  setDepartmentFilter("ALL");
                }
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All roles</option>
              {(["CITIZEN", "FIELD_WORKER", "MANAGER", "ADMIN"] as const).map((role) => (
                <option key={role} value={role}>{roleConfig[role].label}</option>
              ))}
            </select>

            {(roleFilter === "FIELD_WORKER" || roleFilter === "MANAGER") && (
              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <option value="ALL">All departments</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>{department.name}</option>
                ))}
              </select>
            )}
          </div>
          {roleFilter !== "ALL" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRoleFilter("ALL");
                setDepartmentFilter("ALL");
              }}
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
      </div>

      {/* Users Table */}
      <Card className="shadow-xs overflow-hidden">
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
                  <StaffUserRow
                    key={user.id}
                    user={user}
                    departments={departments}
                    currentAdminId={currentAdminId}
                    allUsers={allUsers}
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
