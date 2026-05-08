import React, { useState, useEffect, useRef, useMemo } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  IoArrowForward, 
  IoSync, 
  IoSearch, 
  IoAlertCircle, 
  IoSparkles, 
  IoBusSharp 
} from "react-icons/io5";
import { FaChevronRight, FaTimes } from "react-icons/fa";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const [busquedaModal, setBusquedaModal] = useState("");
  const refsHorarios = useRef({});

  // Forzamos modo claro eliminando rastro de modo oscuro
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("temaOscuro", "false");
  }, []);

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

  const capitalizar = (t) => t.split(" ").map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");

  const cerrarModal = () => {
    setReferencia(null);
    setBusquedaModal("");
  };

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen w-screen transition-colors duration-300 font-sans overflow-x-hidden">
      
      {/* Header Fijo */}
      <header className="sticky backdrop-blur-md top-0 z-40 bg-white/80 border-b border-slate-200 px-6 py-5">
        <div className="max-w-xl mx-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black tracking-tighter leading-none uppercase italic">
                KiOrAi<span className="text-emerald-500">CoLeTiVo</span>
              </h1>
              <motion.div
                animate={{ y: [0, -2, 0] }}
                transition={{ repeat: Infinity, duration: 0.6 }}
                className="text-emerald-500"
              >
                <IoBusSharp size={30} />
              </motion.div>
            </div>
          </div>

          {/* Selector de Días */}
          <div className="mt-5 p-1 bg-slate-200/50 rounded-2xl flex border border-slate-200">
            {[{ k: "lunesAViernes", l: "L-V" }, { k: "sabados", l: "Sáb" }, { k: "domingos", l: "Dom" }].map(d => (
              <button
                key={d.k}
                onClick={() => { setSeleccionManual(true); setDiaActual(d.k); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
                  diaActual === d.k 
                    ? "bg-white shadow-md text-emerald-600 scale-[1.02]" 
                    : "text-slate-500"
                }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main List */}
      <main className="max-w-xl mx-auto p-6 pb-24 space-y-8">
        {Object.entries(referenciasAgrupadas).map(([base, refs]) => (
          <section key={base} className="space-y-4">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">{capitalizar(base)}</h2>
            <div className="grid gap-3">
              {refs.map(ref => (
                <button
                  key={ref}
                  onClick={() => setReferencia(ref)}
                  className="group relative flex items-center justify-between p-5 rounded-[2rem] bg-white border border-slate-200 hover:border-emerald-500/50 transition-all active:scale-[0.97] shadow-sm"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      ref.toLowerCase().includes("vuelta") ? "bg-indigo-500/10 text-indigo-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {ref.toLowerCase().includes("vuelta") ? <IoSync size={24}/> : <IoArrowForward size={24}/>}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black uppercase tracking-tight">{ref.toLowerCase().includes("vuelta") ? "Regreso" : "Ida"}</span>
                      <span className="text-xs text-slate-500 font-medium italic">Paradas y horarios</span>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-300" size={14} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Modal / Drawer */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-full h-[92dvh] bg-white lg:rounded-t-[3.5rem] rounded-t-[2.5rem] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Handle superior de cierre */}
              <div className="w-16 h-1.5 bg-slate-200 rounded-full mx-auto mt-4 mb-2 cursor-pointer" onClick={cerrarModal} />
              
              <div className="px-8 py-4 flex items-center justify-between">
                <h2 className="text-xl font-black truncate uppercase tracking-tighter leading-tight italic">
                  {referencia.split(" ").slice(1).join(" ")}
                </h2>
                <button onClick={cerrarModal} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 active:scale-90 transition-transform">
                  <FaTimes />
                </button>
              </div>

              {/* Buscador con botón de limpiar */}
              <div className="px-8 mb-6">
                <div className="relative group">
                  <IoSearch className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${busquedaModal ? "text-emerald-500" : "text-slate-400"}`} size={20} />
                  <input
                    type="text"
                    placeholder="BUSCAR PARADA..."
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-slate-100 rounded-[1.5rem] focus:border-emerald-500 outline-none font-black text-xs uppercase tracking-widest transition-all"
                  />
                  <AnimatePresence>
                    {busquedaModal && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => setBusquedaModal("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-500 shadow-sm active:scale-90"
                      >
                        <FaTimes size={12} />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Contenedor de Horarios (Globos) */}
              <div className="flex-1 overflow-y-auto px-8 pb-16 space-y-6">
                {horariosFiltrados.length > 0 ? (
                  horariosFiltrados.map((item, idx) => {
                    const esProximo = item.nombre === obtenerMasCercano(horariosFiltrados);
                    return (
                      <div
                        key={idx}
                        ref={el => refsHorarios.current[item.nombre] = el}
                        className={`relative p-5 rounded-[2.5rem] border-2 transition-all duration-300 ${
                          esProximo 
                            ? "bg-white border-emerald-500 shadow-[0_20px_50px_rgba(16,_185,_129,_0.15)] scale-[1.02] z-10" 
                            : "bg-white border-slate-100 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-6">
                          <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-black italic tracking-tighter ${esProximo ? "text-emerald-500" : "text-slate-900"}`}>{item.nombre}</span>
                            <span className="text-xs font-black text-slate-400 uppercase italic">hs</span>
                          </div>
                          {esProximo && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500 rounded-full shadow-lg">
                              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                              <span className="text-[10px] text-white font-black uppercase tracking-tighter">Siguiente</span>
                            </div>
                          )}
                        </div>

                        {/* Recorrido Interno */}
                        <div className="space-y-0.5 ml-1">
                          {item.recorrido.map((p, i) => {
                            const esPrimero = i === 0;
                            const esUltimo = i === item.recorrido.length - 1;
                            const match = busquedaModal && p.toLowerCase().includes(busquedaModal.toLowerCase());

                            return (
                              <div key={i} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                  <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
                                    match ? "bg-emerald-500 ring-4 ring-emerald-500/10" : 
                                    esPrimero || esUltimo ? "bg-slate-900" : "bg-slate-200"
                                  }`} />
                                  {!esUltimo && <div className={`w-[1.5px] h-10 ${match ? "bg-emerald-500/30" : "bg-slate-100"}`} />}
                                </div>
                                <div className="flex flex-col -mt-1 pb-4">
                                  <span className={`text-[13px] uppercase font-black tracking-tight transition-all ${
                                    match ? "text-emerald-600 scale-105 origin-left" : 
                                    esPrimero || esUltimo ? "text-slate-900" : "text-slate-400"
                                  }`}>
                                    {p}
                                  </span>
                                  {(esPrimero || esUltimo) && (
                                    <span className="text-[8px] uppercase font-black tracking-widest text-slate-300 mt-0.5">
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
                    <p className="font-black uppercase tracking-widest text-sm">Sin horarios</p>
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