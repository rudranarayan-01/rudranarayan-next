import { motion } from "motion/react";
import { fadeInUpRight } from "../data/variants";
import Image from "next/image";
import { personalInfo } from "../data/data";
import { GrLocation } from "react-icons/gr";

const PersonalInfo = () => {
  return (
    <motion.div className="lg:w-1/3 lg:max-w-3xl text-center flex flex-col items-center gap-3 pt-6 lg:px-6">
      {/* Container for pulse + hover glow */}
      <motion.div
        variants={fadeInUpRight}
        initial="hidden"
        whileInView="visible"
        whileHover="hover"
        className="relative flex items-center justify-center w-[180px] h-[180px] group"
      >
        {/* Subtle pulsing radar ring */}
        <motion.div
          className="absolute rounded-full border border-neutral-700 w-[180px] h-[180px]"
          animate={{
            scale: [1, 1.25],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Solid dark ring */}
        <div className="absolute rounded-full border-[2px] border-neutral-700 w-[180px] h-[180px] z-0" />

        {/* Gradient Glow Ring (only on hover) */}
        <motion.div
          variants={{
            hover: {
              opacity: 1,
              scale: 1.05,
              transition: { duration: 0.5 },
            },
            initial: { opacity: 0, scale: 1 },
          }}
          className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 blur-xl opacity-0 z-0"
        />

        {/* Profile Image with scale on hover */}
        <motion.div
          className="relative z-10 w-[170px] h-[170px] rounded-full overflow-hidden border-[2px] border-black bg-black"
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          <Image
            src={personalInfo.pfp}
            alt={personalInfo.alt}
            width={170}
            height={170}
            className="object-cover w-full h-full"
          />
        </motion.div>
      </motion.div>

      {/* Summary */}
      <motion.p
        variants={fadeInUpRight}
        initial="hidden"
        whileInView="visible"
        className="text-neutral-100 border-b border-neutral-600 pb-2"
      >
        {personalInfo.summary}
      </motion.p>

      {/* Location */}
      <motion.div
        variants={fadeInUpRight}
        initial="hidden"
        whileInView="visible"
        className="hidden lg:flex items-center gap-2 text-neutral-100"
      >
        <GrLocation className="text-neutral-100" />
        <span>{personalInfo.location}</span>
      </motion.div>
    </motion.div>


  );
};

export default PersonalInfo;
