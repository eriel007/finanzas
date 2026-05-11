import { NextResponse } from "next/server";
import { accountService } from "@/modules/account/account.service";

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
    const accounts = await accountService.getAccounts(userId);
    return NextResponse.json(accounts);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.userId) {
      return NextResponse.json(
        { error: "name and userId are required" },
        { status: 400 }
      );
    }

    const account = await accountService.createAccount(body);
    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error creating account" },
      { status: 500 }
    );
  }
}
