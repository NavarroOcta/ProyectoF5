"use client";

import { useState } from "react";
import { setMockSession, logout } from "@/lib/actions/auth.actions";

export default function MockLogin() {
  const [isPending, setIsPending] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAuth = async (action: 'admin' | 'user' | 'logout') => {
    setIsPending(true);
    setFeedback("");
    
    try {
      if (action === 'logout') {
        await logout();
        setFeedback("Sesión cerrada correctamente");
      } else {
        const response = await setMockSession(action);
        if (response.success) {
          setFeedback(`Autenticado como: ${action}`);
        }
      }
    } finally {
      setIsPending(false);
      setTimeout(() => setFeedback(""), 3000);
    }
  };

  return (
    <div className="p-6 bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl border border-slate-100 w-full max-w-sm mx-auto flex flex-col gap-4">
      <h3 className="text-lg font-bold text-slate-800 text-center">Acceso de Pruebas</h3>
      
      <button 
        onClick={() => handleAuth('admin')} 
        disabled={isPending}
        className="w-full bg-slate-900 hover:bg-black text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Entrar como Admin
      </button>
      
      <button 
        onClick={() => handleAuth('user')} 
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Entrar como Usuario
      </button>
      
      <button 
        onClick={() => handleAuth('logout')} 
        disabled={isPending}
        className="w-full bg-transparent hover:bg-red-50 text-red-600 font-medium py-3 px-4 rounded-xl transition-all border border-red-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed mt-2"
      >
        Cerrar Sesión
      </button>

      {feedback && (
        <div className="mt-2 text-sm font-medium text-emerald-700 bg-emerald-50 py-2 px-3 rounded-lg text-center animate-pulse">
          {feedback}
        </div>
      )}
    </div>
  );
}
