import React, { useState, useEffect, useRef } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { FcClock } from "react-icons/fc";
import { IoArrowForward } from "react-icons/io5";
import { FiX } from "react-icons/fi"; // Importamos el ícono de flecha

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [horarioDestacado, setHorarioDestacado] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const refsHorarios = useRef({});

  // Efecto para detectar el día actual automáticamente
  useEffect(() => {
    if (!seleccionManual) {
      const dia = new Date().getDay();
      if (dia === 0) setDiaActual("domingos");
      else if (dia === 6) setDiaActual("sabados");
      else setDiaActual("lunesAViernes");
    }
  }, [seleccionManual]);

  const dataDelDia = horarios[diaActual] || [];
  const referenciasUnicas = [
    ...new Set(dataDelDia.map((h) => h.referencia).filter(Boolean)),
  ];

  // Función para convertir nombre de hora a minutos
  const convertirNombreAHoras = (nombre) => {
    if (!nombre) return 0;
    const [horas, minutos] = nombre.split(":").map(Number);
    return horas * 60 + minutos;
  };

  // Función para encontrar el horario más cercano al actual
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

  // Efecto para actualizar el horario destacado periódicamente
  useEffect(() => {
    if (!referencia) return;

    const actualizarHorario = () => {
      const horarioMasCercano = encontrarHorarioMasCercano();
      if (horarioMasCercano) {
        setHorarioDestacado(horarioMasCercano.nombre);
      }
    };

    actualizarHorario();
    const interval = setInterval(actualizarHorario, 1000); // Check every second

    return () => clearInterval(interval);
  }, [referencia, dataDelDia]);

  // Efecto para hacer scroll al horario destacado
  useEffect(() => {
    if (!referencia) return;
    const horarioMasCercano = encontrarHorarioMasCercano();
    if (horarioMasCercano) {
      setTimeout(() => {
        const ref = refsHorarios.current[horarioMasCercano.nombre];
        if (ref?.scrollIntoView) {
          ref.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300); // Delay to allow modal to render
    }
  }, [referencia]);

  // Agrupar referencias por nombre base
  const referenciasAgrupadas = referenciasUnicas.reduce((acc, ref) => {
    if (!ref) return acc;
    const partes = ref.split(" ");
    const base = partes
      .slice(1)
      .join(" ")
      .toLowerCase()
      .replace(/[-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!acc[base]) acc[base] = [];
    if (!acc[base].includes(ref)) acc[base].push(ref);
    return acc;
  }, {});

  // Función para capitalizar texto
  const capitalizar = (texto) =>
    texto
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  // Estado y efecto para el tema oscuro
  const [temaOscuro, setTemaOscuro] = useState(() => {
    const guardado = localStorage.getItem("temaOscuro");
    return guardado ? JSON.parse(guardado) : false;
  });

  useEffect(() => {
    localStorage.setItem("temaOscuro", JSON.stringify(temaOscuro));
    // Apply or remove dark class to body for global theme effect
    if (temaOscuro) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [temaOscuro]);

  // Función para cambiar día manualmente
  const cambiarDia = (nuevoDia) => {
    setSeleccionManual(true);
    setDiaActual(nuevoDia);
    setReferencia(null); // Reset selected reference when day changes
    setHorarioDestacado(null); // Reset highlighted schedule
  };

  return (
    <div
      className={`${
        temaOscuro
          ? "bg-gray-950 text-gray-100"
          : "bg-gradient-to-br from-blue-100 to-purple-100 text-gray-900"
      } min-h-screen pb-20 transition-colors duration-300 w-screen`}
    >
      {/* Header */}
      <header className="pt-10 pb-8 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent mb-2 drop-shadow-md animate-bounce">
          Kioraicoletivo
        </h1>
        <p
          className={`text-lg ${
            temaOscuro ? "text-gray-300" : "text-gray-600"
          }`}
        >
          Frecuencia de{" "}
          {diaActual === "lunesAViernes"
            ? "Lunes a Viernes"
            : capitalizar(diaActual)}
        </p>

        {/* Selector de días */}
        <div className="flex justify-center gap-3 mt-5 flex-wrap">
          <button
            onClick={() => cambiarDia("lunesAViernes")}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-md ${
              diaActual === "lunesAViernes"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white transform scale-105"
                : temaOscuro
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            }`}
          >
            Lunes a Viernes
          </button>
          <button
            onClick={() => cambiarDia("sabados")}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-md ${
              diaActual === "sabados"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white transform scale-105"
                : temaOscuro
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            }`}
          >
            Sábados
          </button>
          <button
            onClick={() => cambiarDia("domingos")}
            className={`px-5 py-2 rounded-full font-medium transition-all duration-300 shadow-md ${
              diaActual === "domingos"
                ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white transform scale-105"
                : temaOscuro
                ? "bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                : "bg-white hover:bg-gray-50 text-gray-700 border border-gray-200"
            }`}
          >
            Domingos
          </button>
        </div>

        {seleccionManual && (
          <button
            onClick={() => setSeleccionManual(false)}
            className={`mt-4 text-sm px-4 py-1.5 rounded-full ${
              temaOscuro
                ? "bg-gray-800 text-teal-400 hover:bg-gray-700"
                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
            } transition-colors duration-200`}
          >
            Volver a horario automático
          </button>
        )}
      </header>
      {/* Selector de rutas */}
      <section className="px-4 max-w-6xl mx-auto mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(referenciasAgrupadas).map(([base, refs], i) => (
            <div
              key={i}
              className={`rounded-2xl p-6 shadow-xl transition-all duration-300 border-2 ${
                temaOscuro
                  ? "bg-gray-800 border-gray-700 hover:border-teal-500"
                  : "bg-white border-gray-200 hover:border-blue-400"
              }`}
            >
              <h2 className="text-xl font-bold uppercase text-center mb-5 flex items-center justify-center gap-2">
                <span className="bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
                  {capitalizar(base)}
                </span>
              </h2>

              <div className="flex flex-col gap-4">
                {refs.map((ref, j) => {
                  const tipo = ref.toLowerCase().includes("vuelta")
                    ? "Vuelta"
                    : "Ida";
                  const activo = referencia === ref;

                  return (
                    <button
                      key={j}
                      className={`rounded-lg px-5 py-3 font-semibold transition-all duration-200 shadow-sm ${
                        activo
                          ? "bg-gradient-to-r from-teal-500 to-indigo-600 text-white transform scale-[1.02] shadow-md"
                          : temaOscuro
                          ? "bg-gray-700 hover:bg-gray-600 text-gray-100 border border-gray-600"
                          : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                      }`}
                      onClick={() => setReferencia(ref)}
                    >
                      <span className="flex items-center justify-center gap-2">
                        {tipo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Botón de tema */}
      <button
        onClick={() => setTemaOscuro(!temaOscuro)}
        className={`fixed right-6 bottom-6 z-30 p-3 rounded-full shadow-lg transition-all transform hover:scale-110 ${
          temaOscuro ? "bg-gray-700 text-yellow-300" : "bg-gray-800 text-white"
        }`}
        aria-label="Toggle dark mode"
      >
        {temaOscuro ? "☀️" : "🌙"}
      </button>

      {/* Modal de horarios */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }} // Start from bottom
            animate={{ opacity: 1, y: 0 }} // Slide up
            exit={{ opacity: 0, y: "100%" }} // Slide down on exit
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`fixed inset-0 z-40 ${
              temaOscuro ? "bg-gray-900" : "bg-white"
            } p-6 overflow-y-auto`}
          >
            <div className="max-w-2xl mx-auto relative">
              <button
                className={`${temaOscuro ? 'bg-gray-300' : 'bg-gray-700'} fixed top-6 right-6 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-50`}
                onClick={() => setReferencia(null)}
                aria-label="Cerrar horarios"
              >
                <FiX
                  className={`h-7 w-7 ${
                    temaOscuro ? "text-gray-900" : "text-gray-300"
                  }`}
                />
              </button>

              <h2 className="text-3xl font-bold mb-6 text-center pt-8">
                <span className="bg-gradient-to-r from-teal-500 to-indigo-600 bg-clip-text text-transparent">
                  Horarios{" "}
                  {referencia.split(" ")[0].toLowerCase().includes("vuelta")
                    ? "de Vuelta"
                    : "de Ida"}
                </span>
              </h2>

              {dataDelDia.filter((item) => item.referencia === referencia)
                .length > 0 ? (
                <div className="space-y-5 pb-16">
                  {" "}
                  {/* Added pb-16 for extra scroll space */}
                  {dataDelDia
                    .filter((item) => item.referencia === referencia)
                    .map((item, index) => (
                      <motion.div
                        key={index}
                        ref={(el) => (refsHorarios.current[item.nombre] = el)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }} // Staggered appearance
                        className={`rounded-xl p-5 transition-all duration-300 border-2 ${
                          horarioDestacado === item.nombre
                            ? temaOscuro
                              ? "bg-gradient-to-r from-teal-700 to-indigo-800 border-teal-500 shadow-lg"
                              : "bg-gradient-to-r from-teal-400 to-indigo-500 border-teal-300 shadow-lg"
                            : temaOscuro
                            ? "bg-gray-800 border-gray-700"
                            : "bg-white border-gray-200 shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className={`p-3 rounded-full ${
                              // Changed to rounded-full for the icon background
                              horarioDestacado === item.nombre
                                ? "bg-white bg-opacity-30"
                                : temaOscuro
                                ? "bg-gray-700"
                                : "bg-gray-100"
                            }`}
                          >
                            <FcClock className="text-3xl text-slate-900" />{" "}
                            {/* Larger icon */}
                          </div>
                          <div>
                            <h3
                              className={`text-xl font-bold ${
                                // Larger and bolder time
                                horarioDestacado === item.nombre
                                  ? "text-white"
                                  : temaOscuro
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              Salida: {item.nombre} hs
                            </h3>
                            <div className="mt-2">
                              {/* --- RECORRIDO CON ICONOS ANIMADOS --- */}
                              <p
                                className={`text-base ${
                                  horarioDestacado === item.nombre
                                    ? "text-gray-100"
                                    : temaOscuro
                                    ? "text-gray-300"
                                    : "text-gray-600"
                                }`}
                              >
                                <span className="font-semibold uppercase">
                                  Recorrido:
                                </span>{" "}
                                <span className="capitalize">
                                  {/* Usamos map para insertar el ícono entre los puntos del recorrido */}
                                  {item.recorrido.map((punto, idx) => (
                                    <React.Fragment key={idx}>
                                      {punto}
                                      {/* Renderiza el ícono solo si no es el último punto */}
                                      {idx < item.recorrido.length - 1 && (
                                        <IoArrowForward
                                          className="inline-block mx-1.5 align-middle text-xl animate-pulse" // Clases para el ícono
                                          style={{
                                            color:
                                              horarioDestacado ===
                                                item.nombre && temaOscuro
                                                ? "white" // Blanco para destacado en modo oscuro
                                                : horarioDestacado ===
                                                    item.nombre && !temaOscuro
                                                ? "#FFFFFF" // Un azul vibrante para destacado en modo claro (ej: blue-600)
                                                : temaOscuro
                                                ? "#CBD5E0" // Un gris claro para no destacado en modo oscuro (gray-300)
                                                : "#4A5568", // Un gris oscuro para no destacado en modo claro (gray-700)
                                          }}
                                        />
                                      )}
                                    </React.Fragment>
                                  ))}
                                </span>
                              </p>
                              {/* --- FIN RECORRIDO CON ICONOS ANIMADOS --- */}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p
                    className={`text-lg ${
                      temaOscuro ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    No hay horarios disponibles para esta ruta.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
