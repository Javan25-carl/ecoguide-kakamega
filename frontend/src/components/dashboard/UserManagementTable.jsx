import { useState, useMemo } from "react";
import { Search, Ban, RotateCcw } from "lucide-react";

const ROLES = ["All roles", "tourist", "guide", "admin"];

export default function UserManagementTable({ users, loading, onToggleActive, togglingId }) {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("All roles");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesRole = role === "All roles" || u.role === role;
      const matchesQuery =
        !query ||
        u.full_name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      return matchesRole && matchesQuery;
    });
  }, [users, query, role]);

  return (
    <div className="bg-white dark:bg-[#1c262b] rounded-2xl shadow-card p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h3 className="font-semibold text-charcoal dark:text-white text-sm">User management</h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-soft dark:bg-white/5 rounded-lg px-3 py-2">
            <Search size={14} className="text-charcoal/40 dark:text-white/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              className="text-sm bg-transparent outline-none text-charcoal dark:text-white placeholder:text-charcoal/35 w-40"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-sm bg-soft dark:bg-white/5 text-charcoal dark:text-white rounded-lg px-3 py-2 outline-none"
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>{r === "All roles" ? r : r[0].toUpperCase() + r.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-sm text-charcoal/45 dark:text-white/40 py-6 text-center">Loading...</p>}

      {!loading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-charcoal/45 dark:text-white/40 border-b border-charcoal/10 dark:border-white/10">
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Role</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((u) => (
                <tr key={u.id} className="border-b border-charcoal/5 dark:border-white/5 last:border-0">
                  <td className="py-2.5 text-charcoal dark:text-white font-medium">{u.full_name}</td>
                  <td className="py-2.5 text-charcoal/60 dark:text-white/50">{u.email}</td>
                  <td className="py-2.5 capitalize text-charcoal/60 dark:text-white/50">{u.role}</td>
                  <td className="py-2.5">
                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                        u.is_active ? "bg-forest/10 text-forest" : "bg-red-100 text-red-500"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      disabled={togglingId === u.id}
                      onClick={() => onToggleActive(u)}
                      className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-50 ${
                        u.is_active
                          ? "bg-red-50 text-red-500 hover:bg-red-500 hover:text-white"
                          : "bg-forest/10 text-forest hover:bg-forest hover:text-white"
                      }`}
                    >
                      {u.is_active ? <Ban size={12} /> : <RotateCcw size={12} />}
                      {u.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-charcoal/40 dark:text-white/35">
                    No users match that search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
