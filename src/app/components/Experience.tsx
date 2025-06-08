"use client";

import { motion } from "framer-motion";
import { fadeInRight, fadeInUp } from "../data/variants";

const experiences = [
  {
    role: "Python Developer",
    company: "Datapirates",
    duration: "Jan 2024 – Present",
    description:
      "Built scalable ML pipelines, integrated cloud APIs, and contributed to real-time data dashboards using FastAPI and Pandas.",
  },
  {
    role: "Embedded Intern",
    company: "IoT Innovators",
    duration: "Aug 2023 – Dec 2023",
    description:
      "Worked with ESP32 and Raspberry Pi to build automation projects, integrating real-time data with MQTT and Firebase.",
  },
  {
    role: "Full Stack Intern",
    company: "TechNova",
    duration: "Feb 2023 – Jul 2023",
    description:
      "Developed full-stack applications with MERN stack. Built dashboards, authentication, and integrated RESTful APIs.",
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
