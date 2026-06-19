import { NextResponse } from "next/server";
import { getRemainingEarlyAdopterSlots, EARLY_ADOPTER_LIMIT } from "@/lib/server/authStore";

export const runtime = "nodejs";
export const revalidate = 0;

export async function GET() {
  const slotsLeft = await getRemainingEarlyAdopterSlots();
  return NextResponse.json({
    slotsLeft,
    totalSlots: EARLY_ADOPTER_LIMIT,
    active: slotsLeft > 0,
  });
}
