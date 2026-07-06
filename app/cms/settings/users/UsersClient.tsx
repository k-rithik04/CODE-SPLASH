"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface User {
  id: string;
  username: string;
  full_name: string;
  role: "admin" | "editor" | "viewer";
  must_change_password: boolean;
  created_at: string;
}

const ROLE_COLORS: Record<string, string> = {
  admin: "text-orange border-orange/30 bg-orange/10",
  editor: "text-blue-400 border-blue-400/30 bg-blue-400/10",
  viewer: "text-green-400 border-green-400/30 bg-green-400/10",
};

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({ username: "", full_name: "", role: "editor", password: "", must_change_password: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadUsers() {
      try {
        const res = await fetch("/cms/api/users");
        if (!cancelled && res.ok) {
          const data = await res.json();
          setUsers(data.users);
        }
      } catch {} finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadUsers();
    return () => { cancelled = true; };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/cms/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch {}
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: "", full_name: "", role: "editor", password: "", must_change_password: true });
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setForm({ username: user.username, full_name: user.full_name, role: user.role, password: "", must_change_password: user.must_change_password });
    setError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      if (editingUser) {
        const body: Record<string, unknown> = {
          username: form.username,
          full_name: form.full_name,
          role: form.role,
          must_change_password: form.must_change_password,
        };
        if (form.password) body.password = form.password;

        const res = await fetch(`/cms/api/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setSaving(false); return; }
      } else {
        if (!form.password) { setError("Password is required for new users"); setSaving(false); return; }
        const res = await fetch("/cms/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error); setSaving(false); return; }
      }
      setDialogOpen(false);
      fetchUsers();
    } catch {
      setError("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!confirm(`Delete user "${user.username}"?`)) return;
    const res = await fetch(`/cms/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) fetchUsers();
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-2xl">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-semibold text-white tracking-tight">User Management</h3>
          <Badge variant="outline" className="text-white/50 border-white/10 bg-white/5 px-2.5 rounded-full">
            {users.length} users
          </Badge>
        </div>
        <Button size="sm" onClick={openCreate} className="bg-orange hover:bg-orange/80 text-white shadow-[0_0_15px_rgba(255,107,0,0.4)] rounded-xl font-medium px-5">
          + Add User
        </Button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-white/30">Loading...</div>
      ) : (
        <div className="overflow-x-auto p-2">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent border-b-2">
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Username</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Full Name</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Role</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Force Change</TableHead>
                <TableHead className="text-white/40 font-semibold text-xs uppercase tracking-wider">Created</TableHead>
                <TableHead className="text-white/40 text-right font-semibold text-xs uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-white/5 hover:bg-white/[0.03] transition-colors">
                  <TableCell className="text-white font-medium">{u.username}</TableCell>
                  <TableCell className="text-white/60">{u.full_name || "-"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={ROLE_COLORS[u.role]}>
                      {u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.must_change_password ? (
                      <Badge variant="outline" className="text-yellow-400 border-yellow-400/30 bg-yellow-400/10">Pending</Badge>
                    ) : (
                      <Badge variant="outline" className="text-white/30 border-white/10 bg-white/5">Done</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-white/40 text-sm">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(u)} className="border-white/20 text-white/60 hover:text-white h-8 px-3">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(u)} className="border-red-500/20 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 px-3">
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md bg-[#0a0a0a] border-white/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">{editingUser ? "Edit User" : "Create User"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Username</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="e.g. john" disabled={!!editingUser} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Full Name</label>
              <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} placeholder="e.g. John Doe" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm">
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-medium text-white/40 uppercase tracking-[0.15em]">
                {editingUser ? "New Password (leave blank to keep)" : "Password"}
              </label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingUser ? "Leave blank to keep current" : "Enter password"} className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
            </div>

            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={form.must_change_password} onChange={(e) => setForm({ ...form, must_change_password: e.target.checked })} />
                <div className="w-9 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange"></div>
              </label>
              <span className="text-sm text-white/60">Force password change on login</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="border-white/20 text-white/60">Cancel</Button>
            <Button onClick={handleSave} disabled={saving || !form.username} className="bg-orange hover:bg-orange/80 text-white">
              {saving ? "Saving..." : editingUser ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
