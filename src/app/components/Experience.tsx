"use client";

import { motion } from "framer-motion";
import { fadeInRight, fadeInUp } from "../data/variants";

const experiences = [
  {
    role: "Machine Learning Intern",
    company: "CodeAlpha",
    duration: "Jan 2025 – Apr 2025",
    description:
      "Completed an ML internship where I built predictive models, performed data preprocessing, and evaluated performance using Python tools like Scikit-learn and Pandas. Also contributed to data visualization and collaborative project work.",
  },
  {
    role: "Full Stack Development Intern",
    company: "Unified Mentor",
    duration: "Aug 2024 – Oct 2024",
    description:
      "Completed a Full Stack Development internship where I built and maintained web applications using technologies like React, Node.js, Express, and MongoDB. Worked on both frontend and backend, implemented APIs, and contributed to UI/UX improvements and database integration.",
  },
];

export default function ExperienceSection() {
  return (
    <motion.section whileInView="visible" initial="hidden" variants={fadeInUp} id="experience" className="bg-black text-white py-24 px-4 md:px-16">
      <motion.h4
        variants={fadeInRight}
        initial="initial"
        whileInView="whileInView"
        className="text-[15px] text-center text-neutral-300 font-medium "
      >
        JOURNEY THROUGH MY PROFESSIONAL GROWTH.
      </motion.h4>
      <motion.h2
        variants={fadeInUp} 
        initial="hidden"
        whileInView="visible"
        className="text-3xl animated-text-gradient md:text-5xl font-semibold pt-2 mb-6 md:mb-10 text-center text-neutral-100"
      >
        Experience
      </motion.h2>

      <div className="relative flex flex-col gap-16 max-w-4xl mx-auto">
        {experiences.map((exp, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className="group relative bg-[#111] border border-gray-800 rounded-xl p-6 shadow-xl hover:shadow-blue-600/30 transition duration-300 overflow-hidden"
          >
            <div className="absolute top-0 left-0 h-full w-1 animated-text-gradient rounded-full group-hover:scale-y-110 origin-top transition" />
            <div className="pl-4">
              <h3 className="text-2xl font-semibold animated-text-gradient group-hover:text-white transition">
                {exp.role}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {exp.company} — {exp.duration}
              </p>
              <p className="mt-4 text-gray-300 leading-relaxed">{exp.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
