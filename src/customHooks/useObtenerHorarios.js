import { useState, useEffect } from "react";

export function useObtenerHorarios() {
  const [horarios, setHorarios] = useState({
    lunesAViernes: [],
    sabados: [],
    domingos: [],
  });

  useEffect(() => {
    const obtenerHorarios = async () => {
      try {
        const res = await fetch("https://70236255.netlify.app/horarios.json"); // Usá tu endpoint real
        const data = await res.json();
        setHorarios(data);
      } catch (error) {
        console.error("Error al obtener horarios:", error);
      }
    };

    obtenerHorarios();
  }, []);

  return horarios;
}
