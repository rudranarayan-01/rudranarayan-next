import { motion } from "motion/react";
import { fadeInUpLeft } from "../data/variants";
import { education1, education2 } from "../data/data";

const Education = () => {
  return (
    <motion.div
      variants={fadeInUpLeft}
      initial="hidden"
      whileInView="visible"
      className="pb-4 border-b border-neutral-600"
    >
      <div className="flex flex-col">
        <h3 className="text-lg text-neutral-100 font-semibold mb-2">
          Education
        </h3>

        <div className="flex flex-col gap-5">

          <div>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span className="font-semibold">{education1.college}</span>{" "}
              <span>{education1.duration}</span>
            </p>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span>{education1.course}</span> <span>CGPA: {education1.cgpa}</span>
            </p>
          </div>

          <div>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span className="font-semibold">{education2.college}</span>{" "}
              <span>{education2.duration}</span>
            </p>
            <p className="text-neutral-100 text-sm flex justify-between">
              <span>{education2.course}</span> <span>CGPA: {education2.cgpa}</span>
            </p>
          </div>
        </div>

      </div>

    </motion.div>
  );
};

export default Education;
