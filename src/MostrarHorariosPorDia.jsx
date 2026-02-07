import React, { useState, useEffect, useRef, useMemo } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { FcClock } from "react-icons/fc";
import { IoArrowForward, IoSync, IoLocationOutline } from "react-icons/io5";
import { FiRefreshCw, FiAlertCircle, FiChevronRight, FiSearch, FiShare2 } from "react-icons/fi";
import { FaSun, FaMoon, FaTimes } from "react-icons/fa";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [horarioDestacado, setHorarioDestacado] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const refsHorarios = useRef({});

  const temaOscuro = localStorage.getItem("temaOscuro") === "true";
  const [darkMode, setDarkMode] = useState(temaOscuro);

  // Auto-detección de día
  useEffect(() => {
    if (!seleccionManual) {
      const dia = new Date().getDay();
      if (dia === 0) setDiaActual("domingos");
      else if (dia === 6) setDiaActual("sabados");
      else setDiaActual("lunesAViernes");
    }
  }, [seleccionManual]);

  const dataDelDia = useMemo(() => horarios[diaActual] || [], [horarios, diaActual]);
  
  const referenciasUnicas = useMemo(() => 
    [...new Set(dataDelDia.map((h) => h.referencia).filter(Boolean))], 
    [dataDelDia]
  );

  const referenciasAgrupadas = useMemo(() => {
    return referenciasUnicas.reduce((acc, ref) => {
      const base = ref.split(" ").slice(1).join(" ").toLowerCase().replace(/[-]/g, " ").replace(/\s+/g, " ").trim();
      if (!acc[base]) acc[base] = [];
      if (!acc[base].includes(ref)) acc[base].push(ref);
      return acc;
    }, {});
  }, [referenciasUnicas]);

  const referenciasFiltradas = Object.entries(referenciasAgrupadas).filter(([base]) =>
    base.includes(busqueda.toLowerCase())
  );

  const convertirNombreAHoras = (nombre) => {
    if (!nombre) return 0;
    const [horas, minutos] = nombre.split(":").map(Number);
    return horas * 60 + minutos;
  };

  const encontrarHorarioMasCercano = () => {
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();
    let minDiff = Infinity;
    let horarioMasCercano = null;

    dataDelDia.forEach((h) => {
      if (h.referencia === referencia) {
        const minutosHorario = convertirNombreAHoras(h.nombre);
        const diff = minutosHorario - minutosAhora;
        // Priorizamos el que viene (diff > 0), si no hay, el más cercano pasado
        if (diff >= 0 && diff < minDiff) {
          minDiff = diff;
          horarioMasCercano = h;
        }
      }
    });
    return horarioMasCercano;
  };

  useEffect(() => {
    if (!referencia) return;
    const actualizar = () => {
      const horario = encontrarHorarioMasCercano();
      if (horario) setHorarioDestacado(horario.nombre);
    };
    actualizar();
    const interval = setInterval(actualizar, 30000); // Cada 30 seg basta
    return () => clearInterval(interval);
  }, [referencia, dataDelDia]);

  useEffect(() => {
    if (!referencia || !horarioDestacado) return;
    setTimeout(() => {
      refsHorarios.current[horarioDestacado]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
  }, [horarioDestacado, referencia]);

  const toggleDarkMode = () => {
    const nuevo = !darkMode;
    setDarkMode(nuevo);
    localStorage.setItem("temaOscuro", nuevo);
    document.documentElement.classList.toggle("dark", nuevo);
  };

  const capitalizar = (texto) => texto.split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  const compartirRuta = (ref) => {
    if (navigator.share) {
      navigator.share({ title: 'Kioraicoletivo', text: `Horarios para ${ref}`, url: window.location.href });
    }
  };

  return (
    <div className={`${darkMode ? "dark bg-[#0f172a] text-slate-200" : "bg-[#f8fafc] text-slate-900"} min-h-screen transition-colors duration-500 font-sans pb-20`}>
      
      {/* Decoración de Fondo */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className={`absolute -top-24 -left-24 w-96 h-96 rounded-full blur-3xl opacity-20 ${darkMode ? "bg-indigo-500" : "bg-indigo-300"}`} />
        <div className={`absolute bottom-0 -right-24 w-80 h-80 rounded-full blur-3xl opacity-10 ${darkMode ? "bg-teal-500" : "bg-teal-300"}`} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Botón Modo Oscuro */}
        <button
          onClick={toggleDarkMode}
          className={`fixed right-6 top-6 w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center text-xl z-50 transition-all active:scale-90 ${
            darkMode ? "bg-white text-slate-900" : "bg-slate-900 text-white"
          }`}
        >
          {darkMode ? <FaSun className="absolute"/> : <FaMoon className="absolute"/>}
        </button>

        {/* Header */}
        <header className="max-w-4xl mx-auto text-center mb-12 pt-12">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 uppercase">
              kiOrAi<span className="text-indigo-600 dark:text-indigo-400">CoLeTiVo</span>
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-8">
              <FcClock className="text-lg" />
              {diaActual === "lunesAViernes" ? "Lunes a Viernes" : capitalizar(diaActual)}
            </div>
          </motion.div>

          {/* Buscador */}
          {/* <div className="relative max-w-md mx-auto mb-8 group">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text"
              placeholder="¿A dónde vas?"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border-2 outline-none transition-all ${
                darkMode ? "bg-slate-800/50 border-slate-700 focus:border-indigo-500" : "bg-white border-slate-100 focus:border-indigo-500 shadow-sm"
              }`}
            />
          </div> */}

          {/* Selector de Día */}
          <div className="flex justify-center gap-2 p-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-brightness-50 rounded-2xl w-fit mx-auto">
            {[{k:"lunesAViernes", l:"LV"}, {k:"sabados", l:"SÁB"}, {k:"domingos", l:"DOM"}].map(d => (
              <button
                key={d.k}
                onClick={() => { setSeleccionManual(true); setDiaActual(d.k); }}
                className={`px-6 py-2.5 rounded-xl font-black text-xs transition-all ${
                  diaActual === d.k ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-300/50"
                }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </header>

        {/* Grid de Rutas */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {referenciasFiltradas.map(([base, refs], idx) => (
            <motion.div
              key={base}
              layout
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className={`group rounded-[2.5rem] p-8 border-2 transition-all ${
                darkMode ? "bg-slate-800/40 border-slate-700/50 backdrop-blur-md" : "bg-white border-slate-100 shadow-sm hover:shadow-xl"
              }`}
            >
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-6 flex items-center gap-3">
                <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                {capitalizar(base)}
              </h2>
              <div className="space-y-3">
                {refs.map(ref => {
                  const esVuelta = ref.toLowerCase().includes("vuelta");
                  return (
                    <button
                      key={ref}
                      onClick={() => setReferencia(ref)}
                      className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-700/30 hover:bg-indigo-600 hover:text-white transition-all group/btn"
                    >
                      <div className="flex items-center gap-3">
                        {esVuelta ? <IoSync className="text-indigo-500 group-hover/btn:text-white" /> : <IoArrowForward className="text-indigo-500 group-hover/btn:text-white" />}
                        <span className="font-bold">{esVuelta ? "Regreso" : "Ida"}</span>
                      </div>
                      <FiChevronRight />
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </section>
      </div>

      {/* Modal de Horarios */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-brightness-75 p-0 sm:p-4"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              className={`w-full max-w-2xl h-[100vh] sm:h-auto sm:max-h-[85vh] overflow-hidden flex flex-col ${
                darkMode ? "bg-slate-900" : "bg-slate-50"
              }`}
            >
              {/* Header Modal */}
              <div className="p-8 border-b border-slate-500/10 flex items-center justify-between">
                {/* <button onClick={() => compartirRuta(referencia)} className="text-indigo-500 p-2 hover:bg-indigo-500/10 rounded-full"><FiShare2 size={20}/></button> */}
                <div className="text-center">
                  <h2 className="text-2xl font-black tracking-tighter italic uppercase">Horarios</h2>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">{referencia}</p>
                </div>
                <button onClick={() => setReferencia(null)} className="bg-slate-500/10 p-3 rounded-full hover:rotate-90 transition-transform"><FaTimes /></button>
              </div>

              {/* Lista Horarios */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {dataDelDia.filter(h => h.referencia === referencia).map(item => {
                  const esProximo = horarioDestacado === item.nombre;
                  return (
                    <div
                      key={item.nombre}
                      ref={el => refsHorarios.current[item.nombre] = el}
                      className={`relative rounded-[2rem] p-6 border-2 transition-all duration-500 ${
                        esProximo ? "bg-indigo-600 border-indigo-400 text-white shadow-2xl scale-[1.02]" : 
                        darkMode ? "bg-slate-800 border-slate-700 text-slate-300" : "bg-white border-slate-100 text-slate-600"
                      }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="text-4xl font-black tracking-tighter">
                          {item.nombre}<span className="text-sm ml-1 opacity-40">HS</span>
                        </div>
                        <div className={`flex-1 md:border-l-2 pl-0 md:pl-6 ${esProximo ? "border-white/20" : "border-slate-500/20"}`}>
                          <div className="flex flex-col gap-3 relative mt-2">
                            <div className={`absolute left-[7px] top-2 bottom-2 w-0.5 ${esProximo ? "bg-white/20" : "bg-slate-300 dark:bg-slate-600"}`} />
                            {item.recorrido.map((p, i) => (
                              <div key={i} className="flex items-center gap-3 z-10">
                                <div className={`w-4 h-4 rounded-full border-4 ${esProximo ? "bg-white border-indigo-400" : "bg-indigo-500 border-white dark:border-slate-800"}`} />
                                <span className={`text-[11px] font-bold uppercase tracking-tight ${i===0 || i===item.recorrido.length-1 ? "opacity-100" : "opacity-60"}`}>{p}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}