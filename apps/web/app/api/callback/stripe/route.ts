import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error: "Stripe webhook callback is only available in the Enterprise Edition.",
    },
    { status: 404 },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: "Stripe webhook callback is only available in the Enterprise Edition.",
    },
    { status: 404 },
  );
}
