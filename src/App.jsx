// App.js
import React from "react";
import MostrarHorariosPorDia from "./MostrarHorariosPorDia";
import Footer from "./Footer";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen relative">
      <main className="flex-grow">
        <MostrarHorariosPorDia />
      </main>
   
      <Footer />
    </div>
  );
}
