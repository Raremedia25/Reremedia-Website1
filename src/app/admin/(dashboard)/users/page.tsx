import { deleteUserAction } from "@/actions/users";
import { ConfirmButton } from "@/components/admin/forms";
import { UserForm } from "@/components/admin/UserForm";
import { EmptyRow, PageHeader, Panel, StatusBadge, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { ROLE_LABELS, ROLE_PERMISSIONS, ROLES, type Role } from "@/lib/constants";
import { prisma } from "@/lib/db";
import { formatDateTime } from "@/lib/utils";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const me = await requirePermission("users:manage");
  const { edit } = await searchParams;
  const users = await prisma.user.findMany({ orderBy: [{ role: "asc" }, { name: "asc" }], select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true, createdAt: true } });
  const editing = edit ? users.find((u) => u.id === edit) : null;

  return (
    <>
      <PageHeader title="Users & roles" description="Administrators who can sign in to this dashboard." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Table>
            <thead>
              <tr>
                <Th>User</Th>
                <Th>Role</Th>
                <Th>Status</Th>
                <Th>Last login</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <EmptyRow colSpan={5} message="No users." />
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-ink-50/60">
                    <Td>
                      <p className="font-semibold text-ink-900">
                        {u.name} {u.id === me.id && <span className="text-xs text-ink-500">(you)</span>}
                      </p>
                      <p className="text-xs text-ink-500">{u.email}</p>
                    </Td>
                    <Td>
                      <StatusBadge value={u.role} label={ROLE_LABELS[u.role as Role] ?? u.role} />
                    </Td>
                    <Td>
                      <StatusBadge value={u.isActive ? "PUBLISHED" : "ARCHIVED"} label={u.isActive ? "Active" : "Inactive"} />
                    </Td>
                    <Td className="text-ink-500">{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "Never"}</Td>
                    <Td>
                      <div className="flex items-center justify-end gap-1.5">
                        <a href={`/admin/users?edit=${u.id}`} className="btn btn-secondary btn-sm">
                          Edit
                        </a>
                        {u.id !== me.id && <ConfirmButton action={deleteUserAction} hiddenFields={{ id: u.id }} label="" />}
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
          <Panel title="Role permissions">
            <div className="grid gap-3 sm:grid-cols-2">
              {ROLES.map((r) => (
                <div key={r} className="rounded-xl border border-ink-200 p-3 text-sm">
                  <p className="font-semibold text-ink-900">{ROLE_LABELS[r]}</p>
                  <p className="mt-1 text-xs text-ink-500">{ROLE_PERMISSIONS[r].map((p) => p.replace(":", " · ")).join(", ")}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
        <Panel title={editing ? `Edit ${editing.name}` : "Add user"} className="lg:sticky lg:top-24 lg:self-start">
          <UserForm key={editing?.id ?? "new"} values={editing ? { id: editing.id, name: editing.name, email: editing.email, role: editing.role, isActive: editing.isActive } : { name: "", email: "", role: "CONTENT_MANAGER", isActive: true }} />
        </Panel>
      </div>
    </>
  );
}
