"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

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
    subtitle: "Tratamiento Completo de 6 Meses • 2do Frasco con 50% OFF",
    price: 29.99,
    originalPrice: 40.00,
    savings: "2do Frasco al 50% OFF (Ahorras $10.01)",
    shipping: "ENVÍO GRATIS POR TEALCA A TODA VENEZUELA",
    recommended: true,
    badge: "🔥 2DO FRASCO AL 50% DE DESCUENTO • MÁS ELEGIDO",
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
    savings: "Pagas 2 y el 3ero casi de regalo (Ahorras $20.01)",
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

  // Pop-up 50% OFF en 2do frasco y Modales Legales
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [hasShownDiscountModal, setHasShownDiscountModal] = useState(false);
  const [activeLegalModal, setActiveLegalModal] = useState<"terms" | "disclaimer" | "shipping" | "guide" | null>(null);

  // Pop-up con el 50% de descuento en la 2da unidad (Exit-intent en PC y Timer de 24s en móvil)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !hasShownDiscountModal && !isCheckoutOpen) {
        setShowDiscountModal(true);
        setHasShownDiscountModal(true);
      }
    };

    // Timer de cortesía a los 5 segundos con animación suave
    const timer = setTimeout(() => {
      if (!hasShownDiscountModal && !isCheckoutOpen) {
        setShowDiscountModal(true);
        setHasShownDiscountModal(true);
      }
    }, 5000);

    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mouseleave", handleMouseLeave);
      clearTimeout(timer);
    };
  }, [hasShownDiscountModal, isCheckoutOpen]);

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

  const ctaButtonRef = useRef<HTMLDivElement>(null);

  // Sticky bar inteligente: solo se activa cuando el botón principal de compra sale de la pantalla hacia arriba
  useEffect(() => {
    const handleScroll = () => {
      if (!ctaButtonRef.current) return;
      const rect = ctaButtonRef.current.getBoundingClientRect();
      // Si el botón principal ya pasó por encima del viewport (rect.bottom < 0)
      if (rect.bottom < 0) {
        setShowStickyBar(true);
      } else {
        setShowStickyBar(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Evento Canonico Meta Pixel: ViewContent al entrar a la landing del producto
  useEffect(() => {
    if (typeof window !== "undefined" && (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq) {
      (window as unknown as { fbq: (...args: unknown[]) => void }).fbq("track", "ViewContent", {
        content_name: "OxyEnergy Cardo Mariano 80% Silimarina",
        content_category: "Salud Hepatica y Digestiva",
        content_ids: ["cardo_mariano_90cap"],
        value: 29.99,
        currency: "USD"
      });
    }
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

      {/* 2. Cabecera Minimalista (Sin botón de pedir invasivo al inicio) */}
      <header className="sticky top-0 z-40 bg-[#faf8f5]/95 backdrop-blur-md border-b border-[#eae3d7]">
        <div className="max-w-5xl mx-auto px-4 h-14 md:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl sm:text-2xl font-serif font-bold tracking-tight text-[#1b3320]">
              OXYENERGY<span className="text-emerald-700">.</span>
            </span>
            <span className="hidden md:inline-block text-[11px] text-[#736a5f] border-l border-[#dcd3c5] pl-3 tracking-widest uppercase">
              Laboratorio Botánico Clínico
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#2f5536] font-medium bg-[#eef5ee] border border-[#d2e4d0] px-3 py-1 rounded-full">
              <span>🚚</span>
              <span>Pagas al Recibir por Tealca</span>
            </div>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tengo dudas sobre el Cardo Mariano OxyEnergy antes de ordenar.")}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atención por WhatsApp"
              className="text-xs font-semibold text-[#1f3823] hover:text-[#325938] flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#d8cfbf] hover:bg-[#f1ebe0] transition-colors"
            >
              <span>💬</span>
              <span className="text-xs font-medium">WhatsApp</span>
            </a>
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

            {/* 4 Miniaturas Limpias */}
            <div className="grid grid-cols-4 gap-1.5 md:gap-2">
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
          </div>

          {/* Columna Derecha: Información Esencial, Selección y Compra */}
          <div className="md:col-span-6 space-y-4">
            
            {/* Título & Valoración */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-medium text-[#6b6255]">
                <div className="flex text-amber-500 text-xs">★★★★★</div>
                <span className="font-bold text-[#2d2925]">4.9</span>
                <span>•</span>
                <span className="text-[#665e52]">+1,280 opiniones en Venezuela</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2f5c36] block">
                FÓRMULA HEPÁTICA • 80% SILIMARINA PURA
              </span>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-[#1b3320] leading-tight">
                Cardo Mariano con Inositol y Cúrcuma (90 Cápsulas)
              </h1>
              <p className="text-xs text-[#5a5247] leading-relaxed">
                Extracto botánico estandarizado de 300 mg para descongestionar el hígado graso, eliminar la pesadez estomacal y regenerar células hepáticas.
              </p>
            </div>

            {/* 3 Beneficios Clave (Diseño limpio y espacioso) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-[#332e27]">
              <div className="flex items-center gap-2 bg-[#f4efe8] p-2 rounded-lg border border-[#e8dfd2]">
                <span className="text-emerald-700 font-bold text-sm">✓</span>
                <span className="text-[11px] leading-tight font-medium">Desinflama vientre y pesadez</span>
              </div>
              <div className="flex items-center gap-2 bg-[#f4efe8] p-2 rounded-lg border border-[#e8dfd2]">
                <span className="text-emerald-700 font-bold text-sm">✓</span>
                <span className="text-[11px] leading-tight font-medium">Depura grasa y toxinas</span>
              </div>
              <div className="flex items-center gap-2 bg-[#f4efe8] p-2 rounded-lg border border-[#e8dfd2]">
                <span className="text-emerald-700 font-bold text-sm">✓</span>
                <span className="text-[11px] leading-tight font-medium">1 cápsula al día (90 dosis)</span>
              </div>
            </div>

            {/* Selector de Paquetes */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-[#38322a] text-[11px]">
                  Elige tu tratamiento:
                </span>
                <span className="font-semibold text-emerald-800 bg-[#e7f2e5] border border-[#cbe3c8] px-2 py-0.5 rounded-full text-[10px]">
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
                        <div className="flex items-start gap-2.5 min-w-0">
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

            {/* BOTÓN PRINCIPAL DE COMPRA (Ubicación lógica: justo después de elegir el combo) */}
            <div ref={ctaButtonRef} className="space-y-2 pt-1">
              <button
                onClick={() => openCheckout()}
                style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
                className="w-full hover:bg-[#132617] active:scale-[0.98] animate-cta-shimmer !text-white text-sm md:text-base font-bold py-3.5 px-5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span style={{ color: "#ffffff" }} className="!text-white font-bold tracking-wide">
                  PEDIR CON PAGO AL RECIBIR
                </span>
                <span className="text-base">📦</span>
              </button>

              {/* Sellos de Confianza Rápidos */}
              <div className="flex items-center justify-center gap-3 text-[11px] text-[#524b42] text-center flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> Pagas solo al recibir en mano
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> Validación previa por WhatsApp
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-emerald-700 font-bold">✓</span> Envíos por Tealca
                </span>
              </div>
            </div>

            {/* Respaldo de Doctora Especialista */}
            <div className="border border-[#e2d8ca] bg-white rounded-xl p-3 flex gap-3 items-center shadow-2xs">
              <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border-2 border-[#1b3320]/20">
                <Image
                  src="/doctora/doctora_venezolana_sentada.jpg"
                  alt="Dra. Especialista en Salud Hepática"
                  fill
                  sizes="44px"
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-[#524b40] space-y-0.5">
                <span className="font-bold text-[#1b3320] block text-xs">
                  Criterio Médico Especializado:
                </span>
                <p className="italic leading-snug text-[11px]">
                  «El 80% de las personas que sienten pesadez constante o abdomen abultado tienen sobrecarga biliar. La Silimarina pura al 80% estimula la regeneración hepática y la eliminación de toxinas.»
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

        {/* 5. SECCIÓN: GUÍA CLÍNICA DE USO, TIEMPO DE EFECTO Y HONESTIDAD MÉDICA */}
        <section className="bg-white rounded-2xl p-4 md:p-6 border border-[#e8e1d5] shadow-xs space-y-5">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#2e5934]">
              TRANSPARENCIA Y PROTOCOLO MÉDICO
            </span>
            <h2 className="text-lg md:text-xl font-serif font-bold text-[#1b3320]">
              Guía de Uso: 1 Cápsula Diaria y Expectativas Reales
            </h2>
            <p className="text-xs text-[#675f54]">
              Protocolo botánico seguro, progresivo y diseñado para resultados duraderos sin efecto rebote.
            </p>
          </div>

          {/* Bloque de Honestidad Clínica: El producto NO actúa de inmediato */}
          <div className="bg-[#fcf8f0] border-l-4 border-amber-600 p-3.5 sm:p-4 rounded-xl space-y-2 text-xs text-[#4a4136]">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <span className="text-base">⚠️</span>
              <span>Honestidad Clínica: El Cardo Mariano NO hace efecto de la noche a la mañana</span>
            </div>
            <p className="leading-relaxed text-[11px] sm:text-xs text-[#554b3e]">
              El hígado graso y la congestión biliar se desarrollaron durante meses o años por malos hábitos y toxinas acumuladas. La <strong>Silimarina activa pura al 80%</strong> no es un laxante instantáneo ni un fármaco químico agresivo: actúa a nivel celular estimulando la síntesis de proteínas para <strong>reconstruir y regenerar los hepatocitos</strong>. Por este motivo, los beneficios son <strong>progresivos y acumulativos</strong>.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-[11px]">
              <div className="bg-white/90 p-2.5 rounded-lg border border-[#e8dfcf] space-y-0.5">
                <strong className="block text-[#1b3320]">Días 1 a 14 (Alivio Digestivo):</strong>
                <p className="text-[#635b50] leading-snug">Disminuye la pesadez tras comer, reduce los gases y desinflama el vientre abultado.</p>
              </div>
              <div className="bg-white/90 p-2.5 rounded-lg border border-[#e8dfcf] space-y-0.5">
                <strong className="block text-[#1b3320]">Días 15 a 45 (Filtrado Biliar):</strong>
                <p className="text-[#635b50] leading-snug">El flujo de bilis se descongestiona. Despiertas con más energía y mayor claridad mental.</p>
              </div>
              <div className="bg-white/90 p-2.5 rounded-lg border border-[#e8dfcf] space-y-0.5">
                <strong className="block text-[#1b3320]">Meses 2 a 6 (Regeneración Hepática):</strong>
                <p className="text-[#635b50] leading-snug">Metabolismo de grasas normalizado y limpieza profunda. <em>Por eso se recomienda el tratamiento de 2 frascos (6 meses)</em>.</p>
              </div>
            </div>
          </div>

          {/* 3 Pasos del Protocolo de Uso */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                1
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">1 Sola Cápsula al Día</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Dosis clínica concentrada (300 mg al 80% Silimarina). Suficiente para 24 horas continuas de protección celular.
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                2
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">Con Desayuno o Almuerzo</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Tómala junto a una comida con un vaso de agua completo (250 ml). La presencia de alimentos activa el vaciamiento biliar y facilita su absorción.
              </p>
            </div>

            <div className="bg-[#faf8f5] rounded-xl p-3.5 border border-[#eae2d5] text-center space-y-1">
              <div className="w-8 h-8 mx-auto rounded-full bg-[#eef5ed] text-[#1b3320] font-bold text-xs flex items-center justify-center">
                3
              </div>
              <h3 className="font-bold text-xs text-[#1e1a17]">Hidratación de Apoyo</h3>
              <p className="text-[11px] text-[#61594f] leading-snug">
                Toma al menos 2 litros de agua durante el día. El agua es el vehículo necesario para que tus riñones eliminen las toxinas que el hígado va liberando.
              </p>
            </div>
          </div>

          {/* Qué evitar durante el tratamiento */}
          <div className="bg-[#faf8f5] rounded-xl p-3 border border-[#ebe3d6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#524a3f]">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="font-bold text-[#1b3320] block">Pautas para maximizar tu inversión:</span>
              <p className="text-[11px] text-[#696155]">
                Modera el consumo de bebidas alcohólicas y alimentos ultraprocesados para no sobrecargar el hígado mientras la silimarina hace su trabajo regenerador.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveLegalModal("guide")}
              className="text-[11px] font-bold text-[#1b3320] bg-white border border-[#cfc4b2] px-3 py-1.5 rounded-lg hover:bg-[#f2ece1] transition-colors shrink-0 cursor-pointer"
            >
              Ver Guía Completa de Uso 📄
            </button>
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

      {/* 9. FOOTER CON MARCO LEGAL, TÉRMINOS Y DESCARGO MÉDICO */}
      <footer className="mt-12 bg-[#1b3320] text-[#e8e2d8] text-xs py-8 px-4 border-t border-[#294a2f] space-y-5">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left border-b border-[#294a2f] pb-6">
          <div className="space-y-1">
            <span className="text-sm font-serif font-bold text-white tracking-wide block">
              OXYENERGY BOTANICAL CLINIC VENEZUELA
            </span>
            <p className="text-[11px] text-[#b6ab9a]">
              Suplementos botánicos estandarizados bajo normas GMP • Despacho garantizado por Tealca.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white">
            <button
              type="button"
              onClick={() => setActiveLegalModal("disclaimer")}
              className="text-[#cde4cb] hover:text-white underline cursor-pointer text-[11px]"
            >
              Aviso Médico Legal
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal("terms")}
              className="text-[#cde4cb] hover:text-white underline cursor-pointer text-[11px]"
            >
              Términos de Compra
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => setActiveLegalModal("shipping")}
              className="text-[#cde4cb] hover:text-white underline cursor-pointer text-[11px]"
            >
              Políticas de Envío Tealca
            </button>
            <span>•</span>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, necesito atención al cliente sobre OxyEnergy.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:text-emerald-300 font-semibold underline text-[11px]"
            >
              Soporte WhatsApp
            </a>
          </div>
        </div>

        {/* Descargo de Responsabilidad Médica Canónico */}
        <div className="max-w-5xl mx-auto space-y-2 text-[10px] text-[#938a7c] leading-relaxed">
          <p>
            <strong>Descargo de Responsabilidad Médica:</strong> Las afirmaciones sobre este extracto botánico de Cardo Mariano (80% Silimarina) no han sido evaluadas por la FDA ni por el Instituto Nacional de Higiene como medicamento curativo. Este producto es un suplemento nutricional coadyuvante y no pretende diagnosticar, tratar, mitigar ni curar ninguna patología grave de forma aislada. Los resultados pueden variar según el metabolismo y adherencia de cada persona.
          </p>
          <p>
            <strong>Contraindicaciones:</strong> No utilizar en mujeres embarazadas, en período de lactancia ni en menores de 18 años sin supervisión de un médico especialista. En caso de padecer obstrucción biliar grave o alergia a plantas de la familia Asteraceae, consulte previamente a su gastroenterólogo.
          </p>
          <p className="text-center md:text-left text-[#7e7669] pt-2">
            © {new Date().getFullYear()} OxyEnergy Venezuela. Despachos realizados a través de la red oficial de encomiendas Tealca en modalidad Pago Contra Entrega.
          </p>
        </div>
      </footer>

      {/* 10. BOTÓN FLOTANTE DE WHATSAPP */}
      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hola, tengo dudas sobre el Cardo Mariano OxyEnergy antes de ordenar.")}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Atención al cliente por WhatsApp"
        className={`fixed right-4 z-40 bg-[#25D366] hover:bg-[#20ba59] text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
          showStickyBar ? "bottom-20" : "bottom-6"
        }`}
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

      {/* 13. POP-UP DE CORTESÍA: 50% DE DESCUENTO EN EL 2DO FRASCO (Aparición suave a los 5s) */}
      {showDiscountModal && !isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-backdrop-fade">
          <div className="bg-[#faf8f5] w-full max-w-md rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-700/30 p-5 space-y-4 relative animate-modal-pop">
            <button
              onClick={() => setShowDiscountModal(false)}
              className="absolute top-3 right-3 text-[#7a7164] hover:text-[#221e1a] text-lg font-bold w-8 h-8 rounded-full bg-[#eee7db] flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>

            <div className="text-center space-y-1.5 pt-1">
              <span className="inline-block bg-[#eef7ec] text-[#1c4521] border border-[#cbe6c8] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                🎁 OFERTA ESPECIAL DE CORTESÍA
              </span>
              <h3 className="text-lg md:text-xl font-serif font-bold text-[#1b3320] leading-tight">
                ¡Llévate tu 2do Frasco con 50% de Descuento!
              </h3>
              <p className="text-xs text-[#5e564b] leading-relaxed">
                El hígado no se descongestiona de un día para otro. Los especialistas recomiendan <strong>6 meses continuos</strong> para regenerar el tejido hepático y evitar recaídas.
              </p>
            </div>

            {/* Tarjeta de la Oferta */}
            <div className="bg-white p-3.5 rounded-xl border-2 border-[#1b3320] shadow-xs space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-xs sm:text-sm text-[#1e1a17] block">
                    Tratamiento Completo (2 Frascos)
                  </span>
                  <span className="text-[11px] text-emerald-800 font-semibold">
                    180 Cápsulas • 6 Meses de Protección
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold text-[#1b3320] block">
                    $29.99 USD
                  </span>
                  <span className="text-[11px] text-[#8c8273] line-through block">
                    $40.00 USD
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#f0ebd2] space-y-1 text-[11px] text-[#4d453b]">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>2do Frasco al 50% OFF</strong> ($10 en vez de $20)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Envío 100% GRATIS</strong> por Tealca a toda Venezuela</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-700 font-bold">✓</span>
                  <span><strong>Pagas al recibir en mano</strong> (Efectivo $ o Pago Móvil)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setSelectedPack(PACK_OPTIONS[0]); // Combo 2 frascos
                  setShowDiscountModal(false);
                  setIsCheckoutOpen(true);
                }}
                style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
                className="w-full hover:bg-[#132617] active:scale-95 animate-cta-shimmer !text-white text-xs sm:text-sm font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span style={{ color: "#ffffff" }} className="!text-white font-bold">
                  APLICAR 50% OFF Y PEDIR 2 FRASCOS ($29.99)
                </span>
                <span className="text-sm">→</span>
              </button>

              <button
                onClick={() => setShowDiscountModal(false)}
                className="w-full text-center text-[11px] text-[#82786a] hover:text-[#3d372e] py-1 cursor-pointer"
              >
                No gracias, prefiero pagar precio individual más adelante
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 14. MODAL DE INFORMACIÓN LEGAL Y POLÍTICAS */}
      {activeLegalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#faf8f5] w-full max-w-lg rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl border border-[#ded5c7] max-h-[90vh] flex flex-col">
            
            {/* Header del Modal Legal */}
            <div className="bg-[#1b3320] text-white p-3.5 px-5 flex justify-between items-center shrink-0">
              <h3 className="font-bold text-sm md:text-base text-white">
                {activeLegalModal === "disclaimer" && "Aviso Médico y Descargo Legal"}
                {activeLegalModal === "terms" && "Términos y Condiciones de Compra"}
                {activeLegalModal === "shipping" && "Políticas de Envío Contra Entrega Tealca"}
                {activeLegalModal === "guide" && "Guía Clínica y Protocolo de Uso"}
              </h3>
              <button
                onClick={() => setActiveLegalModal(null)}
                className="text-white/80 hover:text-white text-xl p-1 leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Contenido con scroll */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#4b4339] leading-relaxed">
              
              {activeLegalModal === "disclaimer" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#1b3320] text-sm">Naturaleza del Producto:</h4>
                  <p>
                    OxyEnergy Cardo Mariano (80% Silimarina) es un suplemento dietético formulado con extractos botánicos de alta pureza. No es un medicamento farmacéutico ni sustituye el tratamiento médico prescrito.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Tiempo de Acción Progresivo:</h4>
                  <p>
                    Los componentes botánicos como la Silimarina, el Inositol y la Cúrcuma actúan de forma acumulativa y gradual a nivel celular. No generan efectos inmediatos ni mágicos. Se recomienda un uso ininterrumpido de 3 a 6 meses para consolidar la depuración hepática y evitar recaídas.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Contraindicaciones:</h4>
                  <p>
                    No debe ser consumido por mujeres en período de gestación o lactancia, ni por menores de 18 años. Personas con diagnóstico de litiasis vesicular severa (cálculos biliares obstructivos) deben consultar a su médico tratante antes de su consumo.
                  </p>
                </div>
              )}

              {activeLegalModal === "terms" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#1b3320] text-sm">Modalidad Pago Contra Entrega (COD):</h4>
                  <p>
                    La solicitud realizada a través de esta plataforma no requiere pagos previos por internet. El cliente formaliza su solicitud voluntaria de compra comprometiéndose a recibir y cancelar el monto exacto acordado en el momento de la entrega física.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Verificación Telefónica Obligatoria:</h4>
                  <p>
                    Para garantizar la entrega efectiva y evitar fraudes o errores de dirección, un operador de nuestro equipo se comunicará por llamada telefónica o WhatsApp para confirmar los datos antes de emitir la guía de Tealca. Pedidos no confirmados no serán despachados.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Métodos de Cancelación al Recibir:</h4>
                  <p>
                    Al recibir por Tealca (en mano o en oficina), el comprador puede cancelar en Dólares en Efectivo ($ USD Cash), Pago Móvil en Bolívares liquidado a la tasa oficial, o Binance USDT previa coordinación.
                  </p>
                </div>
              )}

              {activeLegalModal === "shipping" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#1b3320] text-sm">Cobertura Nacional por Tealca:</h4>
                  <p>
                    Los envíos se realizan desde nuestra megabodega central en Caracas hacia cualquier estado de Venezuela a través de la empresa de encomiendas Tealca, ya sea para entrega a domicilio o retiro en la oficina Tealca más cercana.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Tiempos Estimados de Entrega:</h4>
                  <p>
                    Caracas y Gran Caracas: 24 a 48 horas hábiles tras la confirmación telefónica. Resto del país: 48 a 72 horas hábiles con número de guía oficial rastreable en línea.
                  </p>
                  <h4 className="font-bold text-[#1b3320] text-sm">Garantía de Recepción Segura:</h4>
                  <p>
                    Cada frasco cuenta con sello de seguridad hermético original de fábrica. Si el paquete presenta roturas o daños atribuibles al transporte, el comprador tiene derecho a la reposición inmediata sin costo adicional.
                  </p>
                </div>
              )}

              {activeLegalModal === "guide" && (
                <div className="space-y-3">
                  <h4 className="font-bold text-[#1b3320] text-sm">Protocolo Diario Recomendado:</h4>
                  <ul className="list-disc pl-4 space-y-1">
                    <li><strong>Dosis:</strong> 1 cápsula vegetal diaria.</li>
                    <li><strong>Momento:</strong> Durante el desayuno o el almuerzo para una digestión óptima.</li>
                    <li><strong>Líquido:</strong> 1 vaso grande de agua (250 ml).</li>
                  </ul>
                  <h4 className="font-bold text-[#1b3320] text-sm">Pilares de Éxito:</h4>
                  <p>
                    Para potenciar el efecto depurador de la silimarina, mantén una ingesta de al menos 2 litros de agua diarios, modera los fritos, harinas ultraprocesadas y el licor, y prioriza un descanso nocturno de 7 horas.
                  </p>
                </div>
              )}

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveLegalModal(null)}
                  style={{ color: "#ffffff", backgroundColor: "#1b3320" }}
                  className="px-5 py-2 !text-white font-bold rounded-xl text-xs cursor-pointer hover:bg-[#132617]"
                >
                  Entendido y Cerrar
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Botón flotante para simular vista móvil en Desktop */}
      <Link
        href="/preview"
        className="fixed bottom-6 left-6 z-40 hidden md:flex items-center gap-2.5 bg-[#1b3320] hover:bg-[#132617] text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-2xl border border-white/20 transition-all hover:scale-105 cursor-pointer backdrop-blur-md"
        title="Ver simulación exacta en iPhone / Android"
      >
        <span className="text-base">📱</span>
        <span>Simular Vista Móvil</span>
      </Link>

    </div>
  );
}
