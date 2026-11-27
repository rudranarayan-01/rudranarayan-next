import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db"; // adjust to your db connection helper
import { LeaderboardScore } from "@/models/LeaderboardScore"; // adjust path
import { PORTFOLIO_GAMES } from "@/data/games";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const gameIdFilter = (searchParams.get("gameId") || "ALL").trim();
    const search = (searchParams.get("q") || "").trim().toLowerCase();

    const matchStage: Record<string, any> = {};
    if (gameIdFilter && gameIdFilter !== "ALL") {
      matchStage.gameId = gameIdFilter;
    }

    const titleMap = new Map<string, string>(
      PORTFOLIO_GAMES.map((g) => [g.id, g.title]),
    );

    // 1. Fetch filtered entries ordered by highest score then latest update
    const rawEntries = await LeaderboardScore.find(matchStage)
      .sort({ score: -1, updatedAt: -1 })
      .lean();

    const entries = rawEntries
      .filter((row) => {
        if (!search) return true;
        return (
          row.playerName?.toLowerCase().includes(search) ||
          row.gameId?.toLowerCase().includes(search) ||
          (titleMap.get(row.gameId) || "").toLowerCase().includes(search) ||
          (row.ipAddress || "").toLowerCase().includes(search)
        );
      })
      .map((row) => ({
        _id: String(row._id),
        gameId: row.gameId,
        gameTitle: titleMap.get(row.gameId) || row.gameId,
        playerName: row.playerName,
        score: row.score,
        playsCount: (row as any).playsCount ?? 1,
        ipAddress: row.ipAddress || "unknown",
        createdAt: row.createdAt,
        updatedAt: (row as any).updatedAt || row.createdAt,
      }));

    // 2. Per-game summary (total plays, unique players, top score, leader)
    const gameStatsMap = new Map<
      string,
      {
        gameId: string;
        gameTitle: string;
        totalPlays: number;
        entriesCount: number;
        highestScore: number;
        topPlayer: string;
        uniqueIps: Set<string>;
      }
    >();

    for (const item of entries) {
      const existing = gameStatsMap.get(item.gameId);
      if (!existing) {
        gameStatsMap.set(item.gameId, {
          gameId: item.gameId,
          gameTitle: item.gameTitle,
          totalPlays: item.playsCount,
          entriesCount: 1,
          highestScore: item.score,
          topPlayer: item.playerName,
          uniqueIps: new Set([item.ipAddress]),
        });
      } else {
        existing.totalPlays += item.playsCount;
        existing.entriesCount += 1;
        existing.uniqueIps.add(item.ipAddress);
        if (item.score > existing.highestScore) {
          existing.highestScore = item.score;
          existing.topPlayer = item.playerName;
        }
      }
    }

    const byGame = Array.from(gameStatsMap.values())
      .map((g) => ({
        gameId: g.gameId,
        gameTitle: g.gameTitle,
        totalPlays: g.totalPlays,
        entriesCount: g.entriesCount,
        highestScore: g.highestScore,
        topPlayer: g.topPlayer,
        uniqueIps: g.uniqueIps.size,
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays);

    // 3. Per-IP summary (which games played, play count, players seen, peak score)
    const ipStatsMap = new Map<
      string,
      {
        ipAddress: string;
        totalPlays: number;
        peakScore: number;
        players: Set<string>;
        games: Set<string>;
        lastSeen: string;
      }
    >();

    for (const item of entries) {
      const ip = item.ipAddress || "unknown";
      const timestamp = new Date(
        item.updatedAt || item.createdAt,
      ).toISOString();
      const existing = ipStatsMap.get(ip);

      if (!existing) {
        ipStatsMap.set(ip, {
          ipAddress: ip,
          totalPlays: item.playsCount,
          peakScore: item.score,
          players: new Set([item.playerName]),
          games: new Set([item.gameTitle]),
          lastSeen: timestamp,
        });
      } else {
        existing.totalPlays += item.playsCount;
        existing.peakScore = Math.max(existing.peakScore, item.score);
        existing.players.add(item.playerName);
        existing.games.add(item.gameTitle);
        if (timestamp > existing.lastSeen) {
          existing.lastSeen = timestamp;
        }
      }
    }

    const byIp = Array.from(ipStatsMap.values())
      .map((info) => ({
        ipAddress: info.ipAddress,
        totalPlays: info.totalPlays,
        peakScore: info.peakScore,
        players: Array.from(info.players),
        games: Array.from(info.games),
        lastSeen: info.lastSeen,
      }))
      .sort((a, b) => b.totalPlays - a.totalPlays);

    // 4. Overall KPI totals
    const totalPlays = entries.reduce((acc, r) => acc + r.playsCount, 0);
    const highestScore = entries.reduce((max, r) => Math.max(max, r.score), 0);
    const uniquePlayers = new Set(
      entries.map((r) => r.playerName.toLowerCase()),
    ).size;
    const uniqueIps = byIp.length;

    return NextResponse.json({
      success: true,
      kpis: {
        totalPlays,
        totalRecords: entries.length,
        highestScore,
        uniquePlayers,
        uniqueIps,
      },
      byGame,
      byIp,
      leaderboard: entries,
    });
  } catch (err: any) {
    console.error("Admin games telemetry error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load telemetry." },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing score entry id." },
        { status: 400 },
      );
    }

    await LeaderboardScore.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to delete entry." },
      { status: 500 },
    );
  }
}
