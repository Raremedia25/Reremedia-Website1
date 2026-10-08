import { PasswordForm } from "@/components/admin/PasswordForm";
import { PageHeader, Panel, StatusBadge } from "@/components/admin/ui";
import { requireUser } from "@/lib/auth/current-user";
import { ROLE_LABELS, type Role } from "@/lib/constants";

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <>
      <PageHeader title="My account" />
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Profile">
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-ink-500">Name</dt>
              <dd className="font-medium text-ink-900">{user.name}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Email</dt>
              <dd className="font-medium text-ink-900">{user.email}</dd>
            </div>
            <div>
              <dt className="text-ink-500">Role</dt>
              <dd>
                <StatusBadge value={user.role} label={ROLE_LABELS[user.role as Role] ?? user.role} />
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs text-ink-500">Ask a Super Admin to change your name, email or role.</p>
        </Panel>
        <Panel title="Change password">
          <PasswordForm />
        </Panel>
      </div>
    </>
  );
}
