import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Conceptos from "./modules/conceptos/Conceptos.tsx";
import Distribuciones from "./modules/distribuciones/Distribuciones.tsx";
import Simulacion from "./modules/simulacion/Simulacion.tsx";
import Ayuda from "./pages/Ayuda.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/conceptos" element={<Conceptos />} />
      <Route path="/distribuciones" element={<Distribuciones />} />
      <Route path="/simulacion" element={<Simulacion />} />
      <Route path="/ayuda" element={<Ayuda />} />
    </Routes>
  );
}
