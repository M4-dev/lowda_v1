import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prismadb from "@/libs/prismadb";

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  if (!id) {
    throw new Error("Missing id");
  }
  await prismadb.category.delete({ where: { id } });
  return true;
}
