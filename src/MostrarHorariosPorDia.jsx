import React, { useState, useEffect, useRef, useMemo } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoArrowForward, 
  IoSync, 
  IoSearch, 
  IoClose, 
  IoAlertCircle, 
  IoSparkles, 
  IoBusSharp 
} from "react-icons/io5";
import { FaSun, FaMoon, FaChevronRight, FaTimes } from "react-icons/fa";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState("");
  const refsHorarios = useRef({});

  const temaOscuro = localStorage.getItem("temaOscuro") === "true";
  const [darkMode, setDarkMode] = useState(temaOscuro);

  useEffect(() => {
    if (!seleccionManual) {
      const dia = new Date().getDay();
      if (dia === 0) setDiaActual("domingos");
      else if (dia === 6) setDiaActual("sabados");
      else setDiaActual("lunesAViernes");
    }
  }, [seleccionManual]);

  const dataDelDia = useMemo(() => horarios[diaActual] || [], [horarios, diaActual]);

  const referenciasAgrupadas = useMemo(() => {
    const refs = [...new Set(dataDelDia.map((h) => h.referencia).filter(Boolean))];
    return refs.reduce((acc, ref) => {
      const base = ref.split(" ").slice(1).join(" ").toLowerCase().replace(/[-]/g, " ").replace(/\s+/g, " ").trim();
      if (!acc[base]) acc[base] = [];
      if (!acc[base].includes(ref)) acc[base].push(ref);
      return acc;
    }, {});
  }, [dataDelDia]);

  const horariosFiltrados = useMemo(() => {
    const listado = dataDelDia.filter(h => h.referencia === referencia);
    const filtrados = busquedaModal.trim() === "" ? listado : 
      listado.filter(h => h.recorrido.some(p => p.toLowerCase().includes(busquedaModal.toLowerCase())));

    return filtrados.filter((valor, indice, self) =>
      self.findIndex(t => t.nombre === valor.nombre && JSON.stringify(t.recorrido) === JSON.stringify(valor.recorrido)) === indice
    );
  }, [referencia, dataDelDia, busquedaModal]);

  const obtenerMasCercano = (lista) => {
    if (!lista || lista.length === 0) return null;
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    let minDiff = Infinity;
    let candidato = null;

    lista.forEach((h) => {
      const [horas, minutos] = h.nombre.split(":").map(Number);
      const minutosHorario = horas * 60 + minutos;
      const diff = minutosHorario - minutosAhora;
      if (diff >= 0 && diff < minDiff) { minDiff = diff; candidato = h.nombre; }
    });
    return candidato || (lista.length > 0 ? lista[0].nombre : null);
  };

  useEffect(() => {
    if (!referencia) return;
    const target = obtenerMasCercano(horariosFiltrados);
    if (target) {
      setTimeout(() => refsHorarios.current[target]?.scrollIntoView({ behavior: "smooth", block: "center" }), 300);
    }
  }, [referencia, horariosFiltrados]);

  const toggleDarkMode = () => {
    const nuevo = !darkMode;
    setDarkMode(nuevo);
    localStorage.setItem("temaOscuro", nuevo);
    document.documentElement.classList.toggle("dark", nuevo);
  };

  const capitalizar = (t) => t.split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  return (
    <div className={`${darkMode ? "dark bg-[#020617] text-slate-100" : "bg-[#f8fafc] text-slate-900"} min-h-screen w-screen transition-colors duration-300 font-sans`}>
      
      {/* Header Estilo Mobile Premium */}
      <header className="sticky backdrop-blur-md top-0 z-40 bg-white/70 dark:bg-[#020617]/70 border-b border-slate-200 dark:border-slate-800/50 px-6 py-5">
        <div className="max-w-xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            {/* Contenedor del Logo con Bus Animado */}
          
              <IoSparkles className="text-white text-lg z-10" />
              <motion.div
                initial={{ x: "-150%" }}
                animate={{ x: "150%" }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear", repeatDelay: 1 }}
                className="absolute opacity-30 text-white"
              >
                <IoBusSharp size={20} />
              </motion.div>
         

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-4xl font-black tracking-tighter leading-none uppercase italic">
                  KiOrAi<span className="text-emerald-500">CoLeTiVo</span>
                </h1>
                <motion.div
                  animate={{ y: [0, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                  className="text-emerald-500"
                >
                  <IoBusSharp size={30} />
                </motion.div>
              </div>
              {/* Barra de progreso decorativa */}
              {/* <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <motion.div 
                  className="h-full bg-emerald-500"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                />
              </div> */}
            </div>
          </div>

          {/* <button onClick={toggleDarkMode} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800/50 flex items-center justify-center transition-all active:scale-90 border border-transparent dark:border-slate-700">
            {darkMode ? <FaSun className="text-amber-400" /> : <FaMoon className="text-slate-600" />}
          </button> */}
        </div>

        {/* Tabs Segmentadas */}
        <div className="max-w-xl mx-auto mt-5 p-1 bg-slate-200/50 dark:bg-slate-900/50 rounded-2xl flex border border-slate-200 dark:border-slate-800">
          {[{ k: "lunesAViernes", l: "L-V" }, { k: "sabados", l: "Sáb" }, { k: "domingos", l: "Dom" }].map(d => (
            <button
              key={d.k}
              onClick={() => { setSeleccionManual(true); setDiaActual(d.k); setBusquedaModal(""); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                diaActual === d.k 
                  ? "bg-white dark:bg-slate-800 shadow-md text-emerald-600 dark:text-emerald-400 scale-[1.02]" 
                  : "text-slate-500"
              }`}
            >
              {d.l}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 pb-24 space-y-8">
        {Object.entries(referenciasAgrupadas).map(([base, refs]) => (
          <section key={base} className="space-y-4">
            <h2 className="text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">{capitalizar(base)}</h2>
            <div className="grid gap-3">
              {refs.map(ref => (
                <button
                  key={ref}
                  onClick={() => { setReferencia(ref); setBusquedaModal(""); }}
                  className="group relative flex items-center justify-between p-5 rounded-[2rem] bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 transition-all active:scale-[0.97] shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      ref.toLowerCase().includes("vuelta") 
                        ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" 
                        : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}>
                      {ref.toLowerCase().includes("vuelta") ? <IoSync size={24}/> : <IoArrowForward size={24}/>}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black uppercase tracking-tight">{ref.toLowerCase().includes("vuelta") ? "Regreso" : "Ida"}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Paradas y horarios</span>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-300 dark:text-slate-700" size={14} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Drawer Modal Estilo App */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-[100dvh] bg-slate-50 dark:bg-[#020617] lg:rounded-t-[3rem]  flex flex-col shadow-2xl overflow-hidden border-t border-slate-200 dark:border-slate-800"
            >
              {/* Handle superior */}
              <div className="w-16 h-1.5 bg-slate-300 dark:bg-slate-800 rounded-full mx-auto mt-4 mb-2 cursor-pointer" onClick={() => setReferencia(null)} />
              
              <div className="px-8 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold truncate tracking-tight uppercase leading-tight max-w-[250px]">{referencia.split(" ").slice(1).join(" ")}</h2>
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">En tiempo real</p>
                </div>
                <button onClick={() => setReferencia(null)} className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-900 dark:text-white transition-transform active:scale-90">
                  <FaTimes className="absolute text-xl"/>
                </button>
              </div>

              <div className="px-8 mb-6">
                <div className="relative">
                  <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar parada..."
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[1.5rem] focus:ring-2 focus:ring-emerald-500 outline-none font-semibold text-sm shadow-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-8 pb-16 space-y-6">
                {horariosFiltrados.length > 0 ? (
                  horariosFiltrados.map((item, idx) => {
                    const esProximo = item.nombre === obtenerMasCercano(horariosFiltrados);
                    return (
                      <div
                        key={idx}
                        ref={el => refsHorarios.current[item.nombre] = el}
                        className={`p-6 rounded-[2.5rem] border-2 transition-all ${
                          esProximo 
                            ? "bg-white dark:bg-slate-900 border-emerald-500 shadow-xl shadow-emerald-500/10" 
                            : "bg-white dark:bg-slate-900/50 border-transparent shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-8">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-black italic tracking-tighter ${esProximo ? "text-emerald-500" : ""}`}>{item.nombre}</span>
                            <span className="text-xs font-black text-slate-400 uppercase">hs</span>
                          </div>
                          {esProximo && (
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500 rounded-full shadow-lg">
                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                              <span className="text-[10px] text-white font-black uppercase tracking-tighter">Siguiente</span>
                            </div>
                          )}
                        </div>

                        {/* Timeline Recorrido */}
                        <div className="space-y-0 ml-1">
                          {item.recorrido.map((p, i) => {
                            const esPrimero = i === 0;
                            const esUltimo = i === item.recorrido.length - 1;
                            const match = busquedaModal && p.toLowerCase().includes(busquedaModal.toLowerCase());

                            return (
                              <div key={i} className="flex gap-5">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3.5 h-3.5 rounded-full border-2 transition-colors duration-500 ${
                                    match ? "bg-emerald-500 border-emerald-200" : 
                                    esPrimero || esUltimo ? "bg-slate-900 dark:bg-white border-transparent" : "bg-slate-200 dark:bg-slate-800 border-transparent"
                                  }`} />
                                  {!esUltimo && <div className="w-[1px] h-10 bg-slate-200 dark:bg-slate-800" />}
                                </div>
                                <div className="flex flex-col -mt-1 pb-6">
                                  <span className={`text-[15px] uppercase font-bold tracking-tight transition-all ${
                                    match ? "text-emerald-600 dark:text-emerald-400 scale-105" : 
                                    esPrimero || esUltimo ? "text-slate-900 dark:text-white" : "text-slate-500"
                                  }`}>
                                    {p}
                                  </span>
                                  {(esPrimero || esUltimo) && (
                                    <span className="text-[8px] uppercase font-black text-emerald-600/60 dark:text-emerald-400/60 tracking-[0.15em] mt-0.5">
                                      {esPrimero ? "Salida" : "Final"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-24 opacity-20">
                    <IoAlertCircle size={64} className="mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest text-sm text-slate-500">Sin servicios disponibles</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}