import { NextResponse } from "next/server";
import { categoryService } from "@/modules/category/category.service";

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
    const categories = await categoryService.getCategories(userId);
    return NextResponse.json(categories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.name || !body.type || !body.userId) {
      return NextResponse.json(
        { error: "name, type and userId are required" },
        { status: 400 }
      );
    }

    const category = await categoryService.createCategory(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "User not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error creating category" },
      { status: 500 }
    );
  }
}
