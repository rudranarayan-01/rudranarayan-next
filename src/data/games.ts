export interface PortfolioGame {
  id: string;
  title: string;
  tagline: string;
  description: string;
  controls: string;
  status: "playable" | "coming-soon";
  tag: string;
}
export const PORTFOLIO_GAMES: PortfolioGame[] = [
  {
    id: "packet-recovery",
    title: "Packet Recovery",
    tagline: "Catch 200 OK packets and dodge 404 / ERR bugs.",
    description:
      "Fast-paced reflex arcade mini-game where speed scales up as you recover valid payloads without losing system integrity.",
    controls: "← / →, A / D, or drag",
    status: "playable",
    tag: "Arcade · Reflex",
  },
  {
    id: "sequence-memory",
    title: "Sequence Memory",
    tagline: "Repeat lighting node sequences as rounds grow longer.",
    description:
      "Memory pattern challenge across a 3x3 terminal grid.",
    controls: "Click nodes",
    status: "playable",
    tag: "Memory",
  },
  {
    id: "grid-sweep",
    title: "Grid Sweep",
    tagline: "Clear safe sectors using fault counts and right-click flags.",
    description:
      "Logic grid game on a 6x6 board with safe-start protection.",
    controls: "Click & Right-click",
    status: "playable",
    tag: "Logic",
  },
  {
    id: "latency-dodge",
    title: "Latency Dodge",
    tagline: "Weave through 502, TIMEOUT, and JITTER spikes.",
    description:
      "Survival reflex game where spike frequency and speed ramp up the longer your node stays online.",
    controls: "← / →, A / D, or drag",
    status: "playable",
    tag: "Arcade · Survival",
  },
  {
    id: "index-sprint",
    title: "Index Sprint",
    tagline: "30-second rapid-fire math & streak challenge.",
    description:
      "Solve arithmetic challenges under a 30-second clock to build streaks and post high scores.",
    controls: "Keys 1–4 or Click",
    status: "playable",
    tag: "Logic · Speed",
  },
  {
    id: "flag-cipher",
    title: "Flag Cipher",
    tagline: "Identify world flags against a 45-second clock.",
    description:
      "Fast-paced vexillology sprint with streak multipliers and keyboard shortcuts.",
    controls: "Keys 1–4 or Click",
    status: "playable",
    tag: "Trivia · Speed",
  },
 {
    id: "chess-tactics",
    title: "Chess Tactics",
    tagline: "Outmaneuver the bot, capture pieces, and deliver checkmate.",
    description:
      "Turn-based 8x8 chess match against a tactical bot with piece-capture points and a checkmate bonus.",
    controls: "Click Square",
    status: "playable",
    tag: "Strategy · Board",
  },
];