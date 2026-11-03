import CardoLanding from "@/components/CardoLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OxyEnergy Cardo Mariano 80% Silimarina | Envío y Pago Contra Entrega en Venezuela",
  description: "Desinflama tu abdomen, limpia el hígado graso y reactiva tu energía con OxyEnergy Cardo Mariano 80% Silimarina. 90 cápsulas. Pago contra entrega en toda Venezuela.",
  openGraph: {
    title: "OxyEnergy Cardo Mariano 80% Silimarina | 90 Cápsulas",
    description: "Tratamiento botánico clínico para el hígado graso y digestión pesada. Paga al recibir en efectivo, Pago Móvil o Binance.",
    images: [
      {
        url: "/cardo/oxyenergy_milk_thistle_two_bottles.png",
        width: 800,
        height: 800,
        alt: "OxyEnergy Cardo Mariano",
      },
    ],
  },
};

export default function CardoPage() {
  return <CardoLanding />;
}
