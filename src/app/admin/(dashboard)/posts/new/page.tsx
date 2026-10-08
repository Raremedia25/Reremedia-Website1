import { PostForm } from "@/components/admin/PostForm";
import { PageHeader } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default async function NewPostPage() {
  await requirePermission("posts:manage");
  const categories = await prisma.category.findMany({ where: { type: "post" }, orderBy: { order: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <PageHeader title="New post" description="Write an article, update, announcement, tutorial or case study." backHref="/admin/posts" />
      <PostForm
        categories={categories}
        values={{ title: "", slug: "", excerpt: "", content: "", type: "ARTICLE", categoryId: "", tags: "", publishStatus: "DRAFT", publishedAt: "", scheduledAt: "", seoTitle: "", seoDescription: "", featuredImage: null, gallery: [] }}
      />
    </>
  );
}
