import { useState, useEffect, useRef } from "react";
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
  const referenciasUnicas = [...new Set(dataDelDia.map((h) => h.referencia).filter(Boolean))];

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
        const diff = Math.abs(minutosHorario - minutosAhora);
        if (diff < minDiff) {
          minDiff = diff;
          horarioMasCercano = h;
        }
      }
    });

    return horarioMasCercano;
  };

  useEffect(() => {
    if (!referencia) return;

    const actualizarHorario = () => {
      const horarioMasCercano = encontrarHorarioMasCercano();
      if (horarioMasCercano) {
        setHorarioDestacado(horarioMasCercano.nombre);
      }
    };

    actualizarHorario();

    const interval = setInterval(actualizarHorario, 1000);

    return () => clearInterval(interval);
  }, [referencia, dataDelDia]);

  useEffect(() => {
    if (!referencia) return;
    const horarioMasCercano = encontrarHorarioMasCercano();
    if (horarioMasCercano) {
      setTimeout(() => {
        const ref = refsHorarios.current[horarioMasCercano.nombre];
        if (ref?.scrollIntoView) {
          ref.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }, [referencia]);

  const referenciasAgrupadas = referenciasUnicas.reduce((acc, ref) => {
    if (!ref) return acc;
    const partes = ref.split(" ");
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

  const [temaOscuro, setTemaOscuro] = useState(false);

  return (
    <div className={`${temaOscuro
      ? "bg-gray-900 text-white"
      : "bg-gradient-to-b from-blue-200 via-purple-200 to-pink-200 text-gray-800"
    } min-h-screen w-screen h-[calc(100vh-150px)] overflow-auto pb-20 flex flex-col justify-around`}>

      <button
        onClick={() => setTemaOscuro(!temaOscuro)}
        className="self-end mx-4 mt-4 px-4 py-2 rounded-lg shadow text-sm font-semibold transition-all
    bg-gray-800 text-white hover:bg-gray-700"
      >
        {temaOscuro ? "Tema Claro ☀️" : "Tema Oscuro 🌙"}
      </button>

      <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-800 tracking-wide drop-shadow-sm">
        Kioraicoletivo
      </h1>

      <h1 className="text-xl font-semibold uppercase text-center text-gray-900 lg:text-3xl">
        Horarios de{" "}
        {diaActual === "lunesAViernes"
          ? "Lunes a Viernes"
          : diaActual.charAt(0).toUpperCase() + diaActual.slice(1)}
      </h1>

      <div className="px-4 grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {Object.entries(referenciasAgrupadas).map(([base, refs], i) => (
          <div
            key={i}
            className="flex flex-col justify-between bg-cyan-100 bg-opacity-30 p-4 h-[230px] rounded-2xl shadow-lg border-2 border-gray-100"
          >
            <h2 className="text-base font-bold text-center text-gray-700 uppercase tracking-wide mb-3 flex items-center justify-center h-[60px] lg:text-xl">
              {capitalizar(base)}
            </h2>

            <div className="flex flex-col gap-3 justify-center items-center text-gray-800 w-full">
              {refs.map((ref, j) => {
                const tipo = ref.toLowerCase().includes("vuelta") ? "Vuelta" : "Ida";
                const activo = referencia === ref;

                return (
                  <button
                    key={j}
                    className={`uppercase rounded-xl px-5 py-3 text-sm font-semibold w-full transition-all border shadow-sm
                      ${activo
                        ? "bg-purple-600 text-white border-purple-700 shadow-md"
                        : "bg-gray-50 text-gray-800 border-gray-300 hover:bg-purple-100 active:bg-purple-200"
                      }`}
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
                      className={`rounded-2xl p-5 mb-5 transition-all duration-300 shadow-md ${
                        horarioDestacado === item.nombre
                          ? temaOscuro
                            ? "bg-purple-700 text-white border border-purple-900"
                            : "bg-gradient-to-r from-purple-600 to-purple-800 text-white border border-purple-900 shadow-2xl ring-2 ring-purple-400"
                          : temaOscuro
                            ? "bg-gray-800 text-white border border-gray-700"
                            : "bg-white bg-opacity-60 text-gray-800 border border-transparent hover:bg-opacity-80 hover:border-purple-300 hover:shadow-md"
                      }`}
                      
                    >
                      <div className="mb-3 font-semibold text-lg tracking-wide">
                        <p>
                          Hora de salida:{" "}
                          <span className="font-bold text-xl">{item.nombre} HS.</span>
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold uppercase text-sm tracking-wider">
                          Recorrido:{" "}
                          <span className="text-sm">{item.recorrido.join(" » ")}</span>
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
