import { NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";
import { loginSchema } from "@/modules/auth/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await authService.login(validation.data);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.message === "Invalid credentials") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error logging in" },
      { status: 500 }
    );
  }
}
