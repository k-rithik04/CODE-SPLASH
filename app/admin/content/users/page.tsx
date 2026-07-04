"use client";

import { useCallback, useEffect, useState } from "react";
import { useRole } from "@/app/admin/RoleProviderWrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

interface User {
  id: string;
  username: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unlockToken, setUnlockToken] = useState<string | null>(null);

  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false);
  const [unlockPassword, setUnlockPassword] = useState("");
  const [unlocking, setUnlocking] = useState(false);
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [unlockAction, setUnlockAction] = useState<"create" | "edit" | "delete">("create");

  const [editDialog, setEditDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [createDialog, setCreateDialog] = useState(false);
  const { isAdmin } = useRole();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load users.");
      } else {
        setUsers(data.users || []);
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/users");
        const data = await res.json();
        if (!cancelled) {
          if (!res.ok) setError(data.error || "Failed to load users.");
          else setUsers(data.users || []);
        }
      } catch {
        if (!cancelled) setError("Failed to connect to server.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isAdmin]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setUnlocking(true);
    setUnlockError(null);

    try {
      const res = await fetch("/api/admin/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: unlockPassword }),
      });
      const data = await res.json();

      if (!res.ok) {
        setUnlockError(data.error || "Invalid password.");
      } else {
        setUnlockToken(data.token);
        setUnlockPassword("");
        setUnlockDialogOpen(false);

        if (unlockAction === "create") setCreateDialog(true);
        else if (unlockAction === "edit") setEditDialog({ open: true, user: null });
        else if (unlockAction === "delete") setDeleteDialog({ open: true, user: null });
      }
    } catch {
      setUnlockError("Failed to connect to server.");
    } finally {
      setUnlocking(false);
    }
  };

  const openUnlock = (action: "create" | "edit" | "delete") => {
    if (unlockToken) {
      if (action === "create") setCreateDialog(true);
      return;
    }
    setUnlockAction(action);
    setUnlockPassword("");
    setUnlockError(null);
    setUnlockDialogOpen(true);
  };

  if (!isAdmin) {
    return (
      <div>
        <div className="p-8 rounded-xl border border-red-500/20 bg-red-500/5 text-center">
          <p className="text-red-400 font-medium">Access Restricted</p>
          <p className="text-white/50 text-sm mt-1">Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  if (error) return <div className="text-red-400">Error: {error}</div>;

  return (
    <div>
      {/* Unlock Password Modal */}
      <Dialog open={unlockDialogOpen} onOpenChange={setUnlockDialogOpen}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-sm rounded-2xl shadow-2xl [&_button[data-slot=dialog-close]]:bg-black [&_button[data-slot=dialog-close]]:text-white [&_button[data-slot=dialog-close]]:hover:bg-white/10">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-3 w-12 h-12 rounded-full bg-orange/10 border border-orange/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <DialogTitle className="text-white text-lg">Admin Verification</DialogTitle>
            <p className="text-white/40 text-xs mt-1">
              Enter the system password to continue.
            </p>
          </DialogHeader>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-yellow-500/5 border border-yellow-500/15">
              <svg className="w-3.5 h-3.5 text-yellow-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
              </svg>
              <p className="text-yellow-500/80 text-[11px] leading-relaxed">
                This is the <span className="font-semibold text-yellow-500/90">system password</span>, not your account password.
              </p>
            </div>
            <div className="relative">
              <Input
                type="password"
                placeholder="System password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                className="bg-white/5 border-white/10 text-white h-11 px-4 placeholder:text-white/20 focus:border-orange/50 focus:ring-orange/20"
                autoFocus
              />
            </div>
            {unlockError && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
                <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
                </svg>
                <p className="text-red-400 text-xs">{unlockError}</p>
              </div>
            )}
            <Button type="submit" disabled={unlocking || !unlockPassword} className="w-full h-11 bg-orange hover:bg-orange/80 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange/20">
              {unlocking ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Verifying...
                </span>
              ) : "Verify"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end mb-4">
        <Button size="sm" className="bg-orange hover:bg-orange/80" onClick={() => openUnlock("create")}>
          + Create User
        </Button>
      </div>

      {loading ? (
        <Skeleton className="h-64 w-full bg-white/5" />
      ) : (
        <div className="rounded-xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead className="text-white/40 font-medium text-xs uppercase tracking-wider">Username</TableHead>
                <TableHead className="text-white/40 font-medium text-xs uppercase tracking-wider">Full Name</TableHead>
                <TableHead className="text-white/40 font-medium text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-white/40 font-medium text-xs uppercase tracking-wider">Created</TableHead>
                <TableHead className="w-32 text-white/40 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{user.username}</TableCell>
                  <TableCell className="text-white/60">{user.full_name || <span className="text-white/30 italic">Not set</span>}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === "admin"
                          ? "border-orange/50 text-orange bg-orange/10"
                          : user.role === "editor"
                          ? "border-blue-500/50 text-blue-400 bg-blue-500/10"
                          : "border-green-500/50 text-green-400 bg-green-500/10"
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white/40 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (unlockToken) {
                            setEditDialog({ open: true, user });
                          } else {
                            openUnlock("edit");
                          }
                        }}
                        className="text-white/60 hover:text-white h-8"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (unlockToken) {
                            setDeleteDialog({ open: true, user });
                          } else {
                            openUnlock("delete");
                          }
                        }}
                        className="text-red-400 hover:text-red-300 h-8"
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create User Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-black border border-white/10 text-white rounded-2xl shadow-2xl [&_button[data-slot=dialog-close]]:bg-black [&_button[data-slot=dialog-close]]:text-white [&_button[data-slot=dialog-close]]:hover:bg-white/10">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <CreateUserForm
            unlockToken={unlockToken}
            onSuccess={() => { setCreateDialog(false); fetchUsers(); }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(o) => setEditDialog({ open: o, user: o ? editDialog.user : null })}>
        <DialogContent className="bg-black border border-white/10 text-white rounded-2xl shadow-2xl [&_button[data-slot=dialog-close]]:bg-black [&_button[data-slot=dialog-close]]:text-white [&_button[data-slot=dialog-close]]:hover:bg-white/10">
          <DialogHeader>
            <DialogTitle>Edit User: {editDialog.user?.username}</DialogTitle>
          </DialogHeader>
          {editDialog.user && (
            <EditUserForm
              user={editDialog.user}
              unlockToken={unlockToken}
              onSuccess={() => { setEditDialog({ open: false, user: null }); fetchUsers(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(o) => setDeleteDialog({ open: o, user: o ? deleteDialog.user : null })}>
        <DialogContent className="bg-black border border-white/10 text-white max-w-sm rounded-2xl shadow-2xl [&_button[data-slot=dialog-close]]:bg-black [&_button[data-slot=dialog-close]]:text-white [&_button[data-slot=dialog-close]]:hover:bg-white/10">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <p className="text-white/60 text-sm">
            Are you sure you want to delete <strong className="text-white">{deleteDialog.user?.username}</strong>?
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, user: null })} className="border-white/20 text-white/70 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <DeleteUserButton
              userId={deleteDialog.user?.id}
              unlockToken={unlockToken}
              onDone={() => { setDeleteDialog({ open: false, user: null }); fetchUsers(); }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DeleteUserButton({ userId, unlockToken, onDone }: { userId?: string; unlockToken: string | null; onDone: () => void }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!userId || !unlockToken) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${unlockToken}` },
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user.");
        setDeleting(false);
        return;
      }
      onDone();
    } catch {
      setDeleting(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={deleting} className="bg-red-500 hover:bg-red-600">
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}

function CreateUserForm({ unlockToken, onSuccess }: { unlockToken: string | null; onSuccess: () => void }) {
  const [form, setForm] = useState({ username: "", full_name: "", password: "1234", role: "viewer" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockToken) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${unlockToken}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create user.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
          </svg>
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Username</Label>
        <Input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          required
          className="bg-white/5 border-white/10 text-white h-10 placeholder:text-white/20 focus:border-orange/50 focus:ring-orange/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Full Name</Label>
        <Input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="bg-white/5 border-white/10 text-white h-10 placeholder:text-white/20 focus:border-orange/50 focus:ring-orange/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Password</Label>
        <Input
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          required
          className="bg-white/5 border-white/10 text-white h-10 placeholder:text-white/20 focus:border-orange/50 focus:ring-orange/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Role</Label>
        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 focus:border-orange/50 focus:ring-orange/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border border-white/10 text-white">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={saving} className="w-full h-11 bg-orange hover:bg-orange/80 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange/20">
        {saving ? "Creating..." : "Create User"}
      </Button>
    </form>
  );
}

function EditUserForm({ user, unlockToken, onSuccess }: { user: User; unlockToken: string | null; onSuccess: () => void }) {
  const [form, setForm] = useState({ full_name: user.full_name || "", role: user.role });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!unlockToken) return;
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${unlockToken}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to update user.");
      } else {
        onSuccess();
      }
    } catch {
      setError("Failed to connect to server.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
          <svg className="w-4 h-4 text-red-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="15" x2="9" y1="9" y2="15" /><line x1="9" x2="15" y1="9" y2="15" />
          </svg>
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Full Name</Label>
        <Input
          value={form.full_name}
          onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          className="bg-white/5 border-white/10 text-white h-10 placeholder:text-white/20 focus:border-orange/50 focus:ring-orange/20"
        />
      </div>
      <div className="space-y-2">
        <Label className="text-white/50 text-xs uppercase tracking-wider">Role</Label>
        <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
          <SelectTrigger className="bg-white/5 border-white/10 text-white h-10 focus:border-orange/50 focus:ring-orange/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-black border border-white/10 text-white">
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="editor">Editor</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit" disabled={saving} className="w-full h-11 bg-orange hover:bg-orange/80 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-orange/20">
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
