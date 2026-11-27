import { NextRequest, NextResponse } from "next/server";
import { PORTFOLIO_GAMES } from "@/data/games";
import { signGameSessionToken } from "@/lib/gameSessionToken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const gameId = String(body?.gameId || "").trim();

    const game = PORTFOLIO_GAMES.find(
      (g) => g.id === gameId && g.status === "playable"
    );

    if (!game) {
      return NextResponse.json(
        { success: false, error: "Invalid or unplayable gameId." },
        { status: 400 }
      );
    }

    const signed = signGameSessionToken(gameId);
    if (!signed) {
      return NextResponse.json(
        {
          success: false,
          error: "Server signing secret is not configured.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      sessionToken: signed.token,
      expiresInMs: signed.expiresInMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to start game session." },
      { status: 500 }
    );
  }
}