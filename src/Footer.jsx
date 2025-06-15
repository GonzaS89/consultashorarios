import React from "react";

function Footer() {
  return (
    <footer className="w-full bg-gray-800 text-gray-300 py-3 fixed bottom-0 text-center border-t border-gray-700 z-20">
      <div className="max-w-6xl mx-auto px-4">
        <p className="text-sm sm:text-base group">
          Desarrollado por 
          <span className="font-semibold ml-1 text-purple-400 hover:text-purple-300 transition-colors duration-200">
            Sinhg Gonzalo
          </span>
          
        </p>
      </div>
    </footer>
  );
}

export default Footer;