import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const reimbursements = await prisma.reimbursement.findMany();
    const totalReimbursed = reimbursements.reduce((acc, r) => acc + r.amount, 0);

    return NextResponse.json({ total: totalReimbursed });
  } catch (error) {
    console.error("Get total reimbursed error:", error);
    return NextResponse.json({ error: "Failed to get total reimbursed" }, { status: 500 });
  }
}
