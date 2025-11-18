'use client'

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import { Instrument_Sans } from "next/font/google";
import { useToast } from "./toast";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const EnterIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-white"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </motion.svg>
  );
};

export const WaitlistSearchBar = ({ onEmailSubmit }: { onEmailSubmit?: (email: string) => void }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();
  const [step, setStep] = useState(1); // 1: Join button, 2: Email input, 3: Submit button visible
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleButtonClick = () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setStep(value.trim() ? 3 : 2);
  };

  const handleInputBlur = () => {
    if (!email.trim()) {
      setStep(1);
      setEmail("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === "loading") return;

    setStatus("loading");
    showToast("Joining the waitlist...", "info");

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Failed to join waitlist");
      }

      setStatus("success");
      showToast("Success! Please check your inbox for confirmation.", "success");
      localStorage.setItem("waitlistEmail", email);
      onEmailSubmit?.(email);
      setTimeout(() => {
        setEmail("");
        setStep(1);
      }, 1500);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to join waitlist";
      setStatus("error");
      showToast(message, "error");
    }

    const waitlistSection = document.getElementById("waitlist");
    if (waitlistSection) {
      waitlistSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (step === 2) {
      inputRef.current?.focus();
    }
  }, [step]);

  return (
    <div 
      className="relative w-full flex justify-center items-end" 
      style={{ 
        zIndex: 9999, 
        minHeight: '60px', 
        position: 'relative',
        display: 'block',
        visibility: 'visible',
        opacity: 1
      }}
    >
      <form 
        onSubmit={handleSubmit} 
        className="relative flex items-end gap-4 w-full justify-center"
        style={{ position: 'relative', zIndex: 9999 }}
      >
        {/* Join Button / Email Input */}
        <motion.div 
          className="relative" 
          style={{ position: 'relative' }}
          animate={{ width: step === 1 ? 'auto' : '250px' }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.button
                key="join-button"
                type="button"
                onClick={handleButtonClick}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`${instrumentSerif.className} text-white text-base md:text-lg lg:text-xl font-normal tracking-wide pb-2 border-0 border-b-2 border-white cursor-pointer relative group`}
                style={{ 
                  background: 'transparent', 
                  outline: 'none', 
                  color: 'white',
                  display: 'inline-block',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Join the Waitlist
                <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
              </motion.button>
            ) : (
              <motion.input
                key="email-input"
                ref={inputRef}
                type="email"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className={`${instrumentSans.className} bg-transparent text-white placeholder-white/50 text-base md:text-lg lg:text-xl font-normal tracking-wide pb-2 border-0 border-b-2 border-white focus:outline-none focus:border-white transition-colors duration-300 w-full`}
                placeholder="Enter your email"
                value={email}
                onChange={handleEmailChange}
                onBlur={handleInputBlur}
                aria-label="Email input"
                style={{ 
                  background: 'transparent', 
                  color: 'white',
                  display: 'block',
                }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Enter Icon */}
        <AnimatePresence>
          {step >= 2 && (
            <motion.button 
              key="enter-icon"
              type="submit"
              disabled={status === "loading"}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
              className="flex items-center pb-2 cursor-pointer" 
              style={{ color: 'white', display: 'flex' }}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.98 }}
            >
              <EnterIcon />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        {/* <AnimatePresence>
          {step === 3 && (
            <motion.button
              key="submit-button"
              type="submit"
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.35, delay: 0.1, ease: "easeOut" }}
              className={`${instrumentSerif.className} text-white text-base md:text-lg lg:text-xl font-normal tracking-wide pb-2 border-0 border-b border-transparent relative group whitespace-nowrap`}
              disabled={status === "loading"}
              style={{ 
                background: 'transparent', 
                outline: 'none', 
                color: 'white',
                display: 'inline-block',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit
              <span className="absolute bottom-0 left-0 w-0 h-px bg-white transition-all duration-300 group-hover:w-full"></span>
            </motion.button>
          )}
        </AnimatePresence> */}
      </form>
    </div>
  );
};
