import { NextResponse } from "next/server";
import { transactionService } from "@/modules/transaction/transaction.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const transaction = await transactionService.createTransaction(body);

    return NextResponse.json(transaction);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error creando transacción" },
      { status: 500 }
    );
  }
}