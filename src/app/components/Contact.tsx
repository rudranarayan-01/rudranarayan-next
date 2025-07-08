"use client";

import React, { useState, useEffect, useRef } from "react";
import { FiMail } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";

const Contact = React.forwardRef<HTMLElement, unknown>((_, ref) => {
  const [status, setStatus] = useState<string | null>(null);
  const [emailError, setEmailError] = useState("");
  const [messageError, setMessageError] = useState("");
  const [loading, setLoading] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll(".animate-on-scroll") || [];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animated");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function validateEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    const form = e.target as HTMLFormElement;
    const email = form.email.value;
    const message = form.message.value;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address.");
      setTimeout(() => setEmailError(""), 4000);
      return;
    } else setEmailError("");

    if (message.trim().length < 10) {
      setMessageError("Please enter at least 10 characters.");
      setTimeout(() => setMessageError(""), 4000);
      return;
    } else setMessageError("");

    const formData = {
      access_key: "bd1d1906-eba0-4e6f-b130-de1dc7542475",
      email,
      message,
    };

    try {
      setLoading(true);
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      setStatus(result.success ? "Message sent successfully!" : "Error sending message.");
      if (result.success) form.reset();
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(() => setStatus(null), 4000);
    }
  }

  return (
    <section
      ref={(node) => {
        sectionRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      }}
      className="bg-neutral-950 flex flex-col justify-center items-center text-neutral-100 py-16 px-6"
    >
      <h4 className="text-[15px] text-center text-neutral-300 font-medium opacity-0 animate-on-scroll fade-right">
        GET IN TOUCH
      </h4>
      <h2 className="text-3xl md:text-5xl animated-text-gradient font-semibold pt-2 mb-6 md:mb-10 text-neutral-100 text-center opacity-0 animate-on-scroll fade-up">
        Contact Me
      </h2>

      <div className="w-full sm:max-w-2xl md:max-w-3xl border border-neutral-600 p-4 md:p-8 rounded-2xl shadow-md">
        <div className="flex max-md:flex-col gap-4">
          <a
            href="mailto:sample@gmail.com"
            className="flex flex-1 items-center text-sm justify-center gap-1 py-2 border border-neutral-600 rounded-lg font-medium transform transition-transform hover:scale-[1.01] opacity-0 animate-on-scroll rotate-fade"
          >
            <FiMail className="text-sm" /> rudranarayansahu.tech@gmail.com
          </a>

          <a
            href="https://wa.me/8260348599?text=Hi!%20I'm%20interested%20in%20working%20with%20you.%20Can%20we%20chat%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center text-sm justify-center gap-1 py-2 border border-neutral-600 rounded-lg font-medium transform transition-transform hover:scale-[1.01] opacity-0 animate-on-scroll rotate-fade"
          >
            <FaWhatsapp className="text-sm" /> WhatsApp
          </a>
        </div>

        <p className="p-6 text-neutral-300 text-xs font-medium text-center opacity-0 animate-on-scroll fade-up delay-100">
          Or send a message
        </p>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1 opacity-0 animate-on-scroll fade-up delay-200">
            <input
              type="email"
              name="email"
              placeholder="Your Email"
              className="w-full px-4 py-3 border placeholder:text-sm bg-neutral-900 border-neutral-600 rounded-lg focus:outline-none"
              required
            />
            {emailError && <p className="text-red-500 text-xs">{emailError}</p>}
          </div>
          <div className="opacity-0 animate-on-scroll fade-up delay-300">
            <textarea
              placeholder="Your Message"
              name="message"
              rows={5}
              className="w-full px-4 py-3 border placeholder:text-sm bg-neutral-900 border-neutral-600 rounded-lg focus:outline-none resize-none"
              required
            />
            {messageError && <p className="text-red-500 text-xs">{messageError}</p>}
          </div>
          <button
            type="submit"
            className="w-full bg-neutral-950 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium border border-neutral-600 flex justify-center transform transition-transform hover:scale-[1.01] opacity-0 animate-on-scroll fade-up delay-400"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {status && (
          <p className="mt-4 text-center text-sm font-medium text-blue-600">
            {status}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeRight {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes rotateY {
          from {
            opacity: 0;
            transform: rotateY(45deg);
          }
          to {
            opacity: 1;
            transform: rotateY(0);
          }
        }

        .fade-up {
          animation: fadeUp 0.6s ease-out forwards;
        }

        .fade-right {
          animation: fadeRight 0.6s ease-out forwards;
        }

        .rotate-fade {
          animation: rotateY 0.6s ease-out forwards;
        }

        .delay-100 {
          animation-delay: 0.1s;
        }

        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .animated {
          opacity: 1 !important;
        }
      `}</style>
    </section>
  );
});

Contact.displayName = "Contact";
export default Contact;
