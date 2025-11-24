// Update this file with your personal information to customize your portfolio.
// Place all images in the "img" folder inside the "public" directory and reference them using the path: "/img/FILE_NAME".
import { BiLogoPython, BiLogoPostgresql, BiLogoFirebase } from "react-icons/bi";
import { FiHome, FiMail } from "react-icons/fi";
import { FaBlog, FaGithub } from "react-icons/fa";
import { TbUserSquare } from "react-icons/tb";
import { FaReact, FaNodeJs } from "react-icons/fa";
import { DiMysql } from "react-icons/di";
import { TbBrandReactNative } from "react-icons/tb";
import { RiNextjsLine } from "react-icons/ri";
import { SiPython, SiShadcnui } from "react-icons/si";
import { SiWebdriverio } from "react-icons/si";
import { FaDocker } from "react-icons/fa";
import {
  SiTailwindcss,
  SiExpress,
  SiRedux,
  SiFirebase,
  SiMongodb,
} from "react-icons/si";

import {
  FaJs,
  FaCuttlefish,
} from "react-icons/fa";
import {
  SiTypescript,
  SiNextdotjs,
  SiFramer,
  SiVercel,
} from "react-icons/si";
import { LuSquareCode } from "react-icons/lu";
import { SiScikitlearn, SiPytorch, SiOpencv, SiTensorflow, SiPandas, SiFlask, SiDjango, SiExpo } from "react-icons/si";

import React from 'react';
// List your technical skills below
export const skills = [
  { name: "Python", icon: BiLogoPython, color: "#1338BE" },
  { name: "Pytorch", icon: SiPytorch, color: "#ee4c2c" },
  { name: "OpenCV", icon: SiOpencv, color: "#fff" },
  { name: "Pandas", icon: SiPandas, color: "#150499" },
  { name: "Tensorflow", icon: SiTensorflow, color: "#ff6f00" },
  { name: "Scikit-Learn", icon: SiScikitlearn, color: "#ffa500" },
  { name: "Flask", icon: SiFlask, color: "#fff" },
  { name: "Django", icon: SiDjango, color: "#092E29" },
  { name: "JavaScript", icon: FaJs, color: "#F7DF1E" },
  { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
  { name: "ReactJS", icon: FaReact, color: "#61DAFB" },
  { name: "ReactNative", icon: TbBrandReactNative, color: "#61DAFB" },
  { name: "Expo", icon: SiExpo, color: "#fff" },
  { name: "NextJS", icon: SiNextdotjs, color: "#ffffff" },
  { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38B2AC" },
  { name: "Framer Motion", icon: SiFramer, color: "#0055FF" },
  { name: "NodeJS", icon: FaNodeJs, color: "#83CD29" },
  { name: "ExpressJS", icon: SiExpress, color: "#C9D1D9" },
  { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
  { name: "Redux Toolkit", icon: SiRedux, color: "#764ABC" },
  { name: "GitHub", icon: FaGithub, color: "#ffffff" },
  { name: "Vercel", icon: SiVercel, color: "#ffffff" },
  { name: "C++", icon: FaCuttlefish, color: "#00599C" },
  { name: "Mysql ", icon: DiMysql, color: "#F29111 " },
  { name: "Postgresql ", icon: BiLogoPostgresql, color: "#336791" },
  { name: "Firebase", icon: BiLogoFirebase, color: "#ffa611" },
  { name: "Docker", icon: FaDocker, color: "#3178C6" },
];

type NavbarItem = {
  name: string;
  type: "scroll" | "link";
  icon: React.ElementType;
  size: string;
  url?: string;
};
export const navbarData: NavbarItem[] = [
  { name: "Home", type: "scroll", icon: FiHome, size: "18px" },
  { name: "About", type: "scroll", icon: TbUserSquare, size: "18px" },
  { name: "Projects", type: "scroll", icon: LuSquareCode, size: "18px" },
  { name: "Contact", type: "scroll", icon: FiMail, size: "18px" },
  { name: "Blog", type: "link", icon: FaBlog, size: "18px", url: "/blog" },
  {
    name: "Github",
    type: "link",
    icon: FaGithub,
    url: "https://github.com/rudranarayan-01", // Replace "#" with your LinkedIn profile URL.
    size: "18px",
  },
];



// Add your projects here with their descriptions, features, and tech stack.
export const projects = [
  {
    name: "NextStep-AI",
    description: "NextStep-AI is your smart career companion, designed to streamline job preparation with AI-powered tools",
    points: [
      "Get personalized industry insights",
      "Build professional resumes and cover letter",
      " Practice with AI-driven interview preparation",
    ],
    techStack: [
      { name: "Next.js", icon: RiNextjsLine, color: "#fff" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38B2AC" },
      { name: "Shadcn-UI", icon: SiShadcnui, color: "#fff" },
      { name: "Node.js", icon: FaNodeJs, color: "#83CD29" },
    ],
    liveLink: "https://next-step-ai-zeta.vercel.app/",
    githubLink: "https://github.com/rudranarayan-01/NextStep-AI",
    image: "/img/nextstep-ai.png", // Update with the actual project image
  },
  {
    name: "Axel-AI",
    description: "Smart Mobility with AI & IoT — An autonomous car powered by deep learning and embedded systems.",
    points: [
      "Real-time traffic sign recognition and smart navigation.",
      "Obstacle avoidance with cruise control",
      "Cloud-Connected Intelligence",
    ],
    techStack: [
      { name: "Python", icon: SiPython, color: "#1338BE" },
      { name: "Pytorch", icon: SiPytorch, color: "#ee4c2c" },
      { name: "Scikit-Learn", icon: SiScikitlearn, color: "#ffa500" },
      { name: "OpenCV", icon: SiOpencv, color: "#fff" },


    ],
    liveLink: "https://www.linkedin.com/feed/update/urn:li:activity:7328276558060617728/",
    githubLink: "https://github.com/rudranarayan-01/Axel-AI",
    image: "/img/svd.jpg", // Update with the actual project image
  },
  {
    name: "LIMMY AI  v1.0",
    description: "A smart virtual assistant built with Python that understands and responds to voice commands using intelligent automation.",
    points: [
      "Smart Query Handling",
      "Multilanguage support",
      "Capable of interacting with desktop applications",
    ],
    techStack: [
      { name: "Python", icon: SiPython, color: "#1338BE" },
      { name: "Selenium Web Driver", icon: SiWebdriverio, color: "#fff" },

    ],
    liveLink: "https://www.linkedin.com/posts/rudranarayan-sahu-b7b9a6244_ai-python-automation-activity-7293335824090157056-rpvY?utm_source=share&utm_medium=member_desktop&rcm=ACoAADyoxQ8BmIPWlJBebLnKbJlzJdfYeyoFJmE",
    githubLink: "https://github.com/rudranarayan-01/LIMMY-0.1",
    image: "/img/limmy.png", // Update with the actual project image
  },
  {
    name: "AI-Interview",
    description: "A smart web app that simulates interviews based on user skills and experience for effective job prep.",
    points: [
      " Personalized Interview Simulation with AI",
      "Smart Feedback System",
      "Modern Tech Stack",
    ],
    techStack: [
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "React.js", icon: FaReact, color: "#61DAFB" },
      { name: "Redux Toolkit", icon: SiRedux, color: "#764ABC" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38B2AC" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveLink: "https://ai-interview-01.vercel.app",
    githubLink: "https://github.com/rudranarayan-01/AI-Interview",
    image: "/img/ai-inter.png", // Update with the actual project image
  },
  {
    name: "TeamSync - The project manager",
    description: "A full-stack SaaS tool for managing teams, projects, and workflows with workspace creation, role assignments, and progress tracking.",
    points: [
      "Developed using MERN Stack with secure authentication and scalable APIs.",
      "Implemented real-time MongoDB updates for instant task and workspace changes.",
      "Designed responsive UI using Redix UI with dynamic routing"

    ],
    techStack: [
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "React.js", icon: FaReact, color: "#61DAFB" },
      { name: "Redux Toolkit", icon: SiRedux, color: "#764ABC" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38B2AC" },
      { name: "MongoDB", icon: SiMongodb, color: "#47A248" },
      { name: "NodeJS", icon: FaNodeJs, color: "#83CD29" },
      { name: "ExpressJS", icon: SiExpress, color: "#C9D1D9" },
    ],
    liveLink: "",
    githubLink: "https://github.com/rudranarayan-01/Team-Sync",
    image: "/img/teamsync.png", // Update with the actual project image
  },
  {
    name: "Coaching Website for my client",
    description: "Created a responsive coaching website using Next.js and Firebase with real-time course listings, contact form, and client-managed content.",
    points: [
      "Built coaching website with Next.js, Firebase",
      "Integrated real-time Firestore course listings",
      "Designed responsive UI with dynamic routing"

    ],
    techStack: [
      { name: "TypeScript", icon: SiTypescript, color: "#3178C6" },
      { name: "Next.js", icon: RiNextjsLine, color: "#fff" },
      { name: "Tailwind CSS", icon: SiTailwindcss, color: "#38B2AC" },
      { name: "Firebase", icon: SiFirebase, color: "#FFCA28" },
    ],
    liveLink: "https://gajanana-classes.vercel.app/",
    githubLink: "/",
    image: "/img/coaching.png", // Update with the actual project image
  },
  {
    name: "Digital Attendance",
    description: "A Smart Facial Recognition for Seamless Attendance Tracking .",
    points: [
      "AI-Powered Face Recognition with High accuracy",
      "Real-time entry and exit time recording.",
      "Enhances safety and prevents proxy attendance",
    ],
    techStack: [
      { name: "Python", icon: SiPython, color: "#1338BE" },
      { name: "OpenCV", icon: SiOpencv, color: "#fff" },

    ],
    liveLink: "https://www.linkedin.com/posts/rudranarayan-sahu-b7b9a6244_hello-im-happy-to-share-face-recognition-activity-7292615518652379136--YnK?utm_source=share&utm_medium=member_desktop&rcm=ACoAADyoxQ8BmIPWlJBebLnKbJlzJdfYeyoFJmE",
    githubLink: "https://github.com/rudranarayan-01/Face-Recognition-Attendance-System",
    image: "/img/attendance.jpg", // Update with the actual project image
  },
  {
    name: "Datapirates",
    description: "A modern learning platform that allows users to explore, enroll in, and track progress across a variety of interactive courses.",
    points: [
      "Easy signup for diverse courses across domains",
      "Visual dashboards to monitor learning milestones",
      "Seamless experience across all devices",
    ],
    techStack: [
      { name: "React.js", icon: FaReact, color: "#61DAFB" },
      { name: "Framer Motion", icon: SiFramer, color: "#0055FF" },
      { name: "NodeJS", icon: FaNodeJs, color: "#83CD29" },
      { name: "ExpressJS", icon: SiExpress, color: "#C9D1D9" },
    ],
    liveLink: "https://datapirateslearning.netlify.app/",
    githubLink: "https://github.com/rudranarayan-01/Datapirates",
    image: "/img/datapirates.png", // Update with the actual project image
  },
];


// Personal information
export const personalInfo = {
  pfp: "/img/profile.png",
  alt: "Sample Profile Pic",
  summary:
    "I'm a passionate AI-Powered Full-Stack Developer who enjoys building and exploring new technologies. Always learning and creating innovative solutions. I'm currently looking for new opportunities to contribute and innovate.",
  location: "Bhubaneswar, India",
};

// Update your education details
export const education1 = {
  college: "Utkal University",
  course: "Master of Computer Applications",
  cgpa: "8.2",
  duration: "2023 - 2025",
};

export const education2 = {
  college: "MPC Autonomous College",
  course: "BSc Computer Science",
  cgpa: "8.6",
  duration: "2020 - 2023",
};



// Update your work experience
export const experience = {
  companyName: "Sample Tech Company",
  title: "Front-End Developer Intern",
  duration: "Jan 2023 - July 2023",
  location: "Remote",
  points: [
    "Developed a key feature that improved user engagement.",
    "Collaborated with cross-functional teams to enhance UI/UX.",
    "Fixed critical bugs, improving performance.",
  ],
};
