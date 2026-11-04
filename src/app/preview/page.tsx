"use client";

import React, { useState } from "react";
import Link from "next/link";

const DEVICES = [
  { id: "iphone15", name: "iPhone 14/15 Pro", width: 390, height: 844, scale: "100%" },
  { id: "samsung", name: "Samsung Galaxy S23", width: 412, height: 915, scale: "100%" },
  { id: "iphonese", name: "iPhone SE (Compacto)", width: 375, height: 667, scale: "100%" }
];

export default function MobilePreviewStudio() {
  const [selectedDevice, setSelectedDevice] = useState(DEVICES[0]);
  const [zoom, setZoom] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const localWifiIp = "192.168.110.229";

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#f4efe8] flex flex-col font-sans antialiased">
      
      {/* Barra de Control Superior */}
      <header className="bg-[#161a1f] border-b border-[#252c34] px-4 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs bg-[#242b33] hover:bg-[#2e3742] text-white px-3 py-1.5 rounded-lg border border-[#384350] transition-colors flex items-center gap-1.5"
          >
            <span>←</span>
            <span>Volver a la Web</span>
          </Link>
          <div className="border-l border-[#2e3742] pl-3">
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>📱</span>
              <span>Simulador de Vista Móvil — OxyEnergy</span>
            </h1>
            <p className="text-[11px] text-[#8e9aa8]">
              Prueba la experiencia de compra en smartphone tal como la verá tu cliente desde Meta Ads.
            </p>
          </div>
        </div>

        {/* Controles de Dispositivo */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center bg-[#20262e] p-1 rounded-xl border border-[#2e3742]">
            {DEVICES.map((dev) => (
              <button
                key={dev.id}
                onClick={() => setSelectedDevice(dev)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  selectedDevice.id === dev.id
                    ? "bg-[#1b3320] text-white shadow-xs font-bold"
                    : "text-[#97a3b2] hover:text-white"
                }`}
              >
                {dev.name} ({dev.width}px)
              </button>
            ))}
          </div>

          {/* Selector de Zoom */}
          <div className="flex items-center bg-[#20262e] px-2 py-1.5 rounded-xl border border-[#2e3742] gap-1.5">
            <span className="text-[11px] text-[#7f8c9d]">Zoom:</span>
            {[0.85, 1].map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                  zoom === z ? "bg-[#333d4a] text-white font-bold" : "text-[#8a97a8] hover:text-white"
                }`}
              >
                {Math.round(z * 100)}%
              </button>
            ))}
          </div>

          <button
            onClick={() => setReloadKey((k) => k + 1)}
            title="Recargar frame"
            className="p-1.5 bg-[#20262e] hover:bg-[#2c3540] text-[#97a3b2] hover:text-white rounded-xl border border-[#2e3742] transition-colors cursor-pointer"
          >
            🔄
          </button>
        </div>
      </header>

      {/* Área Central: Mockup del Teléfono */}
      <main className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center relative">
        
        {/* Aviso de Wi-Fi para probar en Teléfono Físico */}
        <aside aria-label="Instrucciones de prueba" className="mb-4 bg-[#18201a] border border-[#28422d] text-emerald-300 text-xs px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm text-center max-w-xl">
          <span className="text-base">💡</span>
          <span>
            <strong>¿Quieres probarlo en tu celular físico real?</strong> Conéctalo al mismo Wi-Fi y abre en Chrome/Safari:{" "}
            <code className="bg-black/40 text-emerald-200 px-2 py-0.5 rounded font-mono font-bold select-all">
              http://{localWifiIp}:3000
            </code>
          </span>
        </aside>

        {/* Chasis del Smartphone */}
        <div
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center top",
            transition: "all 0.25s ease-out"
          }}
          className="relative transition-all"
        >
          {/* Carcasa exterior de Titanio */}
          <div
            style={{
              width: selectedDevice.width + 24,
              height: selectedDevice.height + 24
            }}
            className="rounded-[52px] p-3 bg-gradient-to-b from-[#3a3f47] via-[#20242a] to-[#121518] shadow-[0_25px_80px_rgba(0,0,0,0.85)] border-4 border-[#4a515c] relative"
          >
            {/* Pantalla Interna */}
            <div
              style={{
                width: selectedDevice.width,
                height: selectedDevice.height
              }}
              className="bg-[#faf8f5] rounded-[42px] overflow-hidden relative shadow-inner flex flex-col"
            >
              {/* Dynamic Island / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-24 h-5 bg-black rounded-full pointer-events-none flex items-center justify-end pr-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e] border border-[#2c2c2e]"></span>
              </div>

              {/* Iframe con la Landing Page Real */}
              <iframe
                key={reloadKey}
                src="/"
                title="Vista previa móvil OxyEnergy"
                className="w-full h-full border-0 select-auto"
                style={{
                  width: selectedDevice.width,
                  height: selectedDevice.height
                }}
              />

              {/* Home Bar Inferior de iPhone */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-50 w-32 h-1 bg-black/40 rounded-full pointer-events-none backdrop-blur-xs"></div>
            </div>
          </div>
        </div>

        {/* Tip de DevTools */}
        <p className="mt-6 text-[11px] text-[#636f80] text-center max-w-md">
          Tip nativo de navegador: En cualquier momento puedes presionar <kbd className="bg-[#1f262e] text-[#a1b0c2] px-1.5 py-0.5 rounded border border-[#2e3742]">F12</kbd> y luego <kbd className="bg-[#1f262e] text-[#a1b0c2] px-1.5 py-0.5 rounded border border-[#2e3742]">Ctrl + Shift + M</kbd> en Google Chrome o Edge para activar el emulador móvil oficial.
        </p>
      </main>

    </div>
  );
}
