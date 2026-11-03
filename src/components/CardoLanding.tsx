"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// WhatsApp comercial de atencin y confirmacin de pedidos
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "584241154804";

// Lista de estados y ciudades principales de Venezuela (Caracas primero para mxima facilidad)
const VENEZUELA_STATES = [
  "Caracas (Distrito Capital)",
  "Miranda (Altamira, Chacao, Baruta, San Antonio, Guarenas, Guatire)",
  "Carabobo (Valencia, Naguanagua, Puerto Cabello)",
  "Aragua (Maracay, Cagua, Turmero)",
  "Zulia (Maracaibo, San Francisco, Cabimas)",
  "Lara (Barquisimeto, Cabudare)",
  "Anzoategui (Lecheria, Puerto La Cruz, Barcelona)",
  "Bolivar (Puerto Ordaz, Ciudad Bolivar)",
  "Nueva Esparta (Isla de Margarita)",
  "Tachira (San Cristobal)",
  "Merida (Merida, El Vigia)",
  "Falcon (Coro, Punto Fijo)",
  "Monagas (Maturin)",
  "Portuguesa (Acarigua, Guanare)",
  "Barinas (Barinas)",
  "Sucre (Cumana, Carupano)",
  "Yaracuy (San Felipe)",
  "Guarico (San Juan de los Morros, Calabozo)",
  "Trujillo (Valera, Trujillo)",
  "Cojedes (San Carlos)",
  "Apure (San Fernando)",
  "Delta Amacuro (Tucupita)",
  "Amazonas (Puerto Ayacucho)"
];

// Opciones de paquetes / Pricing optimizados para Venezuela COD con Tealca
const PACK_OPTIONS = [
  {
    id: "pack_2",
    title: "Combo Recomendado (2 Frascos)",
    subtitle: "Tratamiento Completo de 6 Meses • 180 Cápsulas",
    price: 29.99,
    originalPrice: 40.00,
    savings: "Ahorras $10.01",
    shipping: "ENVÍO GRATIS POR TEALCA A TODA VENEZUELA",
    recommended: true,
    badge: "MÁS POPULAR • ENVÍO GRATIS",
    bottles: 2,
    capsules: 180,
    dailyCost: "$0.16 al día"
  },
  {
    id: "pack_1",
    title: "Tratamiento Inicial (1 Frasco)",
    subtitle: "Tratamiento de 3 Meses • 90 Cápsulas",
    price: 19.99,
    originalPrice: 25.00,
    savings: "Ahorras $5.01",
    shipping: "Despacho a toda Venezuela por Tealca",
    recommended: false,
    badge: "PRUEBA INICIAL",
    bottles: 1,
    capsules: 90,
    dailyCost: "$0.22 al día"
  },
  {
    id: "pack_3",
    title: "Tratamiento Familiar (3 Frascos)",
    subtitle: "Tratamiento Extendido de 9 Meses • 270 Cápsulas",
    price: 39.99,
    originalPrice: 60.00,
    savings: "Ahorras $20.01",
    shipping: "ENVÍO GRATIS POR TEALCA A TODA VENEZUELA",
    recommended: false,
    badge: "MÁXIMO AHORRO",
    bottles: 3,
    capsules: 270,
    dailyCost: "$0.14 al día"
  }
];

export default function CardoLanding() {
  const [selectedPack, setSelectedPack] = useState(PACK_OPTIONS[0]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Formulario COD
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    state: "Caracas (Distrito Capital)",
    cityAddress: "",
    paymentMethod: "efectivo_divisas",
    notes: ""
  });
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Las 4 imágenes seleccionadas por el usuario
  // La imagen seleccionada (carousel_1_selected.jpg) es SIEMPRE la primera (index 0)
  const galleryImages = [
    {
      src: "/cardo/carousel_1_selected.jpg",
      alt: "OxyEnergy Cardo Mariano 80% Silimarina - Frasco Original 90 Cápsulas",
      tag: "ORIGINAL OXYENERGY"
    },
    {
      src: "/cardo/carousel_2.jpg",
      alt: "Demostración de Presentación y Cápsulas Vegetales OxyEnergy",
      tag: "FÓRMULA 6 EN 1"
    },
    {
      src: "/cardo/carousel_3.jpg",
      alt: "Pureza Botánica de Alta Concentración 80% Silimarina",
      tag: "80% SILIMARINA ACTIVA"
    },
    {
      src: "/cardo/carousel_4.jpg",
      alt: "Bienestar Hepático Diario y Alivio Digestivo",
      tag: "1 CÁPSULA AL DÍA"
    }
  ];

  const [isCarouselPaused, setIsCarouselPaused] = useState(false);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Carrusel automático lento: 5.5s
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isCarouselPaused, galleryImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % galleryImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    setIsCarouselPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsCarouselPaused(false);
    if (touchEndX.current !== 0) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff > 45) {
        nextSlide();
      } else if (diff < -45) {
        prevSlide();
      }
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Sticky bar scroll trigger
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 340) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const openCheckout = (pack = selectedPack) => {
    setSelectedPack(pack);
    setIsCheckoutOpen(true);
    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "InitiateCheckout", {
        content_name: pack.title,
        content_ids: [pack.id],
        value: pack.price,
        currency: "USD"
      });
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.cityAddress.trim()) {
      setErrorMessage("Por favor completa tu nombre, teléfono y dirección o agencia Tealca.");
      return;
    }

    setFormStatus("submitting");
    setErrorMessage("");

    try {
      const eventId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `order_${Date.now()}`;

      const paymentLabel =
        formData.paymentMethod === "pagomovil"
          ? "Pago Móvil (Bs a tasa oficial)"
          : formData.paymentMethod === "binance_usdt"
          ? "Binance USDT"
          : "Dólares en Efectivo ($)";

      // Formato WhatsApp limpio y robusto (sin símbolos complejos que causen caracteres de reemplazo)
      const cleanState = formData.state.split("(")[0].trim();
      const messageLines = [
        "*SOLICITUD DE PEDIDO - OXYENERGY VENEZUELA*",
        "------------------------------------",
        "*DETALLE DEL TRATAMIENTO:*",
        `- Producto: OxyEnergy Cardo Mariano (80% Silimarina)`,
        `- Combo: ${selectedPack.title}`,
        `- Contenido: ${selectedPack.capsules} Cápsulas (${selectedPack.bottles} ${selectedPack.bottles === 1 ? 'Frasco' : 'Frascos'})`,
        `- Total a Pagar: $${selectedPack.price.toFixed(2)} USD`,
        `- Despacho: Pago Contra Entrega por Tealca`,
        "",
        "*DATOS PARA EL ENVÍO:*",
        `- Cliente: ${formData.fullName.trim()}`,
        `- Teléfono: ${formData.phone.trim()}`,
        `- Estado: ${cleanState}`,
        `- Dirección o Agencia Tealca: ${formData.cityAddress.trim()}`,
        `- Método de Pago al Recibir: ${paymentLabel}`,
        ...(formData.notes?.trim() ? [`- Nota: ${formData.notes.trim()}`] : []),
        "",
        "------------------------------------",
        "*MODALIDAD:* PAGO AL RECIBIR POR TEALCA",
        "Pagas únicamente cuando recibas el paquete en tus manos.",
        "",
        "Hola, acabo de llenar mis datos en la página web para solicitar mi Cardo Mariano. ¿Me confirman para coordinar el despacho por Tealca?"
      ];

      const message = messageLines.join("\n");
      const cleanPhone = WHATSAPP_NUMBER.replace(/\D/g, "");
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

      if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
        (window as unknown as { fbq: (...args: unknown[]) => void }).fbq(
          "track",
          "Purchase",
          {
            content_name: selectedPack.title,
            content_ids: [selectedPack.id],
            value: selectedPack.price,
            currency: "USD"
          },
          { eventID: eventId }
        );
      }

      setFormStatus("success");

      setTimeout(() => {
        window.location.href = waUrl;
      }, 300);
    } catch (err) {
      console.error("Error al procesar:", err);
      setErrorMessage("Ocurrió un inconveniente. Puedes escribirnos directo a WhatsApp.");
      setFormStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#221e1a] font-sans antialiased pb-24 md:pb-12 overflow-x-hidden w-full max-w-full">
      
      {/* 1. Barra de Confianza Superior (Fuerte garantía de Pago Contra Entrega por Tealca) */}
      <aside 
        aria-label="Aviso de entrega y pago" 
        className="bg-[#1b3320] text-[#f4efe8] text-[11px] sm:text-xs py-1.5 px-3 text-center font-medium tracking-wide border-b border-[#2d4d33]"
      >
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-1.5 flex-wrap leading-tight">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-white">PAGO AL RECIBIR EN TODA VENEZUELA:</span>
          <span>No pagas nada por adelantado. Envíos 100% por <strong>Tealca</strong>.</span>
        </div>
      </aside>

      {/* 2. Cabecera Minimalista */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#eae3d7]">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 h-13 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg sm:text-2xl font-serif font-bold tracking-tight text-[#1b3320]">
              OXYENERGY<span className="text-emerald-700">.</span>
            </span>
            <span className="hidden md:inline-block text-[11px] text-[#736a5f] border-l border-[#dcd3c5] pl-3 tracking-widest uppercase">
              Laboratorio Botánico Clínico
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tengo dudas sobre el Cardo Mariano OxyEnergy antes de ordenar.")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atención por WhatsApp"
              className="text-xs font-semibold text-[#1f3823] hover:text-[#325938] flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-[#d8cfbf] hover:bg-[#f1ebe0] transition-colors"
            >
              <span>💬</span>
              <span className="hidden md:inline">¿Dudas?</span>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>

            <button
              onClick={() => openCheckout()}
              style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
              className="hover:bg-[#132617] !text-white text-xs font-bold py-1.5 px-3 sm:px-4 rounded-full shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span style={{ color: "#ffffff" }} className="!text-white font-bold">
                Pedir<span className="hidden sm:inline"> al Recibir</span>
              </span>
              <span style={{ color: "#ffffff" }}>→</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Principal: Galería con Carrusel Suave + Oferta Minimalista */}
      <main className="max-w-5xl mx-auto px-4 pt-4 md:pt-8 space-y-8 md:space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start">
          
          {/* Columna Izquierda: Galería con Carrusel Dinámico */}
          <div 
            className="md:col-span-6 space-y-2.5"
            onMouseEnter={() => setIsCarouselPaused(true)}
            onMouseLeave={() => setIsCarouselPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Contenedor principal del Carrusel */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-white border border-[#e8e1d5] shadow-xs group">
              
              {/* Barra de progreso segmentada tipo Stories */}
              <div className="absolute top-2.5 left-3 right-3 z-30 flex gap-1.5 pointer-events-none">
                {galleryImages.map((_, idx) => (
                  <div key={idx} className="h-1 flex-1 bg-black/15 backdrop-blur-xs rounded-full overflow-hidden">
                    <div
                      key={`${idx}-${currentSlide}`}
                      className={`h-full rounded-full ${
                        idx < currentSlide
                          ? "bg-[#1b3320] w-full"
                          : idx === currentSlide
                          ? "bg-[#1b3320]"
                          : "w-0"
                      }`}
                      style={
                        idx === currentSlide
                          ? {
                              animation: "progressFill 5.5s linear forwards",
                              animationPlayState: isCarouselPaused ? "paused" : "running"
                            }
                          : {}
                      }
                    />
                  </div>
                ))}
              </div>

              {/* Slides con transición y zoom suave */}
              {galleryImages.map((img, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    currentSlide === idx ? "opacity-100 z-10" : "opacity-0 pointer-events-none z-0"
                  }`}
                >
                  <div
                    className={`w-full h-full relative transition-transform duration-[5500ms] ease-out ${
                      currentSlide === idx ? "scale-[1.03]" : "scale-100"
                    }`}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      priority={idx === 0}
                      loading={idx === 0 ? "eager" : "lazy"}
                      className="object-contain p-2 md:p-4"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                </div>
              ))}

              {/* Tag / Badge flotante */}
              <div className="absolute top-5 left-3 z-20 bg-[#1b3320]/90 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full shadow-xs pointer-events-none">
                {galleryImages[currentSlide].tag}
              </div>

              {/* Contador */}
              <div className="absolute bottom-3 right-3 z-20 bg-white/95 backdrop-blur-xs text-[#443e37] text-[10px] font-medium px-2 py-0.5 rounded-md border border-[#e4ded3] shadow-xs pointer-events-none">
                {currentSlide + 1} / {galleryImages.length}
              </div>

              {/* Flechas de navegación */}
              <button
                type="button"
                onClick={prevSlide}
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1b3320] shadow-md flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer text-base font-bold border border-[#eae2d5]"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={nextSlide}
                aria-label="Siguiente imagen"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#1b3320] shadow-md flex items-center justify-center opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-all cursor-pointer text-base font-bold border border-[#eae2d5]"
              >
                ›
              </button>
            </div>

            {/* 4 Miniaturas */}
            <div className="grid grid-cols-4 gap-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden bg-white border-2 transition-all cursor-pointer ${
                    currentSlide === idx 
                      ? "border-[#1b3320] ring-2 ring-[#1b3320]/25 shadow-xs" 
                      : "border-[#e5ded2] opacity-75 hover:opacity-100"
                  }`}
                >
                  <Image src={img.src} alt={img.alt} fill className="object-cover p-0.5" sizes="25vw" />
                </button>
              ))}
            </div>

            {/* Caja de Confianza y Seguridad */}
            <div className="bg-[#f3efe8] rounded-xl p-3 border border-[#e2d9cd] text-xs text-[#4a4238] space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#1b3320]">
                <span>🛡️</span>
                <span>PAGO AL RECIBIR • CERO RIESGO</span>
              </div>
              <ul className="space-y-0.5 pl-4 list-disc text-[11px] leading-tight text-[#574e44]">
                <li><strong>No pagas ahora:</strong> Cancela en tus manos al recibir tu paquete.</li>
                <li><strong>Un operador te llamará:</strong> Te contactaremos por WhatsApp para validar tu envío.</li>
                <li><strong>Despacho por Tealca:</strong> Directo a tu dirección o a la agencia Tealca que elijas.</li>
              </ul>
            </div>
          </div>

          {/* Columna Derecha: Título, Micro-beneficios, Combos y Botón Principal */}
          <div className="md:col-span-6 space-y-3.5">
            
            {/* Alerta de Actividad en Vivo */}
            <div className="inline-flex items-center gap-1.5 bg-[#eef7ec] border border-[#cbe6c8] px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] text-[#1c4521] font-medium shadow-2xs max-w-full flex-wrap">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span><strong>14 personas</strong> viendo hoy</span>
              <span>•</span>
              <span>Envíos activos por <strong>Tealca</strong></span>
            </div>

            {/* Título & Rating */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-[#6b6255]">
                <div className="flex text-amber-500">★★★★★</div>
                <span className="font-bold text-[#2d2925]">4.9 / 5</span>
                <span>•</span>
                <span>+1,280 clientes satisfechos en Venezuela</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#2f5c36] block">
                PROTECTOR Y DESINTOXICANTE HEPÁTICO
              </span>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1b3320] leading-tight">
                Cardo Mariano 80% Silimarina con Inositol y Cúrcuma (90 Cápsulas)
              </h1>
              <p className="text-xs text-[#574f45] leading-relaxed">
                Extracto puro estandarizado de 300 mg para descongestionar el hígado graso, desinflamar el abdomen y depurar toxinas de forma natural.
              </p>
            </div>

            {/* Micro-beneficios (4 Puntos Clave) */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-[#332e27] bg-[#f5f1eb] p-2.5 rounded-xl border border-[#e5decfa3]">
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Desinflama abdomen pesado</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Limpia toxinas hepáticas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>1 cápsula al día (90 días)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-emerald-700 font-bold">✓</span>
                <span>Despacho seguro por Tealca</span>
              </div>
            </div>

            {/* Selector de Paquetes */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[#38322a]">
                  Selecciona tu tratamiento:
                </span>
                <span className="font-semibold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md text-[10px]">
                  Pagas al Recibir en Mano
                </span>
              </div>

              <div className="space-y-2">
                {PACK_OPTIONS.map((pack) => {
                  const isSelected = selectedPack.id === pack.id;
                  return (
                    <div
                      key={pack.id}
                      onClick={() => setSelectedPack(pack)}
                      className={`relative cursor-pointer rounded-xl p-3 transition-all border-2 ${
                        isSelected
                          ? "border-[#1b3320] bg-white shadow-xs ring-1 ring-[#1b3320]/15"
                          : "border-[#e6ded2] bg-[#fbfaf8] hover:border-[#cfc6b8]"
                      }`}
                    >
                      {pack.recommended && (
                        <div 
                          style={{ color: "#ffffff", backgroundColor: "#1b3320" }} 
                          className="absolute -top-2.5 right-3 !text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs"
                        >
                          {pack.badge}
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected ? "border-[#1b3320] bg-[#1b3320]" : "border-[#a89e90] bg-white"
                            }`}
                          >
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-xs sm:text-sm text-[#1e1a17] leading-snug">{pack.title}</span>
                              <span className="text-[10px] text-[#2c5232] font-semibold bg-[#eaf2e8] px-1.5 py-0.2 rounded shrink-0">
                                {pack.savings}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#6e6457] leading-tight mt-0.5">{pack.subtitle}</p>
                          </div>
                        </div>

                        <div className="text-right shrink-0 pl-1">
                          <div className="text-sm sm:text-base font-bold text-[#1b3320] whitespace-nowrap">
                            ${pack.price.toFixed(2)} <span className="text-[10px] font-normal text-[#756a5c]">USD</span>
                          </div>
                          <span className="text-[10px] text-[#8c8273] line-through block leading-none">
                            ${pack.originalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-[#f0ebd2] flex justify-between items-center text-[10px] text-[#635b51]">
                        <span className="text-emerald-800 font-medium">✓ {pack.shipping}</span>
                        <span>{pack.dailyCost}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOTÓN PRINCIPAL DE COMPRA (Alto contraste: Blanco puro sobre verde bosque) */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => openCheckout()}
                style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
                className="w-full hover:bg-[#132617] active:scale-[0.98] animate-cta-shimmer !text-white text-sm md:text-base font-bold py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span style={{ color: "#ffffff" }} className="!text-white font-bold tracking-wide">
                  PEDIR AHORA – PAGO AL RECIBIR
                </span>
                <span className="text-base">📦</span>
              </button>

              {/* Sellos de Confianza Rápidos */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#524b42] text-center flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> No pagas ahora
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> Un operador te contactará
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> Envíos por Tealca
                </span>
              </div>
            </div>

            {/* Respaldo de Doctora Especialista */}
            <div className="border border-[#e2d8ca] bg-white rounded-xl p-3 flex gap-3 items-center shadow-2xs">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-[#1b3320]/20">
                <Image
                  src="/doctora/doctora_venezolana_sentada.jpg"
                  alt="Dra. Especialista en Salud Hepática"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-[#524b40] space-y-0.5">
                <span className="font-bold text-[#1b3320] block text-xs">
                  Criterio Médico Especializado:
                </span>
                <p className="italic leading-snug text-[11px]">
                  «El 80% de los pacientes que sienten pesadez constante o vientre abultado tras comer tienen congestión biliar. La Silimarina pura al 80% estimula la síntesis de los hepatocitos para acelerar la eliminación de toxinas.»
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* 4. SECCIÓN: ATACAR LOS DOLORES (Sin huecos verticales vacíos) */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              ¿TU CUERPO TE ESTÁ ENVIANDO ESTAS SEÑALES?
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              No es cansancio común: Tu hígado te está pidiendo auxilio
            </h2>
            <p className="text-xs text-[#675f54]">
              Cuando el hígado se sobrecarga con grasas y toxinas, estos son los síntomas directos:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                icon: "🎈",
                title: "Abdomen Inflamado como Tambor",
                desc: "Comes algo ligero y a los 20 minutos tu vientre se distiende y sientes pesadez estomacal por bilis espesa."
              },
              {
                icon: "🥱",
                title: "Fatiga Crónica al Despertar",
                desc: "Duermes 8 horas pero te levantas con agotamiento. Ocurre cuando el hígado no logra filtrar toxinas de noche."
              },
              {
                icon: "🔥",
                title: "Digestión Lenta y Reflujo",
                desc: "Comidas con condimentos o grasas que quedan estancadas durante horas con sensación de ardor o acidez."
              },
              {
                icon: "🥂",
                title: "Resaca y Malestar Prolongado",
                desc: "Cualquier salida o comida fuera de la rutina te deja días con pesadez por la saturación de enzimas depurativas."
              }
            ].map((pain, i) => (
              <div 
                key={i} 
                className="bg-[#faf8f5] rounded-xl p-3 border border-[#ebe4d8] space-y-1"
              >
                <span className="text-xl block">{pain.icon}</span>
                <h3 className="font-bold text-xs text-[#1e1a17]">{pain.title}</h3>
                <p className="text-[11px] text-[#61594f] leading-snug">{pain.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#f2eee7] rounded-xl p-3 border border-[#dfd6c8] text-center space-y-1 max-w-2xl mx-auto">
            <h4 className="font-bold text-xs text-[#1b3320]">
              ¿Por qué los tés o infusiones caseras no lo solucionan?
            </h4>
            <p className="text-[11px] text-[#524b41] leading-relaxed">
              La <strong>Silimarina</strong> es el principio activo terapéutico del cardo mariano, pero <strong>no es soluble en agua</strong>. Una infusión casera apenas extrae un 2% del activo. OxyEnergy te entrega <strong>300 mg de extracto estandarizado al 80% de pureza</strong> en cápsulas vegetales para absorción celular directa.
            </p>
          </div>
        </section>

        {/* 5. SECCIÓN: MODO DE USO Y RESULTADOS */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              GUÍA MÉDICA DE USO
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              Modo de Uso: 1 Sola Cápsula al Día
            </h2>
            <p className="text-xs text-[#675f54]">
              Sencillo, diario y diseñado para no irritar tu sistema digestivo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">1 Cápsula Diaria</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Dosis clínica concentrada (300 mg al 80% Silimarina). Sin batidos amargos ni horarios difíciles.
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">Con Desayuno o Almuerzo</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Tómala junto a tu comida principal con un vaso de agua para máxima asimilación biliar.
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">90 Días por Frasco</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Cada frasco contiene 90 cápsulas vegetales. 3 meses enteros de protección hepática continua.
              </p>
            </div>
          </div>

          {/* Timeline de Resultados */}
          <div className="bg-[#f8f5ee] rounded-xl p-3.5 border border-[#e6ded2] text-xs space-y-2">
            <h4 className="font-bold text-xs text-[#1b3320] text-center">
              Evolución progresiva semana a semana:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[#524b41]">
              <div className="border-l-2 border-emerald-600 pl-2.5 space-y-0.5">
                <span className="font-bold text-[#1b3320] block text-xs">Semana 1: Alivio Abdominal</span>
                <p className="text-[11px]">Disminuye la distensión después de comer y la pesadez en el estómago.</p>
              </div>
              <div className="border-l-2 border-emerald-600 pl-2.5 space-y-0.5">
                <span className="font-bold text-[#1b3320] block text-xs">Semanas 2 a 4: Energía Matutina</span>
                <p className="text-[11px]">Mejor filtrado nocturno de toxinas. Te despiertas con mayor claridad y agilidad.</p>
              </div>
              <div className="border-l-2 border-emerald-600 pl-2.5 space-y-0.5">
                <span className="font-bold text-[#1b3320] block text-xs">Meses 2 y 3: Regeneración Hepática</span>
                <p className="text-[11px]">Descongestión biliar sostenida, metabolismo de grasas optimizado y piel más limpia.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. SECCIÓN: TRANSPARENCIA BOTÁNICA - 6 INGREDIENTES */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              FÓRMULA CLÍNICA COMPLETA
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              Los 6 Ingredientes Bioactivos de OxyEnergy
            </h2>
            <p className="text-xs text-[#675f54]">
              Fórmula limpia, 100% vegetariana, no transgénica y libre de gluten.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {[
              {
                name: "Cardo Mariano (Silimarina 80%)",
                amount: "300 mg",
                role: "Desintoxicante Primario",
                desc: "Estimula la regeneración del tejido hepático y protege las células contra toxinas y radicales libres."
              },
              {
                name: "Inositol",
                amount: "200 mg",
                role: "Metabolismo de Grasas",
                desc: "Facilita la descomposición de los lípidos en el hígado, previniendo la acumulación de grasa visceral."
              },
              {
                name: "Extracto de Pueraria Mirifica",
                amount: "68 mg",
                role: "Antioxidante Celular",
                desc: "Fitoestrógenos vegetales que equilibran la respuesta inflamatoria y favorecen la vitalidad."
              },
              {
                name: "Cúrcuma Orgánica",
                amount: "4 mg",
                role: "Desinflamación Biliar",
                desc: "Estimula la vesícula para un flujo biliar fluido, acelerando la digestión de comidas densas."
              },
              {
                name: "L-Metionina",
                amount: "10 mg",
                role: "Aminoácido Protector",
                desc: "Aminoácido esencial que ayuda a neutralizar sustancias nocivas en los hepatocitos."
              },
              {
                name: "Vitamina C Pura",
                amount: "10 mg",
                role: "Refuerzo Inmunológico",
                desc: "Antioxidante clave que optimiza la asimilación de los bioflavonoides de la silimarina."
              }
            ].map((ing, i) => (
              <div 
                key={i} 
                className="bg-[#faf8f5] rounded-xl p-3 border border-[#eae2d5] space-y-1"
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-xs text-[#1e1a17]">{ing.name}</h3>
                  <span className="text-[10px] font-bold text-[#1b3320] bg-[#eaf4e8] px-1.5 py-0.5 rounded">
                    {ing.amount}
                  </span>
                </div>
                <span className="text-[9px] font-semibold text-[#6e6354] uppercase tracking-wide block">
                  {ing.role}
                </span>
                <p className="text-[11px] text-[#61594f] leading-snug">{ing.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 7. SECCIÓN: CÓMO FUNCIONA TU PEDIDO POR TEALCA */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-4">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              TRANSPARENCIA TOTAL
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              ¿Cómo Funciona tu Pedido Contra Entrega?
            </h2>
            <p className="text-xs text-[#675f54]">
              Proceso 100% seguro para que nunca arriesgues tu dinero.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="text-2xl">📝</div>
              <h3 className="font-bold text-xs text-[#1b3320]">1. Llenas tus Datos</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Eliges tu combo y completas nombre, teléfono y dirección. <strong>No necesitas tarjeta ni anticipos.</strong>
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="text-2xl">📞</div>
              <h3 className="font-bold text-xs text-[#1b3320]">2. Te Contacta un Operador</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Un operador de nuestro equipo te contactará por WhatsApp en minutos para validar tu dirección o agencia Tealca.
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="text-2xl">📦</div>
              <h3 className="font-bold text-xs text-[#1b3320]">3. Recibes por Tealca y Pagas</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Recibes tu paquete en mano o en tu oficina Tealca. Cancelas en <strong>Efectivo ($), Pago Móvil o Binance</strong>.
              </p>
            </div>
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => openCheckout()}
              style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
              className="hover:bg-[#132617] active:scale-[0.98] animate-cta-shimmer !text-white text-xs md:text-sm font-bold py-3 px-6 rounded-full shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span style={{ color: "#ffffff" }} className="!text-white font-bold tracking-wide">
                SOLICITAR PEDIDO CON PAGO AL RECIBIR
              </span>
              <span style={{ color: "#ffffff" }}>→</span>
            </button>
          </div>
        </section>

        {/* 8. SECCIÓN: PREGUNTAS FRECUENTES (FAQ Acordeón) */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-3">
          <div className="text-center max-w-xl mx-auto space-y-1 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              RESOLVEMOS TUS DUDAS
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="space-y-2 max-w-2xl mx-auto">
            {[
              {
                q: "¿Cómo es el pago si es Contra Entrega en Venezuela?",
                a: "No tienes que pagar nada al solicitar en la web. Cuando tu paquete llegue a tu dirección o a la oficina Tealca seleccionada, le cancelas directamente al repartidor o transfieres por Pago Móvil o Binance en ese mismo instante."
              },
              {
                q: "¿Qué métodos de pago aceptan al recibir?",
                a: "Aceptamos Dólares en Efectivo ($), Pago Móvil en Bolívares a tasa oficial, o Binance USDT. Puedes acordar la opción con nuestro operador cuando te contacte."
              },
              {
                q: "¿Cuánto dura un frasco y cómo se toma?",
                a: "Cada frasco contiene 90 cápsulas vegetales. Tomando 1 cápsula al día con un vaso de agua en el desayuno o almuerzo, un solo frasco te rinde 3 meses completos de tratamiento."
              },
              {
                q: "¿Tiene contraindicaciones o produce efectos secundarios?",
                a: "OxyEnergy está formulado con extractos botánicos limpios, libres de gluten y aptos para vegetarianos. No produce diarrea ni malestar estomacal. Si estás embarazada o bajo medicación hepática severa, te recomendamos consultarlo con tu médico."
              },
              {
                q: "¿Cuánto tiempo tarda la entrega por Tealca?",
                a: "En Caracas el despacho puede llegar en 24 horas. Para el resto de los estados (Maracaibo, Valencia, Barquisimeto, Oriente, Táchira, etc.), la entrega suele demorar entre 24 y 48 horas hábiles con número de guía Tealca rastreable."
              }
            ].map((faq, i) => (
              <div key={i} className="bg-[#faf8f5] rounded-xl border border-[#ebe4d8] overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left p-3.5 flex justify-between items-center gap-3 hover:bg-[#f5f0e6] transition-colors cursor-pointer"
                >
                  <span className="font-bold text-xs md:text-sm text-[#1e1a17]">{faq.q}</span>
                  <span className={`text-base font-bold transition-transform duration-200 ${openFaq === i ? "rotate-45 text-emerald-800" : "rotate-0 text-[#1b3320]"}`}>+</span>
                </button>
                {openFaq === i && (
                  <div className="px-3.5 pb-3 text-xs text-[#574e43] leading-relaxed border-t border-[#ebe4d8] pt-2">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* 9. FOOTER MINIMALISTA */}
      <footer className="mt-12 bg-[#1b3320] text-[#e8e2d8] text-xs py-6 px-4 border-t border-[#294a2f]">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left">
          <div className="space-y-0.5">
            <span className="text-sm font-serif font-bold text-white tracking-wide">
              OXYENERGY BOTANICAL CLINIC
            </span>
            <p className="text-[11px] text-[#b6ab9a]">
              Suplementos botánicos certificados • Despachos garantizados a toda Venezuela por Tealca.
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-white">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, necesito atención al cliente sobre OxyEnergy.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-300 font-medium underline"
            >
              Atención por WhatsApp
            </a>
            <span>•</span>
            <span>Pago Contra Entrega por Tealca</span>
          </div>
        </div>
      </footer>

      {/* 10. BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tengo dudas sobre el Cardo Mariano OxyEnergy antes de ordenar.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atención al cliente por WhatsApp"
        className="fixed bottom-20 md:bottom-6 right-4 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 rounded-full shadow-lg transition-transform hover:scale-105 flex items-center gap-2"
      >
        <span className="text-lg">💬</span>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          ¿Dudas? Escríbenos
        </span>
      </a>

      {/* 11. BARRA FLOTANTE MÓVIL (DOCK DE CONVERSIÓN CON SAFE AREA) */}
      {showStickyBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#ded6c8] p-2.5 px-4 flex items-center justify-between gap-3 shadow-lg md:hidden safe-bottom-dock">
          <div>
            <div className="text-[10px] text-[#71675a] font-medium leading-none">
              {selectedPack.title.split("(")[0]}
            </div>
            <div className="text-sm font-bold text-[#1b3320]">
              ${selectedPack.price.toFixed(2)} USD
            </div>
          </div>
          <button
            onClick={() => openCheckout()}
            style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
            className="hover:bg-[#132617] active:scale-95 animate-cta-shimmer !text-white text-xs font-bold py-2.5 px-5 rounded-full shadow-md flex items-center gap-1 cursor-pointer"
          >
            <span style={{ color: "#ffffff" }} className="!text-white font-bold">
              Pedir al Recibir
            </span>
            <span style={{ color: "#ffffff" }}>→</span>
          </button>
        </div>
      )}

      {/* 12. MODAL CHECKOUT EXPRESS CONTRA ENTREGA (TEALCA) */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#faf8f5] w-full max-w-lg rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-[#ded5c7] max-h-[92vh] flex flex-col">
            
            {/* Header del Modal */}
            <div className="bg-[#1b3320] text-white p-3.5 px-5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-bold text-sm md:text-base text-white">Solicitud de Pedido Contra Entrega</h3>
                <p className="text-[11px] text-[#cddccb]">No pagas ahora • Pagas al recibir en mano por Tealca</p>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="text-white/80 hover:text-white text-xl p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-4 overflow-y-auto space-y-3">
              
              {/* Resumen del Combo */}
              <div className="bg-white p-3 rounded-xl border border-[#e2d8ca] flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-[#1e1a17] block">{selectedPack.title}</span>
                  <span className="text-[#695f52]">{selectedPack.subtitle}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm md:text-base font-bold text-[#1b3320] block">
                    ${selectedPack.price.toFixed(2)} USD
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    {selectedPack.shipping}
                  </span>
                </div>
              </div>

              {/* Mensaje de Seguridad */}
              <div className="bg-[#f2eee7] rounded-xl p-2.5 border border-[#ded5c7] flex items-start gap-2 text-xs text-[#4e463d]">
                <span className="text-base leading-none">🛡️</span>
                <div>
                  <strong className="text-[#1b3320] block">Cero riesgo para ti:</strong>
                  <span>Tus datos solo se usan para el despacho por Tealca. Un operador te contactará en minutos por WhatsApp o llamada para confirmar antes del envío.</span>
                </div>
              </div>

              {/* Formulario */}
              <form onSubmit={handleFormSubmit} className="space-y-2.5 text-left">
                <div>
                  <label className="text-xs font-bold text-[#3d372e] block mb-1">
                    Nombre y Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6ccbd] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1b3320]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#3d372e] block mb-1">
                    Número de WhatsApp (donde te llamará el operador) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Ej. 0414 123 4567 o 0424..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6ccbd] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1b3320]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#3d372e] block mb-1">
                    Estado de Entrega *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    onWheel={(e) => e.currentTarget.blur()}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6ccbd] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1b3320] cursor-pointer"
                  >
                    {VENEZUELA_STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  {/* Badge de confirmación */}
                  <div className="mt-1 flex items-center justify-between text-[11px] text-[#224b27] bg-[#eef7ec] px-2 py-0.5 rounded-lg border border-[#cbe5c8]">
                    <span>📍 Estado confirmado:</span>
                    <strong className="font-bold">{formData.state.split("(")[0].trim()}</strong>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#3d372e] block mb-1">
                    Ciudad y Dirección de Entrega (o Agencia Tealca más cercana) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Ej. Caracas, El Cafetal, Calle 3, Res. Los Pinos o Agencia Tealca más cercana"
                    value={formData.cityAddress}
                    onChange={(e) => setFormData({ ...formData, cityAddress: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#d6ccbd] bg-white text-sm focus:outline-hidden focus:ring-2 focus:ring-[#1b3320]"
                  />
                </div>

                {/* Forma de Pago al Recibir */}
                <div className="bg-[#f0ebe2] p-2.5 rounded-xl space-y-1.5 border border-[#ded5c7]">
                  <label className="text-xs font-bold text-[#3d372e] block">
                    ¿Cómo prefieres pagar cuando tengas el producto en mano?:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: "efectivo_divisas", label: "💵 Dólares Efectivo" },
                      { id: "pagomovil", label: "📲 Pago Móvil (Bs)" },
                      { id: "binance_usdt", label: "🟡 Binance USDT" }
                    ].map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setFormData({ ...formData, paymentMethod: opt.id })}
                        style={
                          formData.paymentMethod === opt.id
                            ? { color: "#ffffff", backgroundColor: "#1b3320" }
                            : {}
                        }
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer text-[11px] ${
                          formData.paymentMethod === opt.id
                            ? "!text-white border-[#1b3320] font-bold"
                            : "bg-white text-[#4d463d] border-[#d8cfbe]"
                        }`}
                      >
                        <span style={formData.paymentMethod === opt.id ? { color: "#ffffff" } : {}}>
                          {opt.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {errorMessage && (
                  <div className="p-2 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200">
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formStatus === "submitting"}
                  style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
                  className="w-full hover:bg-[#132617] disabled:opacity-70 !text-white font-bold py-3.5 px-5 rounded-xl shadow-md transition-all text-sm md:text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  {formStatus === "submitting" ? (
                    <span style={{ color: "#ffffff" }}>Procesando pedido...</span>
                  ) : (
                    <>
                      <span style={{ color: "#ffffff" }} className="!text-white font-bold">
                        CONFIRMAR PEDIDO (PAGO AL RECIBIR)
                      </span>
                      <span style={{ color: "#ffffff" }}>✓</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-[10px] text-center text-[#857c6f]">
                🔒 Cero riesgo. Te escribiremos a WhatsApp en minutos para validar tu dirección antes de entregar a Tealca.
              </p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
