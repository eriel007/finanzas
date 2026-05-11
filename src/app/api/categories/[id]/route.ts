import { NextResponse } from "next/server";
import { categoryService } from "@/modules/category/category.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const category = await categoryService.getCategoryById(id);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching category" },
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
    const category = await categoryService.updateCategory(id, body);
    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error updating category" },
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
    await categoryService.deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message === "Category not found") {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "Error deleting category" },
      { status: 500 }
    );
  }
}
