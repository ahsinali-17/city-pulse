"use client";

import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DeleteConfirmationModal({
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
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

export function ChangeConfirmationModal({
  title,
  message,
  onConfirm,
  onCancel,
  isPending,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="mx-4 w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/40">
            <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
            <p className="text-xs text-muted-foreground">This change may affect ticket routing.</p>
          </div>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300">{message}</p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button size="sm" onClick={onConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="mr-1.5 size-3.5 animate-spin" /> : null}
            {isPending ? "Applying..." : "Confirm change"}
          </Button>
        </div>
      </div>
    </div>
  );
}
