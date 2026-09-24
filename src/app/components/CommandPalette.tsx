"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { 
  FiFolder, FiFileText, FiLinkedin, FiGithub, 
  FiMail, FiTerminal, FiX, FiExternalLink 
} from "react-icons/fi";

export const CommandPalette = () => {
  const [open, setOpen] = useState(false);

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Added optional chaining (e.key?.toLowerCase()) to prevent undefined errors
      if (e.key?.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      {/* Floating Bottom-Left Trigger Button */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setOpen(true)}
          className="group flex items-center gap-2.5 rounded-full border border-neutral-800/80 bg-neutral-900/90 px-4 py-2 text-xs font-medium text-neutral-300 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-neutral-700 hover:bg-neutral-800/90 hover:text-white hover:scale-105 active:scale-95"
        >
          <FiTerminal className="text-emerald-400 text-sm transition-transform duration-300 group-hover:rotate-6" />
          <span className="hidden sm:inline">Quick Actions</span>
          <kbd className="rounded-md bg-neutral-800/80 border border-neutral-700/60 px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 group-hover:text-neutral-200">
            ⌘ K
          </kbd>
        </button>
      </div>

      {/* Modal Dialog */}
      {open && (
        <div 
          className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/75 backdrop-blur-md p-4 pt-16 sm:pt-4 transition-opacity duration-200"
          onClick={() => setOpen(false)}
        >
          <div 
            className="relative w-full max-w-lg rounded-2xl border border-neutral-800/90 bg-neutral-900/95 shadow-[0_0_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-xl overflow-hidden text-neutral-100 animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            <Command label="Command Palette" className="w-full">
              {/* Header Search Bar */}
              <div className="flex items-center border-b border-neutral-800/80 px-4 py-1">
                <FiTerminal className="mr-3 text-neutral-400 text-base" />
                <Command.Input
                  autoFocus
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent py-3.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none"
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300 transition-colors"
                  aria-label="Close Command Palette"
                >
                  <FiX className="text-base" />
                </button>
              </div>

              {/* Suggestions List */}
              <Command.List className="max-h-80 overflow-y-auto p-2 text-xs text-neutral-400 scrollbar-thin scrollbar-thumb-neutral-800">
                <Command.Empty className="py-8 text-center text-sm text-neutral-500">
                  No commands found.
                </Command.Empty>

                {/* Section: Navigation */}
                <Command.Group heading="Navigation" className="px-2 py-1.5 font-semibold text-neutral-500 text-[10px] uppercase tracking-wider">
                  <Command.Item
                    onSelect={() => { 
                      window.location.href = "#projects"; 
                      setOpen(false); 
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-neutral-200 cursor-pointer transition-colors hover:bg-neutral-800/70 hover:text-white data-[selected='true']:bg-neutral-800 data-[selected='true']:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FiFolder className="text-neutral-400 text-sm" /> 
                      <span className="text-xs sm:text-sm">Featured Projects</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">#projects</span>
                  </Command.Item>

                  <Command.Item
                    onSelect={() => { 
                      window.location.href = "/blog"; 
                      setOpen(false); 
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-neutral-200 cursor-pointer transition-colors hover:bg-neutral-800/70 hover:text-white data-[selected='true']:bg-neutral-800 data-[selected='true']:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FiFileText className="text-neutral-400 text-sm" /> 
                      <span className="text-xs sm:text-sm">Technical Blog & Articles</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">/blog</span>
                  </Command.Item>
                </Command.Group>

                {/* Section: Socials & External Links */}
                <Command.Group heading="Socials & Contact" className="px-2 py-1.5 font-semibold text-neutral-500 text-[10px] uppercase tracking-wider mt-2">
                  <Command.Item
                    onSelect={() => { 
                      window.open("https://github.com/rudranarayan-01", "_blank"); 
                      setOpen(false); 
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-neutral-200 cursor-pointer transition-colors hover:bg-neutral-800/70 hover:text-white data-[selected='true']:bg-neutral-800 data-[selected='true']:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FiGithub className="text-neutral-400 text-sm" /> 
                      <span className="text-xs sm:text-sm">GitHub Profile</span>
                    </div>
                    <FiExternalLink className="text-neutral-500 text-xs" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => { 
                      window.open("https://www.linkedin.com/in/rudranarayan-sahu-b7b9a6244/", "_blank"); 
                      setOpen(false); 
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-neutral-200 cursor-pointer transition-colors hover:bg-neutral-800/70 hover:text-white data-[selected='true']:bg-neutral-800 data-[selected='true']:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FiLinkedin className="text-neutral-400 text-sm" /> 
                      <span className="text-xs sm:text-sm">LinkedIn Profile</span>
                    </div>
                    <FiExternalLink className="text-neutral-500 text-xs" />
                  </Command.Item>

                  <Command.Item
                    onSelect={() => { 
                      window.location.href = "mailto:rudranarayansahu.tech@gmail.com"; 
                      setOpen(false); 
                    }}
                    className="flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-neutral-200 cursor-pointer transition-colors hover:bg-neutral-800/70 hover:text-white data-[selected='true']:bg-neutral-800 data-[selected='true']:text-white"
                  >
                    <div className="flex items-center gap-3">
                      <FiMail className="text-neutral-400 text-sm" /> 
                      <span className="text-xs sm:text-sm">Send Direct Email</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-mono">mailto</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-neutral-800/80 px-4 py-2.5 text-[10px] text-neutral-500 bg-neutral-950/40">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-neutral-700/80 bg-neutral-800 px-1 py-0.5 font-mono text-[9px] text-neutral-300">↑↓</kbd>
                  to navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-neutral-700/80 bg-neutral-800 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300">ESC</kbd>
                  to exit
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
};