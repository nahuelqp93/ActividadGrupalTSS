import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Conceptos from "./modules/conceptos/Conceptos.tsx";
import Simulacion from "./modules/simulacion/Simulacion.tsx";
import Ayuda from "./pages/Ayuda.tsx";

// Importamos las distribuciones
import TriangularDistribution from "./core/distributions/Distribuciones.tsx"; // Usa el LCG que hicimos antes
import PoissonDistribution from "./core/distributions/PoissonDistribution.tsx";
import ExponentialDistribution from "./core/distributions/ExponentialDistribution.tsx";
import BernoullyDistribution from "./core/distributions/BernoullyDistribution.tsx";
import UniformDistribution from "./core/distributions/UniformDistribution.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/conceptos" element={<Conceptos />} />
      
      {/* Rutas Específicas para Distribuciones */}
      <Route path="/distribuciones/continuas/triangular" element={<TriangularDistribution />} />

      <Route path="/distribuciones/discretas/poisson" element={<PoissonDistribution />} />

      <Route path="/distribuciones/discretas/bernoulli" element={<BernoullyDistribution />} />

      <Route path="/distribuciones/continuas/uniforme" element={<UniformDistribution />} />

      <Route path="/distribuciones/continuas/exponencial" element={<ExponentialDistribution />} />
      
      <Route path="/simulacion" element={<Simulacion />} />
      <Route path="/ayuda" element={<Ayuda />} />
    </Routes>
  );
}