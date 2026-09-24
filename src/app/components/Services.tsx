"use client";

import Tilt from "react-parallax-tilt";
import { motion } from "framer-motion";
import Link from "next/link";

const tools = [
  {
    title: "AI Interview Prep",
    desc: "Mock interviews powered by AI to assess and improve.",
    link: "https://ai-interview-01.vercel.app",
  },
  {
    title: "Resume & Cover letter Builder",
    desc: "Craft your professional docs in minutes. Also can visit industry insights with current trends.",
    link: "https://next-step-ai-zeta.vercel.app",
  },
  {
    title: "Learning Platform",
    desc: "Join live courses, learn at your pace, and earn certificates.",
    link: "https://datapirateslearning.netlify.app",
  },
];

const ServicesSection = () => {
  return (
    <section className="py-20 px-4 bg-black text-white" id="tools">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-16"
      >
        <h2 className="text-4xl font-bold text-white animated-text-gradient">🚀 Explore My Tools</h2>
        <p className="mt-2 text-gray-400 text-sm">
          Built for learners, job seekers, and future techies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
        {tools.map((tool, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
          >
            <Tilt
              glareEnable={true}
              glareMaxOpacity={0.1}
              tiltMaxAngleX={6}
              tiltMaxAngleY={6}
              className="rounded-xl"
            >
              <div className="bg-zinc rounded-xl h-full p-6 transition-all duration-300 flex flex-col justify-between shadow-[0_0_20px_#0041c2] hover:shadow-[0_0_40px_#0000ff]">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tool.title}</h3>
                  <p className="text-gray-400 text-sm">{tool.desc}</p>
                </div>
                <div className="mt-6">
                  <Link
                    href={tool.link}
                    target="_blank"
                    className="inline-block px-4 py-2 rounded-lg bg-white text-black font-semibold transition-transform duration-300 ease-in-out hover:scale-105 hover:bg-gray-200 shadow"
                  >
                    Try Now → 
                  </Link>
                </div>
              </div>
            </Tilt>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default ServicesSection;
