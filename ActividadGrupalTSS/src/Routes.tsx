import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Conceptos from "./modules/conceptos/Conceptos.tsx";
import Simulacion from "./modules/simulacion/Simulacion.tsx";
import Ayuda from "./pages/Ayuda.tsx";

// Importamos las distribuciones
import TriangularDistribution from "./modules/distribuciones/Distribuciones.tsx"; // Usa el LCG que hicimos antes
import PoissonDistribution from "./modules/distribuciones/PoissonDistribution.tsx";

import BernoullyDistribution from "./modules/distribuciones/BernoullyDistribution.tsx";
import UniformLCG from "./modules/distribuciones/UniformLCG.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/conceptos" element={<Conceptos />} />
      
      {/* Rutas Específicas para Distribuciones */}
      <Route path="/distribuciones/continuas/triangular" element={<TriangularDistribution />} />

      <Route path="/distribuciones/discretas/poisson" element={<PoissonDistribution />} />

      <Route path="/distribuciones/discretas/bernoulli" element={<BernoullyDistribution />} />

      <Route path="/distribuciones/continuas/uniforme-lcg" element={<UniformLCG />} />
      
      <Route path="/simulacion" element={<Simulacion />} />
      <Route path="/ayuda" element={<Ayuda />} />
    </Routes>
  );
}