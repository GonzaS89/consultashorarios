// App.js
import React from "react";
import MostrarHorariosPorDia from "./MostrarHorariosPorDia";
import Footer from "./Footer";

export default function App() {
  return (
    <div className="flex flex-col min-h-[100dvh]">
  <main className="flex-grow flex justify-center items-center">
    <MostrarHorariosPorDia />
  </main>

  <footer className="bg-gray-900 text-white py-6">
    <Footer />
  </footer>
</div>
  );
}
