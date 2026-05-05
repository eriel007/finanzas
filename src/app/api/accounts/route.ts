import { NextResponse } from "next/server";
import {accountService} from "@/modules/account/account.service";

export async function GET() {
  const accounts = await accountService.getAccounts();
  return NextResponse.json(accounts);
}