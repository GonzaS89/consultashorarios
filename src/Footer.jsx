import React from "react";
import { motion } from "framer-motion";
import { IoCodeSlashSharp } from "react-icons/io5";

function Footer() {
  return (
    <footer className="w-full fixed bottom-0 z-30">
      {/* Contenedor con Glassmorphism Premium */}
      <div className="backdrop-blur-2xl bg-white/60 dark:bg-[#020617]/80 border-t border-slate-200 dark:border-emerald-500/10 py-3 shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        <div className="max-w-xl mx-auto px-6 flex justify-center items-center">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] text-slate-400 dark:text-slate-500">
            <span className="uppercase">Desarrolado por</span>
            
            <motion.a
              href="#" // Añade tu portfolio aquí
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-emerald-500/5 border border-transparent dark:border-emerald-500/10 transition-all group"
            >
              <IoCodeSlashSharp className="text-emerald-600 dark:text-emerald-400 text-sm" />
              <span className="text-emerald-600 dark:text-emerald-400 font-black italic tracking-tighter text-xs sm:text-sm">
                Sinhg Gonzalo
              </span>
              
              {/* Resplandor sutil al pasar el mouse */}
              <div className="absolute inset-0 rounded-full bg-emerald-400/0 group-hover:bg-emerald-400/5 transition-colors duration-300" />
            </motion.a>
          </div>
        </div>
      </div>
      
      {/* Indicador visual inferior tipo iOS para mobile */}
      <div className="h-1.5 w-full bg-white dark:bg-[#020617]" />
    </footer>
  );
}

export default Footer;