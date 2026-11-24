import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { LeaderboardScore } from "@/models/LeaderboardScore";

function normalizeIp(raw?: string | null): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^::ffff:/i, "");
  return cleaned.length > 0 ? cleaned.slice(0, 64) : null;
}

function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0];
    const normalized = normalizeIp(firstIp);
    if (normalized) return normalized;
  }

  const realIp = normalizeIp(req.headers.get("x-real-ip"));
  if (realIp) return realIp;

  const cfIp = normalizeIp(req.headers.get("cf-connecting-ip"));
  if (cfIp) return cfIp;

  return null;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const gameId = (searchParams.get("gameId") || "packet-recovery")
      .trim()
      .slice(0, 64);
    const rawLimit = Number(searchParams.get("limit") ?? 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(Math.floor(rawLimit), 1), 25)
      : 10;

    const scores = await LeaderboardScore.find({ gameId })
      .sort({ score: -1, createdAt: 1 })
      .limit(limit)
      .select("playerName score createdAt")
      .lean();

    return NextResponse.json({ success: true, data: scores }, { status: 200 });
  } catch (error) {
    console.error("Leaderboard GET error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load leaderboard." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const gameId = String(body.gameId || "packet-recovery")
      .trim()
      .slice(0, 64);
    const rawName = String(body.playerName || "").trim();
    const numericScore = Number(body.score);

    if (!gameId) {
      return NextResponse.json(
        { success: false, error: "gameId is required." },
        { status: 400 }
      );
    }

    if (!rawName || rawName.length > 24) {
      return NextResponse.json(
        {
          success: false,
          error: "Name must be between 1 and 24 characters.",
        },
        { status: 400 }
      );
    }

    if (!Number.isFinite(numericScore) || numericScore <= 0) {
      return NextResponse.json(
        { success: false, error: "Score must be greater than 0." },
        { status: 400 }
      );
    }

    const cleanName = rawName.replace(/\s+/g, " ");
    const nextScore = Math.floor(numericScore);
    const clientIp = getClientIp(req);
    const nameRegex = new RegExp(`^${escapeRegex(cleanName)}$`, "i");
    const now = new Date();

    const record = await LeaderboardScore.findOneAndUpdate(
      { gameId, playerName: nameRegex },
      [
        {
          $set: {
            gameId,
            playerName: cleanName,
            score: {
              $max: [{ $ifNull: ["$score", 0] }, nextScore],
            },
            ipAddress: clientIp ?? { $ifNull: ["$ipAddress", null] },
            createdAt: { $ifNull: ["$createdAt", now] },
            updatedAt: now,
          },
        },
      ],
      {
        new: true,
        upsert: true,
        updatePipeline: true,
      }
    );

    const safeRecord = {
      _id: record._id,
      gameId: record.gameId,
      playerName: record.playerName,
      score: record.score,
      createdAt: record.createdAt,
    };

    return NextResponse.json(
      { success: true, data: safeRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error("Leaderboard POST error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save score." },
      { status: 500 }
    );
  }
}