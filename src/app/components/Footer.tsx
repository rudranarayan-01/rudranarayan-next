"use client";

import React, { useEffect, useRef } from "react";

const Footer = () => {
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          footer.classList.add("fade-in-right");
          observer.unobserve(footer);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(footer);

    return () => observer.disconnect();
  }, []);

  return (
    <footer
      ref={footerRef}
      className="bg-neutral-950 border-t border-neutral-600 text-neutral-100 text-center py-6 opacity-0 transition-opacity duration-700"
    >
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Rudranarayan Sahu. All rights reserved.
      </p>

      <style jsx>{`
        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .fade-in-right {
          opacity: 1 !important;
          animation: fadeRight 0.6s ease-out forwards;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
