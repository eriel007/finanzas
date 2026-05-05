import { NextResponse } from "next/server";
import { categoryService } from "@/modules/category/category.service";

export async function GET() {
  const categories =  await categoryService.getCategories()
  return NextResponse.json(categories)
}