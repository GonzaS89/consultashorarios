import React, { useState, useEffect, useRef, useMemo } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { FcClock } from "react-icons/fc";
import { IoArrowForward, IoSync } from "react-icons/io5";
import { FiChevronRight, FiSearch, FiAlertCircle, FiX, FiRefreshCw } from "react-icons/fi";
import { FaSun, FaMoon, FaTimes, FaChevronRight } from "react-icons/fa";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [horarioDestacado, setHorarioDestacado] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState(""); 
  const [cargandoFiltro, setCargandoFiltro] = useState(false);
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
    if (!busquedaModal.trim()) return listado;
    return listado.filter(h => 
      h.recorrido.some(p => p.toLowerCase().includes(busquedaModal.toLowerCase()))
    );
  }, [referencia, dataDelDia, busquedaModal]);

  const convertirNombreAHoras = (nombre) => {
    if (!nombre) return 0;
    const [horas, minutos] = nombre.split(":").map(Number);
    return horas * 60 + minutos;
  };

  const obtenerMasCercano = (lista) => {
    if (!lista || lista.length === 0) return null;
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    let minDiff = Infinity;
    let candidato = null;

    lista.forEach((h) => {
      const minutosHorario = convertirNombreAHoras(h.nombre);
      const diff = minutosHorario - minutosAhora;
      if (diff >= 0 && diff < minDiff) {
        minDiff = diff;
        candidato = h.nombre;
      }
    });
    return candidato || lista[0].nombre;
  };

  useEffect(() => {
    if (!referencia) return;
    const targetSet = busquedaModal.trim() !== "" ? horariosFiltrados : dataDelDia.filter(h => h.referencia === referencia);
    const targetNombre = obtenerMasCercano(targetSet);

    if (targetNombre) {
      const timer = setTimeout(() => {
        const elemento = refsHorarios.current[targetNombre];
        if (elemento) {
          elemento.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 200); 
      return () => clearTimeout(timer);
    }
  }, [referencia, busquedaModal, horariosFiltrados]);

  useEffect(() => {
    if (busquedaModal) {
      setCargandoFiltro(true);
      const timeout = setTimeout(() => setCargandoFiltro(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [busquedaModal]);

  const toggleDarkMode = () => {
    const nuevo = !darkMode;
    setDarkMode(nuevo);
    localStorage.setItem("temaOscuro", nuevo);
    document.documentElement.classList.toggle("dark", nuevo);
  };

  const capitalizar = (texto) => texto.split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  return (
    <div className={`${darkMode ? "dark bg-[#0f172a] text-slate-200" : "bg-[#f8fafc] text-slate-900"} min-h-screen transition-colors duration-500 font-sans pb-20`}>
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-indigo-500" : "bg-indigo-300"}`} />
        <div className={`absolute bottom-0 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10 ${darkMode ? "bg-teal-500" : "bg-teal-300"}`} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <button
          onClick={toggleDarkMode}
          className={`fixed right-6 top-6 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-xl z-50 transition-all active:scale-90 ${
            darkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
          }`}
        >
          {darkMode ? <FaSun className="absolute"/> : <FaMoon className="absolute"/>}
        </button>

        <header className="max-w-4xl mx-auto text-center mb-12 pt-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 uppercase">
              kiOrAi<span className="text-indigo-600 dark:text-indigo-400">CoLeTiVo</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">
              <FcClock className="text-lg" />
              {diaActual === "lunesAViernes" ? "Lunes a Viernes" : capitalizar(diaActual)}
            </div>
          </motion.div>

          <div className="flex justify-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 rounded-2xl w-fit mx-auto">
            {[{k:"lunesAViernes", l:"LV"}, {k:"sabados", l:"SÁB"}, {k:"domingos", l:"DOM"}].map(d => (
              <button
                key={d.k}
                onClick={() => { setSeleccionManual(true); setDiaActual(d.k); setBusquedaModal(""); }}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                  diaActual === d.k ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-300/50"
                }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Object.entries(referenciasAgrupadas).map(([base, refs]) => (
            <div key={base} className={`rounded-[2.5rem] p-8 border-2 transition-all ${darkMode ? "bg-slate-800/40 border-slate-700/50 backdrop-brightness-75" : "bg-white border-slate-100 shadow-sm"}`}>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                {capitalizar(base)}
              </h2>
              <div className="space-y-3">
                {refs.map(ref => (
                  <button
                    key={ref}
                    onClick={() => { setReferencia(ref); setBusquedaModal(""); }}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-700/30 hover:bg-indigo-600 hover:text-white transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      {ref.toLowerCase().includes("vuelta") ? <IoSync /> : <IoArrowForward />}
                      <span className="font-bold uppercase">{ref.toLowerCase().includes("vuelta") ? "Vuelta" : "Ida"}</span>
                    </div>
                    <FiChevronRight />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-brightness-75 p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={`w-full max-w-2xl h-[100dvh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col ${
                darkMode ? "bg-slate-900 shadow-2xl" : "bg-slate-50 shadow-2xl"
              }`}
            >
              <div className={`p-6 border-b ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-black italic uppercase leading-none">Horarios: {referencia.split(" ").slice(1).join(" ")}</h2>
                  <button onClick={() => setReferencia(null)} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-200'}`}><FaTimes size={20} /></button>
                </div>

                <div className="relative">
                  <input 
                    type="text"
                    placeholder="Buscar por parada..."
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all font-bold ${
                      darkMode ? "bg-slate-800 border-slate-700 focus:border-indigo-500 text-white placeholder:text-slate-600" : "bg-white border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    {cargandoFiltro ? <FiRefreshCw className="animate-spin text-indigo-500" /> : <FiSearch className="text-slate-400" size={20} />}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
                {horariosFiltrados.length > 0 ? (
                  horariosFiltrados.map(item => {
                    const esProximoActual = item.nombre === obtenerMasCercano(horariosFiltrados);

                    return (
                      <div
                        key={item.nombre}
                        ref={el => refsHorarios.current[item.nombre] = el}
                        className={`rounded-[2rem] p-6 border-2 transition-all duration-300 ${
                          esProximoActual ? "bg-indigo-600 border-indigo-400 text-white shadow-xl scale-[1.01]" : 
                          darkMode ? "bg-slate-800/50 border-slate-700 text-slate-300" : "bg-white border-slate-100 shadow-sm"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-4xl font-black tracking-tighter">{item.nombre}<span className="text-xs opacity-50 ml-1 italic font-bold">HS</span></span>
                          {esProximoActual && (
                            <span className="text-[10px] font-black bg-white text-indigo-600 px-3 py-1.5 rounded-full uppercase tracking-tighter animate-pulse">
                              Próximo
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-y-3">
                          {item.recorrido.map((p, i) => {
                            const highlight = busquedaModal && p.toLowerCase().includes(busquedaModal.toLowerCase());
                            return (
                              <React.Fragment key={i}>
                                <span className={`text-[10px] px-2 py-1 rounded-md font-bold uppercase transition-all ${
                                  highlight ? "bg-yellow-400 text-slate-900 scale-110 shadow-lg z-10" : 
                                  esProximoActual ? "bg-white/10 text-white" : "bg-slate-500/10"
                                }`}>
                                  {p}
                                </span>
                                
                                {i < item.recorrido.length - 1 && (
                                  <motion.div
                                    animate={{ x: [0, 3, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                    className="mx-1.5 flex items-center justify-center"
                                  >
                                    <FaChevronRight 
                                      className={`text-[8px] ${
                                        esProximoActual ? 'text-white' : 'text-indigo-500'
                                      }`} 
                                    />
                                  </motion.div>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-20">
                    <FiAlertCircle className="mx-auto text-5xl text-slate-500/20 mb-4" />
                    <p className="font-black text-slate-500 uppercase tracking-widest text-sm">Sin coincidencias</p>
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