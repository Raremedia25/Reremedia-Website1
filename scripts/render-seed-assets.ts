/**
 * Pre-render the seed images that contain text (placeholder covers and sector
 * illustrations) into prisma/seed-assets, so the /api/setup/content endpoint
 * can use them inside a serverless function, where no fonts are installed.
 *
 *   npm run db:seed:assets      # re-run after editing seed-data.ts or illustrations.ts
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { SECTOR_SCENES, renderIllustration } from "../prisma/illustrations";
import { PROJECTS } from "../prisma/seed-data";
import { SEED_ASSETS, coverAssetName, placeholderCover, sceneAssetName } from "../src/lib/seed/content";

async function main() {
  await fs.mkdir(SEED_ASSETS, { recursive: true });
  for (const [key, scene] of Object.entries(SECTOR_SCENES)) {
    await fs.writeFile(path.join(SEED_ASSETS, sceneAssetName(key)), await renderIllustration(scene.svg));
    console.log(`scene  ${key}`);
  }
  for (const p of PROJECTS) {
    if (p.screenshot || p.scene) continue;
    await fs.writeFile(path.join(SEED_ASSETS, coverAssetName(p.slug)), await placeholderCover(p));
    console.log(`cover  ${p.slug}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
