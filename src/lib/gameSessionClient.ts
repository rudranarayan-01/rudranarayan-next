export async function startGameSession(gameId: string): Promise<string | null> {
  try {
    const res = await fetch("/api/leaderboard/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameId }),
    });
    const data = await res.json();
    if (!res.ok || !data?.success || !data?.sessionToken) {
      return null;
    }
    return String(data.sessionToken);
  } catch {
    return null;
  }
}