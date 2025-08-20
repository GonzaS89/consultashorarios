import React, { useState, useEffect, useRef } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { FcClock } from "react-icons/fc";
import { IoArrowForward, IoSync } from "react-icons/io5";
import { FiX, FiSun, FiMoon, FiRefreshCw, FiAlertCircle } from "react-icons/fi";

export default function MostrarHorariosPorDia() {
  const horarios = useObtenerHorarios();
  const [diaActual, setDiaActual] = useState("lunesAViernes");
  const [referencia, setReferencia] = useState(null);
  const [horarioDestacado, setHorarioDestacado] = useState(null);
  const [seleccionManual, setSeleccionManual] = useState(false);
  const refsHorarios = useRef({});

  const temaOscuro = localStorage.getItem("temaOscuro") === "true";
  const [darkMode, setDarkMode] = useState(temaOscuro);

  // Auto-detect day
  useEffect(() => {
    if (!seleccionManual) {
      const dia = new Date().getDay();
      if (dia === 0) setDiaActual("domingos");
      else if (dia === 6) setDiaActual("sabados");
      else setDiaActual("lunesAViernes");
    }
  }, [seleccionManual]);


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

  // Update highlighted schedule every second
  useEffect(() => {
    if (!referencia) return;

    const actualizar = () => {
      const horario = encontrarHorarioMasCercano();
      if (horario) setHorarioDestacado(horario.nombre);
    };

    actualizar();
    const interval = setInterval(actualizar, 1000);
    return () => clearInterval(interval);
  }, [referencia, dataDelDia]);

  // Scroll to highlighted schedule
  useEffect(() => {
    if (!referencia || !horarioDestacado) return;
    const ref = refsHorarios.current[horarioDestacado];
    if (ref) {
      setTimeout(() => {
        ref.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }, 350);
    }
  }, [horarioDestacado, referencia]);

  // Group references
  const referenciasAgrupadas = referenciasUnicas.reduce((acc, ref) => {
    if (!ref) return acc;
    const base = ref
      .split(" ")
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

  const capitalizar = (texto) =>
    texto
      .split(" ")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");

  // Toggle dark mode
  const toggleDarkMode = () => {
    const nuevo = !darkMode;
    setDarkMode(nuevo);
    localStorage.setItem("temaOscuro", nuevo);
    document.documentElement.classList.toggle("dark", nuevo);
  };

  // Change day
  const cambiarDia = (nuevoDia) => {
    setSeleccionManual(true);
    setDiaActual(nuevoDia);
    setReferencia(null);
    setHorarioDestacado(null);
  };

  return (
    <div
      className={`${
        darkMode ? "dark bg-slate-950 text-slate-50" : "bg-gradient-to-br from-blue-50 to-indigo-50 text-slate-900 py-4"
      } min-h-screen w-full transition-colors duration-500 ease-in-out font-sans antialiased`}
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Header */}
      <header className="pt-12 pb-8 px-5 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-teal-400 via-emerald-500 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight drop-shadow-sm">
          Kioraicoletivo
        </h1>
        <p className={`text-lg md:text-xl ${darkMode ? "text-slate-300" : "text-slate-600"} font-medium`}>
          Frecuencia de{" "}
          <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-blue-500">
            {diaActual === "lunesAViernes"
              ? "Lunes a Viernes"
              : capitalizar(diaActual)}
          </span>
        </p>

        {/* Day selector */}
        <div className="flex justify-center gap-3 mt-8 flex-wrap max-w-lg mx-auto">
          {[
            { key: "lunesAViernes", label: "Lunes a Viernes" },
            { key: "sabados", label: "Sábados" },
            { key: "domingos", label: "Domingos" },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => cambiarDia(key)}
              className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 shadow-md transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                diaActual === key
                  ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white shadow-lg scale-105"
                  : darkMode
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm"
              }`}
              aria-pressed={diaActual === key}
            >
              {label}
            </button>
          ))}
        </div>

        {seleccionManual && (
          <button
            onClick={() => setSeleccionManual(false)}
            className={`mt-5 text-sm px-5 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 flex items-center justify-center gap-2 mx-auto ${
              darkMode
                ? "bg-slate-800 text-teal-400 hover:bg-slate-700 focus:ring-teal-500"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 focus:ring-blue-300"
            }`}
          >
            <FiRefreshCw className="w-4 h-4" />
            Volver a automático
          </button>
        )}
      </header>

      {/* Route selector */}
    <section className="px-5 max-w-6xl mx-auto mt-12">
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
    {Object.entries(referenciasAgrupadas).map(([base, refs]) => (
      <motion.div
        key={base}
        whileHover={{ 
          y: -6, 
          boxShadow: darkMode
            ? "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)"
            : "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
        }}
        className={`rounded-2xl overflow-hidden transition-all duration-300 ${
          darkMode
            ? "bg-slate-800/80 border border-slate-700 shadow-lg shadow-black/10"
            : "bg-white border border-slate-200 shadow-lg hover:shadow-2xl"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-5 text-center border-b transition-colors duration-200 ${
            darkMode
              ? "border-slate-700 bg-slate-800"
              : "border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100"
          }`}
        >
          <h2 className="text-xl font-bold uppercase tracking-wide bg-gradient-to-r from-teal-400 to-blue-500 bg-clip-text text-transparent">
            {capitalizar(base)}
          </h2>
        </div>

        {/* Buttons (Ida / Vuelta) */}
        <div className="p-1">
          {refs.map((ref) => {
            const tipo = ref.toLowerCase().includes("vuelta") ? "Vuelta" : "Ida";
            const activo = referencia === ref;
            const esVuelta = tipo === "Vuelta";

            return (
              <button
                key={ref}
                onClick={() => setReferencia(ref)}
                aria-pressed={activo}
                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-all duration-200 focus:outline-none focus:ring-2 ${
                  darkMode ? "focus:ring-teal-500/50" : "focus:ring-blue-300"
                } ${
                  activo
                    ? "bg-gradient-to-r from-teal-500 to-blue-600 text-white"
                    : darkMode
                    ? "bg-slate-800 text-slate-200"
                    : "bg-slate-50 text-slate-700"
                }`}
              >
                {/* Icon */}
                <div
                  className={`p-2.5 flex-shrink-0 transition-colors duration-200 ${
                    activo
                      ? "bg-white bg-opacity-20"
                      : darkMode
                      ? "bg-slate-700"
                      : "bg-slate-100"
                  }`}
                >
                  {esVuelta ? (
                    <IoSync className={`w-5 h-5 ${activo ? "text-white" : darkMode ? "text-teal-400" : "text-teal-500"}`} />
                  ) : (
                    <IoArrowForward className={`w-5 h-5 ${activo ? "text-white" : darkMode ? "text-blue-400" : "text-blue-500"}`} />
                  )}
                </div>

                {/* Text */}
                <div>
                  <span className={`font-semibold block transition-colors duration-200 ${activo ? "text-white" : ""}`}>
                    {esVuelta ? "🔄 Vuelta" : "📍 Ida"}
                  </span>
                  <span
                    className={`text-sm block mt-0.5 transition-colors duration-200 ${
                      activo
                        ? "text-teal-100"
                        : darkMode
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    {capitalizar(base)}
                  </span>
                </div>

                {/* Active indicator */}
                {activo && (
                  <div className="ml-auto">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </motion.div>
    ))}
  </div>
</section>

      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className={`fixed right-6 bottom-6 z-50 p-3.5 rounded-full shadow-xl transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 flex items-center justify-center ${
          darkMode
            ? "bg-yellow-400 text-slate-900 focus:ring-yellow-300"
            : "bg-slate-800 text-white focus:ring-slate-700"
        }`}
        aria-label={darkMode ? "Activar modo claro" : "Activar modo oscuro"}
      >
        {darkMode ? <FiSun className="w-6 h-6" /> : <FiMoon className="w-6 h-6" />}
      </button>

      {/* Schedule Modal */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={`fixed inset-0 z-50 ${
              darkMode ? "bg-slate-900" : "bg-white"
            } overflow-y-auto pb-20`}
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            <div className="max-w-2xl mx-auto px-6 pt-12 relative">
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`fixed top-6 right-6 p-3 rounded-full shadow-lg transition-colors z-50 ${
                  darkMode ? "bg-slate-200" : "bg-slate-800"
                }`}
                onClick={() => setReferencia(null)}
                aria-label="Cerrar modal de horarios"
              >
                <FiX
                  className={`w-6 h-6 ${
                    darkMode ? "text-slate-900" : "text-white"
                  }`}
                />
              </motion.button>

              {/* Title */}
              <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-teal-400 to-blue-600 bg-clip-text text-transparent">
                Horarios {"  "}
                {referencia.includes("Vuelta") ? "de vuelta" : "de ida"}
              </h2>

              {/* Schedule List */}
              {dataDelDia.filter((item) => item.referencia === referencia).length > 0 ? (
                <div className="space-y-6 pb-20">
                  {dataDelDia
                    .filter((item) => item.referencia === referencia)
                    .map((item) => (
                      <div
                        key={item.nombre}
                        ref={(el) => (refsHorarios.current[item.nombre] = el)}
                        className={`rounded-2xl p-6 transition-all duration-300 border-2 ${
                          horarioDestacado === item.nombre
                            ? "bg-gradient-to-r from-teal-500 to-blue-600 border-teal-400 shadow-xl text-white"
                            : darkMode
                            ? "bg-slate-800 border-slate-700"
                            : "bg-white border-slate-200 shadow-md"
                        }`}
                      >
                        <div className="flex items-start gap-5">
                          {/* Clock Icon */}
                          <div
                            className={`p-4 rounded-full ${
                              horarioDestacado === item.nombre
                                ? "bg-white bg-opacity-20"
                                : darkMode
                                ? "bg-slate-700"
                                : "bg-slate-100"
                            }`}
                          >
                            <FcClock className="w-8 h-8 text-black" />
                          </div>

                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold mb-2">
                              Salida:{" "}
                              <span className="font-extrabold">
                                {item.nombre} hs
                              </span>
                            </h3>

                            <p
                              className={`text-sm md:text-base leading-relaxed ${
                                horarioDestacado === item.nombre
                                  ? "text-teal-50"
                                  : darkMode
                                  ? "text-slate-300"
                                  : "text-slate-600"
                              }`}
                            >
                              <span className="font-semibold uppercase text-xs tracking-wider opacity-80">
                                Recorrido:
                              </span>{" "}
                              <span className="capitalize">
                                {item.recorrido.map((punto, idx) => (
                                  <React.Fragment key={idx}>
                                    {punto}
                                    {idx < item.recorrido.length - 1 && (
                                      <IoArrowForward
                                        className="inline-block mx-2 text-lg align-middle"
                                        style={{
                                          color:
                                            horarioDestacado === item.nombre
                                              ? "#ffffff"
                                              : darkMode
                                              ? "#94a3b8"
                                              : "#475569",
                                        }}
                                      />
                                    )}
                                  </React.Fragment>
                                ))}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <FiAlertCircle className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <p className={`text-xl ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
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