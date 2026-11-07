export const newProjectsSeed = [
  {
    name: "Carpooling Platform",
    slug: "carpooling-platform-mobile",
    description: "An internal mobile ride-sharing community network application designed to optimize commuting through secure community network transit maps and verified driver requests.",
    longDescription: "Engineered as an internal mobility solution, this mobile app empowers verified drivers to publish commuting routes while enabling passengers to book seats via request verification workflows. Features real-time route rendering and secure in-app messaging channels.",
    status: "Published",
    thumbnailUrl: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1506015391300-4802dc74de2e?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=800&auto=format&fit=crop"
    ],
    links: [
      { label: "GitHub Repository", url: "https://github.com/rudranarayan-01/carpooling-platform", icon: "github" }
    ],
    clientInfo: {
      name: "Internal R&D",
      company: "Internal Project"
    },
    techStack: ["React Native", "Expo", "Node.js", "Supabase", "Google Maps API", "TypeScript"],
    architectureFlow: [
      {
        stepNumber: 1,
        title: "User Auth & Profile Verification",
        description: "Supabase authentication handles multi-factor user profiles, separating verified drivers from standard commuters through secure role-based claims.",
        techUsed: ["Supabase Auth", "React Native"]
      },
      {
        stepNumber: 2,
        title: "Ride Publishing & Request Engine",
        description: "Drivers broadcast route waypoints, departure times, and seat limits. Passengers submit booking requests triggering instant approval workflows.",
        techUsed: ["Node.js", "Express", "Supabase DB"]
      },
      {
        stepNumber: 3,
        title: "Real-Time Map & Telemetry Tracking",
        description: "Integrates Google Maps API to plot active transit coordinates, calculate optimal distance matrices, and update live vehicle telemetry.",
        techUsed: ["Google Maps API", "Expo Location"]
      },
      {
        stepNumber: 4,
        title: "Encrypted Driver-Passenger Chat",
        description: "Real-time socket connection enabling secure, low-latency messaging between matched riders for pickup coordination.",
        techUsed: ["Node.js", "WebSockets", "Supabase Realtime"]
      }
    ]
  },
  {
    name: "AdjusterAssist",
    slug: "adjusterassist-mobile-ai",
    description: "A US-based mobile insurance claim adjuster assistant powered by OpenAI APIs for automated draft generation, OCR document analysis, and strict guardrail compliance.",
    longDescription: "Built for professional insurance adjusters in the United States, AdjusterAssist streamlines claims processing by ingesting raw field notes or uploaded documents via OCR, classifying audiences, and generating customized draft reports across various structural formats and tones.",
    status: "Published",
    thumbnailUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=800&auto=format&fit=crop"
    ],
    links: [
      { label: "Client Portal", url: "https://adjusterassist.local", icon: "external" },
      { label: "GitHub Repository", url: "https://github.com/rudranarayan-01/adjuster-assist", icon: "github" }
    ],
    clientInfo: {
      name: "Bruce Walker",
      company: "US Independent Insurance Adjuster Services"
    },
    techStack: ["React Native", "Expo", "Node.js", "Express", "Supabase", "OpenAI API", "OCR Engine"],
    architectureFlow: [
      {
        stepNumber: 1,
        title: "Secure MFA & Session Gateway",
        description: "Enforces enterprise-grade Multi-Factor Authentication (MFA) to safeguard sensitive insurance policy data and claimant records.",
        techUsed: ["Supabase Auth", "Node.js MFA Middleware"]
      },
      {
        stepNumber: 2,
        title: "OCR Ingestion & Document Parsing",
        description: "Extracts text from uploaded accident reports and receipts using OCR pipelines, formatting raw inputs for downstream RAG processing.",
        techUsed: ["OCR Parser", "Supabase Storage"]
      },
      {
        stepNumber: 3,
        title: "RAG Pipeline & Audience Classification",
        description: "Contextualizes claims data against regulatory knowledge bases, classifying output tones and audiences before querying the LLM.",
        techUsed: ["OpenAI API", "Vector Embeddings"]
      },
      {
        stepNumber: 4,
        title: "Guardrails & Signature Verification",
        description: "Applies automated compliance guardrails to filter out hallucinated metrics, followed by digital signature capture and draft refinement.",
        techUsed: ["OpenAI Moderation API", "Signature Detection Module"]
      }
    ]
  },
  {
    name: "ClaimScope Consulting",
    slug: "claimscope-consulting-platform",
    description: "An enterprise multi-tenant AI insurance platform enabling multiple corporations to manage claims, align resources with governance frameworks, and generate AI drafts.",
    longDescription: "ClaimScope Consulting provides a robust multi-tenant architecture designed for enterprise insurers. It incorporates rigorous Role-Based Access Control (RBAC), multi-factor authentication, and automated AI draft generation aligned with modern governance advisory methodologies.",
    status: "Published",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=800&auto=format&fit=crop"
    ],
    links: [
      { label: "Enterprise Portal", url: "https://claimscope.local", icon: "external" },
      { label: "GitHub Repository", url: "https://github.com/rudranarayan-01/claimscope-enterprise", icon: "github" }
    ],
    clientInfo: {
      name: "Terrance Walker",
      company: "ClaimScope Enterprise USA"
    },
    techStack: ["React Native", "Expo", "Node.js", "Express", "SQL", "OpenAI API", "TypeScript"],
    architectureFlow: [
      {
        stepNumber: 1,
        title: "Multi-Tenant Namespace Isolation",
        description: "Configures logical database separation and tenant routing middleware to ensure enterprise corporate data remains strictly isolated.",
        techUsed: ["Node.js", "SQL Schemas", "Express Routing"]
      },
      {
        stepNumber: 2,
        title: "Granular RBAC & MFA Governance",
        description: "Enforces strict Role-Based Access Control combined with mandatory MFA checkpoints for corporate adjusters and auditors.",
        techUsed: ["JWT", "SQL Access Policies"]
      },
      {
        stepNumber: 3,
        title: "Resource Alignment & Governance Engine",
        description: "Maps claims workflows to standardized governance frameworks, automatically flagging compliance deviations and reallocating resources.",
        techUsed: ["Node.js Logic Modules", "SQL Joins"]
      },
      {
        stepNumber: 4,
        title: "Enterprise AI Draft Generation",
        description: "Leverages fine-tuned LLM microservices to compile comprehensive multi-page claim settlement summaries with audit tracing.",
        techUsed: ["OpenAI API", "Async Workers"]
      }
    ]
  },
  {
    name: "Neuroxis",
    slug: "neuroxis-puzzle-game",
    description: "An enterprise mobile puzzle game platform featuring an active 1v1 multiplayer matchmaking engine, ELO rating systems, daily streaks, and custom algorithmic logic modules.",
    longDescription: "Neuroxis is a feature-rich mobile puzzle suite built with React Native Expo. It offers diverse puzzle mechanics including Shikaku, Sudoku, word puzzles, and rapid math challenges, supported by real-time matchmaking, ELO calculations, and persistent leaderboard tracking.",
    status: "Published",
    thumbnailUrl: "https://images.unsplash.com/photo-1611996575749-79a3a250f948?q=80&w=1200&auto=format&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=800&auto=format&fit=crop"
    ],
    links: [
      { label: "GitHub Repository", url: "https://github.com/rudranarayan-01/neuroxis-game", icon: "github" }
    ],
    clientInfo: {
      name: "Personal Project",
      company: "Independent R&D"
    },
    techStack: ["React Native", "Expo", "Node.js", "Express", "MongoDB", "gRPC", "TypeScript"],
    architectureFlow: [
      {
        stepNumber: 1,
        title: "Client-Side Puzzle Engine (Expo)",
        description: "Optimized puzzle rendering engines for Shikaku, Sudoku, and word games ensuring smooth 60fps gesture interactions.",
        techUsed: ["React Native", "Expo Canvas"]
      },
      {
        stepNumber: 2,
        title: "gRPC & WebSocket Game Gateway",
        description: "Utilizes gRPC protocols for lightning-fast server communication during intense puzzle sessions and state synchronization.",
        techUsed: ["gRPC", "Node.js", "Protocol Buffers"]
      },
      {
        stepNumber: 3,
        title: "1v1 Multiplayer Matchmaking & ELO",
        description: "Automated matchmaking queue pairing players of similar skill levels, calculating competitive ELO adjustments post-match.",
        techUsed: ["MongoDB", "Express Matchmaker Algorithm"]
      },
      {
        stepNumber: 4,
        title: "Leaderboard & Streak Telemetry",
        description: "Aggregates daily scores, win/loss streaks, and global rankings stored efficiently across indexed NoSQL collections.",
        techUsed: ["MongoDB Aggregations", "Redis Cache"]
      }
    ]
  }
];