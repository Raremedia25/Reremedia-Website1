"use server";

import { revalidatePath } from "next/cache";
import { audit } from "@/lib/audit";
import { assertPermission } from "@/lib/auth/current-user";
import { saveSettings, SETTING_FIELDS } from "@/lib/settings";
import { actionError, revalidatePublic, type ActionState } from "@/lib/actions-shared";

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    const user = await assertPermission("settings:manage");
    const values: Record<string, string> = {};
    const errors: Record<string, string> = {};
    for (const field of SETTING_FIELDS) {
      const v = String(formData.get(field.key) ?? "").trim().slice(0, 1000);
      if (field.type === "url" && v && !/^https?:\/\/[^\s]+$/i.test(v)) errors[field.key] = "Must be a full URL starting with http:// or https://";
      values[field.key] = v;
    }
    if (Object.keys(errors).length) return { error: "Please fix the highlighted fields.", errors };
    await saveSettings(values);
    await audit(user, "settings.update", "site_setting", null, { keys: Object.keys(values) });
    revalidatePublic("settings");
    revalidatePath("/admin/settings");
    return { success: "Settings saved." };
  } catch (err) {
    return actionError(err);
  }
}
