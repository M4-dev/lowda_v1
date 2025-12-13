import { NextResponse } from "next/server";
import getCurrentUser from "@/actions/get-current-user";
import prisma from "@/libs/prismadb";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { amount } = body;

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  try {
    // Insert reimbursement record
    await prisma.reimbursement.create({
      data: {
        amount: amount,
        createdAt: new Date(),
      },
    });

    // Mark all non-reimbursed paid orders as reimbursed
    await prisma.order.updateMany({
      where: {
        paymentConfirmed: true,
        reimbursed: { not: true },
      },
      data: {
        reimbursed: true,
        reimbursedAt: new Date(),
      },
    });

    // Calculate total reimbursed
    const reimbursements = await prisma.reimbursement.findMany();
    const totalReimbursed = reimbursements.reduce((acc, r) => acc + r.amount, 0);

    return NextResponse.json({ 
      success: true,
      totalReimbursed: totalReimbursed
    });
  } catch (error) {
    console.error("Confirm reimbursement error:", error);
    return NextResponse.json({ error: "Failed to confirm reimbursement" }, { status: 500 });
  }
}
