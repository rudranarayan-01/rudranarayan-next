import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { LeaderboardScore } from "@/models/LeaderboardScore";
import { PORTFOLIO_GAMES } from "@/data/games";
import { verifyGameSessionToken } from "@/lib/gameSessionToken";

const MAX_SCORE_BY_GAME: Record<string, number> = {
  "packet-recovery": 5000,
  "latency-dodge": 10000,
  "index-sprint": 5000,
  "sequence-memory": 5000,
  "grid-sweep": 5000,
  "flag-cipher": 5000,
  "stack-guesser": 5000,
  "chess-tactics": 2000,
};

const RATE_WINDOW_MS = 60_000;
const MAX_SUBMISSIONS_PER_WINDOW = 8;
const rateLimitStore = new Map<string, number[]>();

// Tracks recently used token nonces in memory (expires after 30m)
const usedNonces = new Map<string, number>();
const NONCE_TTL_MS = 30 * 60 * 1000;

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

function isRateLimited(ipKey: string): boolean {
  const now = Date.now();
  const recent = (rateLimitStore.get(ipKey) || []).filter(
    (ts) => now - ts < RATE_WINDOW_MS
  );
  if (recent.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    rateLimitStore.set(ipKey, recent);
    return true;
  }
  recent.push(now);
  rateLimitStore.set(ipKey, recent);
  return false;
}

function isAllowedOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  const host = req.headers.get("host");

  if (!origin && !referer) return false;

  const allowedHosts = new Set<string>();
  if (host) allowedHosts.add(host.toLowerCase());

  if (process.env.NEXT_PUBLIC_SITE_URL) { 
    try {
      allowedHosts.add(
        new URL(process.env.NEXT_PUBLIC_SITE_URL).host.toLowerCase()
      );
    } catch {
      // Ignore malformed env URL
    }
  }

  try {
    if (origin && allowedHosts.has(new URL(origin).host.toLowerCase())) {
      return true;
    }
    if (referer && allowedHosts.has(new URL(referer).host.toLowerCase())) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

function consumeNonce(nonce?: string): boolean {
  if (!nonce) return true;
  const now = Date.now();

  for (const [key, expiresAt] of usedNonces.entries()) {
    if (expiresAt <= now) usedNonces.delete(key);
  }

  if (usedNonces.has(nonce)) {
    return false;
  }

  usedNonces.set(nonce, now + NONCE_TTL_MS);
  return true;
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
    const clientIp = getClientIp(req);
    const rateKey = clientIp || "unknown";

    if (isRateLimited(rateKey)) {
      return NextResponse.json(
        {
          success: false,
          error: "Too many submissions. Please try again in a minute.",
        },
        { status: 429 }
      );
    }

    if (!isAllowedOrigin(req)) {
      return NextResponse.json(
        { success: false, error: "Forbidden request origin." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body." },
        { status: 400 }
      );
    }

    const gameId = String(body.gameId || "")
      .trim()
      .slice(0, 64);
    const rawName = String(body.playerName || "").trim();
    const numericScore = Number(body.score);
    const sessionToken = body.sessionToken;

    const validGame = PORTFOLIO_GAMES.find(
      (g) => g.id === gameId && g.status === "playable"
    );
    if (!validGame) {
      return NextResponse.json(
        { success: false, error: "Invalid or unplayable gameId." },
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

    const maxScore = MAX_SCORE_BY_GAME[gameId] ?? 10000;
    if (
      !Number.isFinite(numericScore) ||
      numericScore <= 0 ||
      Math.floor(numericScore) > maxScore
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Score must be between 1 and ${maxScore}.`,
        },
        { status: 400 }
      );
    }

    const tokenCheck = verifyGameSessionToken(sessionToken, gameId);
    if (!tokenCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: tokenCheck.reason || "Invalid or expired game session.",
        },
        { status: 403 }
      );
    }

    // Extract nonce to prevent replaying the exact same session token
    let tokenNonce: string | undefined;
    try {
      const payloadPart = String(sessionToken).split(".")[0];
      const decoded = JSON.parse(
        Buffer.from(payloadPart, "base64url").toString("utf8")
      );
      if (typeof decoded?.nonce === "string") {
        tokenNonce = decoded.nonce;
      }
    } catch {
      // Already verified by verifyGameSessionToken
    }

    if (!consumeNonce(tokenNonce)) {
      return NextResponse.json(
        { success: false, error: "Session token has already been used." },
        { status: 403 }
      );
    }

    await connectDB();

    const cleanName = rawName.replace(/\s+/g, " ");
    const nextScore = Math.floor(numericScore);
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