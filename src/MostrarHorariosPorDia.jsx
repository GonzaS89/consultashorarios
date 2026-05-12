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

  useEffect(() => {
    document.documentElement.classList.remove("dark");
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

  return (
    <div className="bg-[#f8fafc] text-slate-900 min-h-screen w-screen font-sans overflow-x-hidden">
      
      {/* Header Premium */}
      <header className="sticky backdrop-blur-md top-0 z-40 bg-white/80 border-b border-slate-200 px-6 py-5">
        <div className="max-w-xl mx-auto flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                KiOrAi<span className="text-emerald-500 text-4xl">CoLeTiVo</span>
              </h1>
              <div className="bg-emerald-500 p-1 rounded-lg text-white">
                <IoBusSharp size={20} />
              </div>
            </div>
          </div>

          <div className="p-1 bg-slate-200/50 rounded-2xl flex border border-slate-200 shadow-inner">
            {[{ k: "lunesAViernes", l: "Lunes a Viernes" }, { k: "sabados", l: "Sáb" }, { k: "domingos", l: "Dom" }].map(d => (
              <button
                key={d.k}
                onClick={() => { setSeleccionManual(true); setDiaActual(d.k); setBusquedaModal(""); }}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all ${
                  diaActual === d.k ? "bg-white shadow-md text-emerald-600" : "text-slate-500"
                }`}
              >
                {d.l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto p-6 pb-24 space-y-8">
        {Object.entries(referenciasAgrupadas).map(([base, refs]) => (
          <section key={base} className="space-y-4">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{capitalizar(base)}</h2>
            <div className="grid gap-3">
              {refs.map(ref => (
                <button
                  key={ref}
                  onClick={() => { setReferencia(ref); setBusquedaModal(""); }}
                  className="flex items-center justify-between p-5 rounded-[2.5rem] bg-white border border-slate-200 hover:border-emerald-500/50 transition-all active:scale-[0.98] shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${ref.toLowerCase().includes("vuelta") ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600"}`}>
                      {ref.toLowerCase().includes("vuelta") ? <IoSync size={20}/> : <IoArrowForward size={20}/>}
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-black uppercase italic tracking-tight">{ref.toLowerCase().includes("vuelta") ? "Regreso" : "Ida"}</span>
                    </div>
                  </div>
                  <FaChevronRight className="text-slate-300" size={14} />
                </button>
              ))}
            </div>
          </section>
        ))}
      </main>

      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-full h-[100dvh] bg-white flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer Handle */}
              <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mt-4 mb-2" />
              
              <div className="px-8 py-4 flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tighter truncate max-w-[70%]">{referencia.split(" ").slice(1).join(" ")}</h2>
                <button onClick={() => setReferencia(null)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-900 transition-transform active:scale-90">
                  <FaTimes className="absolute" size={22}/>
                </button>
              </div>

              <div className="px-8 mb-6">
                <div className="relative">
                  <IoSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar paradas..."
                    value={busquedaModal}
                    onChange={(e) => setBusquedaModal(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 outline-none font-bold text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-6 pb-16 space-y-4">
                {horariosFiltrados.map((item, idx) => {
                  const esProximo = item.nombre === obtenerMasCercano(horariosFiltrados);
                  
                  return (
                    <div
                      key={idx}
                      ref={el => refsHorarios.current[item.nombre] = el}
                      className={`relative p-5 rounded-[2rem] border-2 transition-all duration-500 ${
                        esProximo ? "bg-white border-emerald-500 shadow-xl scale-[1.01]" : "bg-white border-slate-100 shadow-sm"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex items-baseline gap-1">
                          <span className={`text-4xl font-black italic tracking-tighter ${esProximo ? "text-emerald-500" : "text-slate-900"}`}>
                            {item.nombre}
                          </span>
                          <span className="text-[10px] font-black text-slate-300 uppercase italic">hs</span>
                        </div>
                        {esProximo && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/20">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                            <span className="text-[9px] text-white font-black uppercase tracking-widest">Siguiente</span>
                          </div>
                        )}
                      </div>

                      {/* FORMATO CAMINITO (Timeline) */}
                      <div className="space-y-0 ml-2">
                        {item.recorrido.map((p, i) => {
                          const esPrimero = i === 0;
                          const esUltimo = i === item.recorrido.length - 1;
                          const match = busquedaModal && p.toLowerCase().includes(busquedaModal.toLowerCase());

                          return (
                            <div key={i} className="flex gap-4 group">
                              <div className="flex flex-col items-center relative">
                                {/* La línea que conecta */}
                                {!esUltimo && (
                                  <div className={`w-[2px] absolute top-5 bottom-0 ${match ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                                )}
                                
                                {/* El punto/indicador */}
                                <div className={`z-10 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center transition-all duration-300 ${
                                  match ? "border-emerald-500 scale-125" : 
                                  esPrimero || esUltimo ? "border-slate-900 shadow-sm" : "border-slate-200"
                                }`}>
                                  {(esPrimero || esUltimo || match) && (
                                    <div className={`w-1.5 h-1.5 rounded-full ${match ? "bg-emerald-500" : "bg-slate-900"}`} />
                                  )}
                                </div>
                              </div>

                              <div className={`pb-5 transition-all duration-300 ${match ? "translate-x-1" : ""}`}>
                                <span className={`text-[12px] uppercase font-black tracking-tight block leading-tight ${
                                  match ? "text-emerald-600" : 
                                  esPrimero || esUltimo ? "text-slate-900" : "text-slate-400"
                                }`}>
                                  {p}
                                </span>
                                {esPrimero && (
                                  <span className="text-[8px] font-bold text-emerald-600/50 uppercase tracking-widest">Punto de Partida</span>
                                )}
                                {esUltimo && (
                                  <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Fin del recorrido</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
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