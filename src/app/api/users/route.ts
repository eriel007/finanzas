import { NextResponse } from "next/server";
import { userService } from "@/modules/user/user.service";

export async function GET() {
  const user =  await userService.getUsers()
  return NextResponse.json(user)
}