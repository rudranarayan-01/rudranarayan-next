"use client";

import React, { forwardRef } from "react";
import { motion } from "framer-motion";

import Skills from "./Skills";
import Education from "./Education";
import PersonalInfo from "./PersonalInfo";
import { fadeInRight, fadeInUp } from "../data/variants";

const AboutMe = forwardRef<HTMLElement>((_, ref) => {
  return (
    <motion.section
      ref={ref}
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      className="bg-neutral-950 flex flex-col items-center text-neutral-50 px-4 lg:px-6 py-16"
    >
      <motion.h4
        variants={fadeInRight}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="text-[15px] text-center text-neutral-300 font-medium"
      >
        GET TO KNOW ME
      </motion.h4>

      <motion.h2
        variants={fadeInUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="text-3xl animated-text-gradient md:text-5xl font-semibold pt-2 mb-6 md:mb-10 text-neutral-50"
      >
        About Me
      </motion.h2>

      <div className="flex max-lg:flex-col max-w-4xl w-full">
        <PersonalInfo />

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="lg:w-2/3 p-2 lg:p-6 space-y-4 lg:border-l lg:border-neutral-600"
        >
          <Education />
          <Skills />
        </motion.div>
      </div>
    </motion.section>
  );
});

AboutMe.displayName = "AboutMe";
export default AboutMe;
