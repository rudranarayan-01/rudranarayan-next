"use client";

import React, { useEffect, useRef, useState } from "react";
import { projects } from "../data/data";
import Image from "next/image";
import { FiExternalLink } from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

const Projects = React.forwardRef<HTMLElement, unknown>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll animation
  useEffect(() => {
    const elements = containerRef.current?.querySelectorAll(".animate-on-scroll");
    if (!elements) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="bg-neutral-950 flex flex-col justify-center items-center text-neutral-100 py-6 sm:py-16"
    >
      <div className="text-[15px] text-center  text-neutral-300 font-medium animate-on-scroll opacity-0">
        EXPLORE MY CREATIONS
      </div>
      <h2 className="text-3xl animated-text-gradient animated-text-gradient md:text-5xl font-semibold pt-2 pb-1 mb-6 md:mb-10 text-neutral-100 text-center animate-on-scroll opacity-0">
        Projects
      </h2>

      <div ref={containerRef} className="px-4 lg:w-4xl">
        {projects.map((project, index) => (
          <div
            key={index}
            className="project group flex max-lg:flex-col max-lg:pb-4 bg-neutral-950 gap-4 my-4 shadow-md rounded-2xl hover:shadow-lg transition border border-neutral-600 duration-300 overflow-hidden animate-on-scroll opacity-0"
            style={{
              top: `calc(72px + ${index * 30}px)`,
            }}
          >
            <div className="projectinfo flex flex-1 flex-col p-4 md:p-8 h-96">
              <h3 className="text-xl md:text-3xl border-b border-neutral-600 pb-2 text-neutral-100 font-semibold">
                {project.name}
              </h3>
              <p className="text-neutral-100 mt-2">{project.description}</p>
              <ul>
                {project.points.map((listItem, index) => (
                  <li className="text-sm pt-2" key={index}>
                    - {listItem}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1 mt-4">
                {project.techStack.map((tech, i) => {
                  const Icon = tech.icon;
                  return (
                    <span
                      key={i}
                      className="flex items-center gap-2 text-xs px-3 py-1 rounded-full border border-neutral-600"
                    >
                      <Icon style={{ color: tech.color }} /> {tech.name}
                    </span>
                  );
                })}
              </div>

              <div className="flex gap-4 mt-5">
                <a
                  href={project.githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl flex justify-center items-center gap-2 text-sm border border-neutral-600 shadow-md hover:bg-neutral-800 hover:text-white transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.5"
                >
                  GitHub
                  <FaGithub />
                </a>
                <a
                  href={project.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2 rounded-xl flex justify-center items-center gap-2 text-sm border border-neutral-600 shadow-md hover:bg-blue-800 hover:text-white transition-transform duration-300 ease-out hover:scale-105 hover:-translate-y-0.5"
                >
                  Live Site
                  <FiExternalLink />
                </a>
              </div>
            </div>

            <div className="relative flex-1 overflow-visible">
              <div
                className="projectimg relative w-full h-40 sm:h-80 md:h-96 lg:w-[167%] lg:h-[22rem] border border-neutral-600 rounded-xl transition-transform duration-500 ease-in-out group-hover:lg:transform group-hover:lg:-translate-x-80 group-hover:lg:-translate-y-16"
              >
                <Image
                  src={project.image}
                  fill
                  className="rounded-xl object-contain"
                  alt={`${project.name} screenshot`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll Animation Keyframes */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-on-scroll.animated {
          opacity: 1 !important;
          animation: fadeUp 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
});
Projects.displayName = "Projects";

export default Projects;
