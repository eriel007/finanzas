import { NextResponse } from "next/server";
import { transactionService } from "@/modules/transaction/transaction.service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    if (!userId) {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 }
      );
    }
    const transactions = await transactionService.getTransactions(userId);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching transactions" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (typeof body.amount !== "number" || !body.type || !body.userId || !body.accountId || !body.categoryId) {
      return NextResponse.json(
        { error: "amount, type, userId, accountId and categoryId are required" },
        { status: 400 }
      );
    }

    const transaction = await transactionService.createTransaction(body);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    if (error instanceof Error && (error.message === "Account not found" || error.message === "Category not found")) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error creating transaction" },
      { status: 500 }
    );
  }
}
