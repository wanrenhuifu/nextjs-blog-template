"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

export function BackToTop() {
  const [show, setShow] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: shouldReduceMotion ? "auto" : "smooth" });
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.button
          data-print-hide
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.8 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-card border border-borderline shadow-lg hover:bg-hover hover:border-primary/30 transition-colors duration-200"
          aria-label="返回顶部"
        >
          <ArrowUp className="w-4 h-4 text-body" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
