// SectionWrapper.tsx
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface SectionWrapperProps {
  id: string;
  children: React.ReactNode;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({ id, children }) => {
  return (
    <section id={id} className=" w-full overflow-hidden snap-start snap-always">
      <div className="h-full w-full">
        {children}
      </div>
    </section>
  );
};
