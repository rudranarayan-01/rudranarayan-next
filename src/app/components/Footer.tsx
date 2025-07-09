import { motion } from "motion/react";
import { fadeInRight, fadeInUp } from "../data/variants";

const Footer = () => {
  return (
    <motion.footer
      initial="initial"
      whileInView="whileInView"
      viewport={{ once: true }}
      className="bg-neutral-950 border-t border-neutral-600 text-neutral-100 text-center py-6 "
    >
      <p className="text-sm">
        &copy; {new Date().getFullYear()} Rudranarayan Sahu. All rights reserved.{" "}
      </p>
    </motion.footer>
  );
};

export default Footer;
