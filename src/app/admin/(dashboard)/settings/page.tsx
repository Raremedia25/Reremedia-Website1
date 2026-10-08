import { SettingsForm } from "@/components/admin/SettingsForm";
import { PageHeader, Panel } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { getSettings } from "@/lib/settings";
import { SITE } from "@/lib/site";

export default async function SettingsPage() {
  await requirePermission("settings:manage");
  const settings = await getSettings();
  return (
    <>
      <PageHeader title="Site settings" description="Tagline, SEO description, announcement bar and social links. Leave a social link empty to hide it." />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Panel>
          <SettingsForm settings={settings} />
        </Panel>
        <div className="space-y-4">
          <Panel title="Fixed brand details" description="Changed in code (src/lib/site.ts) to keep them consistent everywhere.">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-ink-500">Company</dt>
                <dd className="font-medium text-ink-900">{SITE.name}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Email</dt>
                <dd className="font-medium text-ink-900">{SITE.email}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Phone</dt>
                <dd className="font-medium text-ink-900">{SITE.phone}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Country</dt>
                <dd className="font-medium text-ink-900">{SITE.country}</dd>
              </div>
            </dl>
          </Panel>
          <Panel title="Storage & email" description="Configured through environment variables.">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-ink-500">Media storage</dt>
                <dd className="font-medium text-ink-900">{process.env.STORAGE_PROVIDER || "local"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Email notifications</dt>
                <dd className="font-medium text-ink-900">{process.env.SMTP_HOST ? `SMTP (${process.env.SMTP_HOST})` : "Not configured (logged to console)"}</dd>
              </div>
              <div>
                <dt className="text-ink-500">Max upload size</dt>
                <dd className="font-medium text-ink-900">{process.env.MAX_UPLOAD_MB || 10} MB</dd>
              </div>
            </dl>
          </Panel>
        </div>
      </div>
    </>
  );
}
