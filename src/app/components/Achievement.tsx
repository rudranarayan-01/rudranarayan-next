"use client";

import { motion } from "framer-motion";

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

export default function Achievements() {
  return (
    <section
      id="achievements"
      className="bg-black py-20 px-4 md:px-12 text-white"
    >
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          🎖 Achievements & Organizations
        </h2>
        <div className="grid md:grid-cols-2 gap-10">
          {achievements.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-zinc-900 p-6 rounded-xl shadow-md border border-zinc-800"
            >
              <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
