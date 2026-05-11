import { NextResponse } from "next/server";
import { authService } from "@/modules/auth/auth.service";
import { registerSchema } from "@/modules/auth/auth.schema";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.issues },
        { status: 400 }
      );
    }

    const result = await authService.register(validation.data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "Email already in use") {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}
