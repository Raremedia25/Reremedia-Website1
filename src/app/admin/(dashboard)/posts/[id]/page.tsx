import { notFound } from "next/navigation";
import { deletePostAction } from "@/actions/posts";
import { ConfirmButton } from "@/components/admin/forms";
import { PostForm } from "@/components/admin/PostForm";
import { PageHeader, StatusBadge } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { parseList } from "@/lib/json";
import { toMediaDTO } from "@/lib/media/dto";
import { toDateTimeInputValue } from "@/lib/utils";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string }> }) {
  await requirePermission("posts:manage");
  const { id } = await params;
  const { created } = await searchParams;
  const [post, categories] = await Promise.all([
    prisma.post.findUnique({ where: { id }, include: { featuredImage: true, images: { orderBy: { order: "asc" }, include: { media: true } } } }),
    prisma.category.findMany({ where: { type: "post" }, orderBy: { order: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!post) notFound();
  return (
    <>
      <PageHeader
        title={post.title}
        description={`Last updated ${post.updatedAt.toLocaleString("en-GB")} · ${post.views} views`}
        backHref="/admin/posts"
        actions={
          <>
            <StatusBadge value={post.publishStatus} />
            <ConfirmButton action={deletePostAction} hiddenFields={{ id: post.id }} label="Delete post" />
          </>
        }
      />
      <PostForm
        key={post.updatedAt.toISOString()}
        categories={categories}
        created={!!created}
        values={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          type: post.type,
          categoryId: post.categoryId ?? "",
          tags: parseList(post.tags).join(", "),
          publishStatus: post.publishStatus,
          publishedAt: toDateTimeInputValue(post.publishedAt),
          scheduledAt: toDateTimeInputValue(post.scheduledAt),
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          featuredImage: post.featuredImage ? toMediaDTO(post.featuredImage) : null,
          gallery: post.images.map((pi) => ({ media: toMediaDTO(pi.media), caption: pi.caption ?? "" })),
        }}
      />
    </>
  );
}
