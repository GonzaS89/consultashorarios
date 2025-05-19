import React, { useState, useEffect, useRef } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [horarioDestacado, setHorarioDestacado] = useState(null);
  const contenedorRef = useRef(null);
  const refsHorarios = useRef({});

  useEffect(() => {
    const dia = new Date().getDay();
    if (dia === 0) setDiaActual("domingos");
    else if (dia === 6) setDiaActual("sabados");
    else setDiaActual("lunesAViernes");
  }, []);

  const dataDelDia = horarios[diaActual] || [];
  const referenciasUnicas = [...new Set(dataDelDia.map((h) => h.referencia))];

  const convertirNombreAHoras = (nombre) => {
    if (!nombre) return 0;
    const [horas, minutos] = nombre.split(":").map(Number);
    return horas * 60 + minutos;
  };

  useEffect(() => {
    if (!referencia) return;

    setHorarioDestacado(null);
    const ahora = new Date();
    const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

    let minDiff = Infinity;
    let horarioMasCercano = null;

    dataDelDia.forEach((h) => {
      if (h.referencia === referencia) {
        const minutosHorario = convertirNombreAHoras(h.nombre);
        const diff = Math.abs(minutosHorario - minutosAhora);
        if (diff < minDiff) {
          minDiff = diff;
          horarioMasCercano = h;
        }
      }
    });

    if (horarioMasCercano) {
      setTimeout(() => {
        const ref = refsHorarios.current[horarioMasCercano.nombre];
        if (ref?.scrollIntoView) {
          ref.scrollIntoView({ behavior: "smooth", block: "center" });
          setHorarioDestacado(horarioMasCercano.nombre);
          setTimeout(() => setHorarioDestacado(null), 3000);
        }
      }, 300);
    }
  }, [referencia, dataDelDia]);

  // Agrupar por la parte base de la referencia
  const referenciasAgrupadas = referenciasUnicas.reduce((acc, ref) => {
    const partes = ref.split(" ");
    const tipo = partes[0]; // ida o vuelta
    const base = partes.slice(1).join(" ")
      .toLowerCase()
      .replace(/[-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!acc[base]) acc[base] = [];
    if (!acc[base].includes(ref)) acc[base].push(ref);
    return acc;
  }, {});

  const capitalizar = (texto) =>
    texto
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  return (
    <div className="p-4 space-y-4 min-h-screen w-screen bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 h-[calc(100vh-150px)] overflow-auto pb-20">
      <h1 className="text-3xl font-bold text-center"> 
        Horarios <br /> de <br />{" "}
        {diaActual === "lunesAViernes"
          ? "Lunes a Viernes"
          : diaActual.charAt(0).toUpperCase() + diaActual.slice(1)}
      </h1>

      <div className="space-y-6 flex flex-col">
  {Object.entries(referenciasAgrupadas).map(([base, refs], i) => (
    <div key={i}>
    
      <h2 className="text-lg font-semibold mb-2 text-center">
        Recorridos {capitalizar(base)}
      </h2>
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 justify-center items-center">
        {refs.map((ref, j) => {
          const tipo = ref.toLowerCase().includes("vuelta") ? "Vuelta" : "Ida";
          return (
            <button
              key={j}
              className={`uppercase border rounded px-6 py-4 text-base font-semibold w-full sm:w-auto transition
                ${referencia === ref ? "bg-gray-300" : "bg-white hover:bg-gray-100"}`}
              onClick={() => setReferencia(ref)}
            >
              {tipo}
            </button>
          );
        })}
      </div>
    </div>
  ))}
</div>


      <AnimatePresence>
        {referencia && (
          <motion.div
            ref={contenedorRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 shadow-lg px-4 overflow-y-auto z-40"
          >
            <button
              className="fixed top-4 right-4 bg-red-600 text-white rounded px-3 py-1 shadow z-50"
              onClick={() => setReferencia(null)}
            >
              Cerrar ✕
            </button>

            <div className="max-w-2xl mx-auto min-h-screen">
              {dataDelDia.filter((item) => item.referencia === referencia).length > 0 ? (
                dataDelDia
                  .filter((item) => item.referencia === referencia)
                  .map((item, index) => (
                    <motion.div
                    key={index}
                    ref={(el) => (refsHorarios.current[item.nombre] = el)}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-2xl p-5 mb-5 transition-all duration-300 shadow-md
                      ${
                        horarioDestacado === item.nombre
                          ? "bg-gradient-to-r from-purple-600 to-purple-800 text-white border border-purple-900 shadow-2xl ring-2 ring-purple-400"
                          : "bg-white bg-opacity-60 text-gray-800 border border-transparent hover:bg-opacity-80 hover:border-purple-300 hover:shadow-md"
                      }`}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="mb-3 font-semibold text-lg tracking-wide">
                      <p>
                        Hora de salida: <span className="font-bold text-xl">{item.nombre} HS.</span>
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold uppercase text-sm tracking-wider">
                        Recorrido: <span className="text-sm">{item.recorrido.join(" » ")}</span>
                      </p>
                    </div>
                  </motion.div>
                  
                  
                  ))
              ) : (
                <p>No hay horarios cargados para este día.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
