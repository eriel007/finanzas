import { NextResponse } from "next/server";
import { transactionService } from "@/modules/transaction/transaction.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const transaction = await transactionService.getTransactionById(id);
    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching transaction" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const transaction = await transactionService.updateTransaction(id, body);
    return NextResponse.json(transaction);
  } catch (error) {
    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error updating transaction" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await transactionService.deleteTransaction(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Transaction not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting transaction" },
      { status: 500 }
    );
  }
}
