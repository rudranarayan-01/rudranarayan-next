"use client";

import { motion } from "framer-motion";
import { fadeInRight, fadeInUp } from "../data/variants";

const achievements = [
  {
    title: "🚀 Datapirates : Founder and Organizer",
    description:
      "A learning hub offering live courses, workshops, and events focused on practical, hands-on technical skills.",
  },
  {
    title: "🏆 Python Power : The Eccentric Performer",
    description:
      "Awarded for exceptional performance and innovation at an MSCB University Python workshop.",
  },
  {
    title: "🎤 Speaker at Datapirates Workshops 2024",
    description:
      "Delivered a session on building scalable web applications using the MERN stack.",
  },
  {
    title: "💡 Open Source Contributor",
    description:
      "Contributed to major open-source repositories and enhanced developer documentation.",
  },
];

// scroll animation variants
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const card = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function Achievements() {
  return (
    <motion.section variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      className="bg-neutral-950 flex flex-col justify-center items-center text-neutral-100 py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.h4
          variants={fadeInRight}
          initial="initial"
          whileInView="whileInView"
          className="text-[15px] text-center text-neutral-300 font-medium"
        >
          HIGHLIGHTS OF MY JOURNEY
        </motion.h4>
        <motion.h2
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          className="text-3xl animated-text-gradient md:text-5xl font-semibold pt-2 mb-6 md:mb-10 text-neutral-50 text-center"
        >
          🎖 Achievements & Organizations
        </motion.h2>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-10"
        >
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              variants={card}
              whileHover={{ scale: 1.02 }}
              className="bg-zinc-900 p-6 rounded-xl shadow-lg border border-zinc-800"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
