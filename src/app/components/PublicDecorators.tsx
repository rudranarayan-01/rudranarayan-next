"use client";

import { usePathname } from "next/navigation";
import RippleCursor from "./RippleCursor";
import { CommandPalette } from "./CommandPalette";
import { BlogToast } from "./BlogToast";

export default function PublicDecorators() {
  const pathname = usePathname();

  // Hide components on all /superadmin routes
  if (pathname.startsWith("/superadmin")) {
    return null;
  }

  return (
    <>
      <RippleCursor />
      <CommandPalette />
      <BlogToast />
    </>
  );
}