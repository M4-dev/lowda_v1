
// This function should only be used in server components or API routes.
export default async function getCategories() {
  if (typeof window !== "undefined") {
    throw new Error("getCategories() cannot be used in the browser. Use the /api/category API route instead.");
  }
  const { default: prismadb } = await import("@/libs/prismadb");
  const categories = await prismadb.category.findMany({
    orderBy: { label: "asc" },
  });
  // Always include 'All' as the first category
  return [
    { label: "All", icon: null },
    ...categories.map((cat) => ({ label: cat.label, icon: cat.icon, id: cat.id })),
  ];
}
