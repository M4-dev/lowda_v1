import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { getServerSession } from "next-auth";
import prismadb from "@/libs/prismadb";

export async function createCategory({ label, icon }: { label: string; icon: string }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  if (!label || !icon) {
    throw new Error("Missing label or icon");
  }
  const category = await prismadb.category.create({
    data: { label, icon },
  });
  return category;
}
