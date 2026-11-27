import crypto from "crypto";

interface GameSessionPayload {
  gameId: string;
  startedAt: number;
  nonce: string;
}

const MAX_SESSION_AGE_MS = 30 * 60 * 1000; // 30 minutes

function getSigningSecret(): string | null {
  return process.env.GAME_SIGNING_SECRET || process.env.JWT_SECRET || null;
}

export function signGameSessionToken(gameId: string): {
  token: string;
  expiresInMs: number;
} | null {
  const secret = getSigningSecret();
  if (!secret) return null;

  const payload: GameSessionPayload = {
    gameId,
    startedAt: Date.now(),
    nonce: crypto.randomBytes(8).toString("hex"),
  };

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  return {
    token: `${encodedPayload}.${signature}`,
    expiresInMs: MAX_SESSION_AGE_MS,
  };
}

export function verifyGameSessionToken(
  token: unknown,
  expectedGameId: string
): { valid: boolean; elapsedMs: number; reason?: string } {
  const secret = getSigningSecret();
  if (!secret) {
    return { valid: false, elapsedMs: 0, reason: "Missing signing secret." };
  }

  if (typeof token !== "string" || !token.includes(".")) {
    return { valid: false, elapsedMs: 0, reason: "Missing session token." };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, elapsedMs: 0, reason: "Malformed session token." };
  }

  const [encodedPayload, providedSig] = parts;
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(encodedPayload)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { valid: false, elapsedMs: 0, reason: "Invalid token signature." };
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8")
    ) as GameSessionPayload;

    if (parsed.gameId !== expectedGameId) {
      return {
        valid: false,
        elapsedMs: 0,
        reason: "Token does not match game.",
      };
    }

    const startedAt = Number(parsed.startedAt);
    const elapsedMs = Date.now() - startedAt;

    if (
      !Number.isFinite(startedAt) ||
      elapsedMs < 0 ||
      elapsedMs > MAX_SESSION_AGE_MS
    ) {
      return { valid: false, elapsedMs: 0, reason: "Session expired." };
    }

    return { valid: true, elapsedMs };
  } catch {
    return { valid: false, elapsedMs: 0, reason: "Corrupted token payload." };
  }
}