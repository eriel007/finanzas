import { NextResponse } from "next/server";
import { accountService } from "@/modules/account/account.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const account = await accountService.getAccountById(id);
    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Error && error.message === "Account not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching account" },
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
    const account = await accountService.updateAccount(id, body);
    return NextResponse.json(account);
  } catch (error) {
    if (error instanceof Error && error.message === "Account not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error updating account" },
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
    await accountService.deleteAccount(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Account not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting account" },
      { status: 500 }
    );
  }
}
