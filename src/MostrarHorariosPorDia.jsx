import { useState, useEffect, useRef } from "react";
import { useObtenerHorarios } from "./customHooks/useObtenerHorarios";
import { motion, AnimatePresence } from "framer-motion";
import { FcClock } from "react-icons/fc";

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
  const referenciasUnicas = [...new Set(dataDelDia.map((h) => h.referencia).filter(Boolean))];

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
    const interval = setInterval(actualizarHorario, 1000);

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
      }, 300);
    }
  }, [referencia]);

  // Agrupar referencias por nombre base
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
  }, [temaOscuro]);

  // Función para cambiar día manualmente
  const cambiarDia = (nuevoDia) => {
    setSeleccionManual(true);
    setDiaActual(nuevoDia);
    setReferencia(null);
    setHorarioDestacado(null);
  };

  return (
    <div className={`${temaOscuro ? "bg-gray-900" : "bg-gradient-to-br from-blue-50 to-purple-50"} min-h-screen pb-20 transition-colors duration-300 w-screen`}>
      {/* Header */}
      <header className="pt-10 pb-8 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent mb-2">
          Kioraicoletivo
        </h1>
        <p className={`text-lg ${temaOscuro ? "text-gray-300" : "text-gray-600"}`}>
          Frecuencia de {diaActual === "lunesAViernes" ? "Lunes a Viernes" : capitalizar(diaActual)}
        </p>
        
        {/* Selector de días */}
        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          <button
            onClick={() => cambiarDia("lunesAViernes")}
            className={`px-4 py-2 rounded-lg transition-all ${
              diaActual === "lunesAViernes"
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                : temaOscuro
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Lunes a Viernes
          </button>
          <button
            onClick={() => cambiarDia("sabados")}
            className={`px-4 py-2 rounded-lg transition-all ${
              diaActual === "sabados"
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                : temaOscuro
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Sábados
          </button>
          <button
            onClick={() => cambiarDia("domingos")}
            className={`px-4 py-2 rounded-lg transition-all ${
              diaActual === "domingos"
                ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white"
                : temaOscuro
                  ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                  : "bg-white hover:bg-gray-100 text-gray-700"
            }`}
          >
            Domingos
          </button>
        </div>
        
        {seleccionManual && (
          <button 
            onClick={() => setSeleccionManual(false)}
            className={`mt-3 text-sm px-3 py-1 rounded-full ${
              temaOscuro 
                ? "bg-gray-700 text-purple-300 hover:bg-gray-600" 
                : "bg-gray-200 text-purple-600 hover:bg-gray-300"
            }`}
          >
            Volver a horario automático
          </button>
        )}
      </header>

      {/* Selector de rutas */}
      <section className="px-4 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Object.entries(referenciasAgrupadas).map(([base, refs], i) => (
            <div
              key={i}
              className={`rounded-xl p-5 shadow-lg transition-all duration-300 ${
                temaOscuro 
                  ? "bg-gray-800 border-gray-700 hover:border-purple-500" 
                  : "bg-white border-gray-200 hover:border-purple-300"
              } border-2`}
            >
              <h2 className="text-xl font-bold uppercase text-center mb-4 flex items-center justify-center gap-2">
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  {capitalizar(base)}
                </span>
              </h2>

              <div className="flex flex-col gap-3">
                {refs.map((ref, j) => {
                  const tipo = ref.toLowerCase().includes("vuelta") ? "Vuelta" : "Ida";
                  const activo = referencia === ref;

                  return (
                    <button
                      key={j}
                      className={`rounded-lg px-4 py-3 font-medium transition-all ${
                        activo
                          ? "bg-gradient-to-r from-purple-600 to-blue-500 text-white shadow-md"
                          : temaOscuro
                            ? "bg-gray-700 hover:bg-gray-600 text-gray-100"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
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
        className={`fixed right-6 bottom-6 z-30 p-3 rounded-full shadow-lg transition-all ${
          temaOscuro ? 'bg-gray-700 text-yellow-300' : 'bg-gray-800 text-white'
        }`}
      >
        {temaOscuro ? "☀️" : "🌙"}
      </button>

      {/* Modal de horarios */}
      <AnimatePresence>
        {referencia && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`fixed inset-0 z-40 ${temaOscuro ? 'bg-gray-900' : 'bg-white'} p-6 overflow-y-auto`}
          >
            <div className="max-w-2xl mx-auto relative">
              <button
                className="fixed top-6 right-2 p-2 rounded-full hover:bg-gray-200 transition-colors"
                onClick={() => setReferencia(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <h2 className="text-2xl font-bold mb-6 text-center pt-4">
                <span className="bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                  Horarios {referencia.split(" ")[0].toLowerCase().includes("vuelta") ? "de Vuelta" : "de Ida"}
                </span>
              </h2>

              {dataDelDia.filter(item => item.referencia === referencia).length > 0 ? (
                <div className="space-y-4">
                  {dataDelDia
                    .filter(item => item.referencia === referencia)
                    .map((item, index) => (
                      <motion.div
                        key={index}
                        ref={el => (refsHorarios.current[item.nombre] = el)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`rounded-xl p-5 transition-all duration-300 ${
                          horarioDestacado === item.nombre
                            ? temaOscuro
                              ? "bg-gradient-to-r from-purple-800 to-blue-800 border-purple-500"
                              : "bg-gradient-to-r from-purple-500 to-blue-500 border-purple-300"
                            : temaOscuro
                              ? "bg-gray-800 border-gray-700"
                              : "bg-white border-gray-200"
                        } border shadow-md`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            horarioDestacado === item.nombre 
                              ? "bg-white bg-opacity-20" 
                              : temaOscuro 
                                ? "bg-gray-700" 
                                : "bg-gray-100"
                          }`}>
                            <FcClock className="text-2xl text-gray-800" />
                          </div>
                          <div>
                            <h3 className={`text-lg font-semibold ${
                              horarioDestacado === item.nombre ? "text-white" : temaOscuro ? "text-white" : "text-gray-800"
                            }`}>
                              Salida: <span className="font-bold">{item.nombre} hs</span>
                            </h3>
                            <div className="mt-2">
                              <p className={`text-sm ${
                                horarioDestacado === item.nombre ? "text-white" : temaOscuro ? "text-gray-300" : "text-gray-600"
                              }`}>
                                <span className="font-medium up">Recorrido:</span> <span className="capitalize">{item.recorrido.join(" → ")}</span> 
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className={`text-lg ${temaOscuro ? "text-gray-400" : "text-gray-500"}`}>
                    No hay horarios disponibles para esta ruta
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