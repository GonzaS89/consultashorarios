import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoCheckmarkCircle, IoCodeSlash } from "react-icons/io5";

function Footer() {
  const name = "SINHG GONZALO";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*_";
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  const startScrambling = useCallback(() => {
    let iteration = 0;
    setIsComplete(false);
    
    const interval = setInterval(() => {
      setDisplayText(
        name
          .split("")
          .map((char, index) => {
            if (index < iteration) return char;
            return characters[Math.floor(Math.random() * characters.length)];
          })
          .join("")
      );

      if (iteration >= name.length) {
        clearInterval(interval);
        setIsComplete(true);
        // Pausa de 5 segundos antes de reiniciar el loop
        setTimeout(startScrambling, 5000);
      }
      
      iteration += 1 / 3;
    }, 40);

    return interval;
  }, [name, characters]);

  useEffect(() => {
    const interval = startScrambling();
    return () => clearInterval(interval);
  }, [startScrambling]);

  return (
    <footer className="w-full fixed bottom-0 z-30">
      {/* Glassmorphism Container - Solo modo claro */}
      <div className="backdrop-blur-xl bg-white/90 border-t border-slate-200 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
        <div className="max-w-xl mx-auto px-6 flex justify-center items-center">
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 shrink-0">
              Desarrollado por
            </span>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="relative flex items-center gap-3 px-4 py-1.5 rounded-xl bg-slate-50 border border-slate-200 min-w-[170px] font-mono overflow-hidden shadow-inner"
            >
              {/* Icono de estado dinámico */}
              <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div
                      key="done"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-emerald-500"
                    >
                      <IoCheckmarkCircle size={14} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="loading"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                      className="text-emerald-400/40"
                    >
                      <IoCodeSlash size={14} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tu nombre con el efecto Scramble */}
              <span className="text-xs sm:text-sm font-black italic tracking-tighter text-emerald-600 min-w-[110px]">
                {displayText}
              </span>

              {/* Efecto de Scanline (barrido de monitor) */}
              <motion.div 
                className="absolute inset-0 w-full h-[40%] bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none"
                animate={{ y: ["-100%", "300%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Safe Area para dispositivos mobile */}
      <div className="h-1.5 w-full bg-white" />
    </footer>
  );
}

export default Footer;