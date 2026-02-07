import React from "react";
import { motion } from "framer-motion";

function Footer() {
  return (
    <footer className="w-full fixed bottom-0 z-30">
      {/* Contenedor con efecto Glassmorphism */}
      <div className="backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-700/50 py-4 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.05)]">
        <div className="max-w-6xl mx-auto px-6 flex justify-center items-center">
          <p className="text-xs sm:text-sm font-bold tracking-tighter uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
            Desarrollado por 
            <motion.a
              href="#" // Puedes añadir tu portfolio aquí
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative group inline-block"
            >
              <span className="text-indigo-600 dark:text-indigo-400 font-black italic tracking-tight text-sm sm:text-base">
                Sinhg Gonzalo
              </span>
              {/* Línea animada inferior */}
              <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
            </motion.a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;