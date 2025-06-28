"use client"
import { useRef } from "react";
import AboutMe from "./components/AboutMe";
import Contact from "./components/Contact";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import Achievements from "./components/Achievement";
import Experience from "./components/Experience";
import ServicesSection from "./components/Services";

export default function Home() {
  const sectionRefs = {
    home: useRef<HTMLElement | null>(null),
    about: useRef<HTMLElement | null>(null),
    projects: useRef<HTMLElement | null>(null),
    contact: useRef<HTMLElement | null>(null),
  };

  return (
    <>
      <Header sectionRefs={sectionRefs} />
      <Hero ref={sectionRefs.home} />
      <AboutMe ref={sectionRefs.about} />
      <Experience/>
      <Projects ref={sectionRefs.projects} />
      <Achievements/>
      <ServicesSection/>
      <Contact ref={sectionRefs.contact} /> 
      <Footer />
    </>
  );
}
