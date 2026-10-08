import { deleteCategoryAction } from "@/actions/catalog";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { ConfirmButton } from "@/components/admin/forms";
import { EmptyRow, PageHeader, Panel, Table, Td, Th } from "@/components/admin/ui";
import { requirePermission } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

export default async function AdminCategoriesPage({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requirePermission("categories:manage");
  const { edit } = await searchParams;
  const categories = await prisma.category.findMany({ orderBy: [{ type: "asc" }, { order: "asc" }, { name: "asc" }], include: { _count: { select: { projects: true, posts: true } } } });
  const editing = edit ? categories.find((c) => c.id === edit) : null;

  return (
    <>
      <PageHeader title="Categories" description="Project categories power the portfolio filters; post categories organise the blog." />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>Slug</Th>
              <Th>Used by</Th>
              <Th>Order</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <EmptyRow colSpan={6} message="No categories yet." />
            ) : (
              categories.map((c) => (
                <tr key={c.id} className="hover:bg-ink-50/60">
                  <Td className="font-semibold text-ink-900">{c.name}</Td>
                  <Td>
                    <span className="chip">{c.type}</span>
                  </Td>
                  <Td className="text-ink-500">{c.slug}</Td>
                  <Td className="text-ink-500">{c.type === "project" ? `${c._count.projects} projects` : `${c._count.posts} posts`}</Td>
                  <Td>{c.order}</Td>
                  <Td>
                    <div className="flex items-center justify-end gap-1.5">
                      <a href={`/admin/categories?edit=${c.id}`} className="btn btn-secondary btn-sm">
                        Edit
                      </a>
                      <ConfirmButton action={deleteCategoryAction} hiddenFields={{ id: c.id }} label="" />
                    </div>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
        <Panel title={editing ? `Edit “${editing.name}”` : "New category"} className="lg:sticky lg:top-24 lg:self-start">
          <CategoryForm key={editing?.id ?? "new"} values={editing ? { id: editing.id, name: editing.name, slug: editing.slug, type: editing.type, description: editing.description ?? "", color: editing.color ?? "", order: editing.order } : { name: "", slug: "", type: "project", description: "", color: "", order: 0 }} />
        </Panel>
      </div>
    </>
  );
}
