import CardoLanding from "@/components/CardoLanding";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "OxyEnergy Cardo Mariano 80% Silimarina | Desintoxicante Hepático y Digestivo",
  description: "Desinflama tu abdomen, limpia el hígado graso y reactiva tu energía con OxyEnergy Cardo Mariano 80% Silimarina. 90 cápsulas vegetales. Pago contra entrega en toda Venezuela por Tealca.",
};

export default function HomePage() {
  return <CardoLanding />;
}
