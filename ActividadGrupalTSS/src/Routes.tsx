import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Conceptos from "./modules/conceptos/Conceptos.tsx";
import Ayuda from "./pages/Ayuda.tsx";

// Importamos las distribuciones
import TriangularDistribution from "./core/distributions/TriangularDistribution/MetodosDistribucionTriangular.tsx"; // Usa el LCG que hicimos antes
import PoissonDistribution from "./core/distributions/PoissonDistribution.tsx";
import ExponentialDistribution from "./core/distributions/ExponentialDistribution.tsx";
import BernoullyDistribution from "./core/distributions/BernoullyDistribution.tsx";
import UniformDistribution from "./core/distributions/UniformDistribution.tsx";

//ejercicios de simulacion
// Simulación
import AplicacionIndex from "./modules/simulacion/aplicacion/AplicacionIndex";
import { LayoutAplicacion } from "./modules/simulacion/utils/LayoutAplicacion";
import SimulacionEjercicio1 from "./modules/simulacion/aplicacion/Ejercicio1.tsx";
import SimulacionEjercicio2 from "./modules/simulacion/aplicacion/Ejercicio2.tsx";
import SimulacionEjercicio3 from "./modules/simulacion/aplicacion/Ejercicio3.tsx";
import SimulacionEjercicio4 from "./modules/simulacion/aplicacion/Ejercicio4.tsx";
import SimulacionEjercicio5 from "./modules/simulacion/aplicacion/Ejercicio5.tsx";
import SimulacionEjercicio6 from "./modules/simulacion/aplicacion/Ejercicio6.tsx";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/conceptos" element={<Conceptos />} />
      
      {/* Rutas Específicas para Distribuciones */}
      <Route path="/distribuciones/continuas/triangular" element={<TriangularDistribution onCerrar={() => {}} />} />

      <Route path="/distribuciones/discretas/poisson" element={<PoissonDistribution />} />

      <Route path="/distribuciones/discretas/bernoulli" element={<BernoullyDistribution />} />

      <Route path="/distribuciones/continuas/uniforme" element={<UniformDistribution />} />

      <Route path="/distribuciones/continuas/exponencial" element={<ExponentialDistribution />} />
      
            {/* Simulación */}
      <Route path="/simulacion/aplicacion" element={<AplicacionIndex />} />


      <Route path="/simulacion/aplicacion/ejercicio-1" element={ <LayoutAplicacion> <SimulacionEjercicio1 /> </LayoutAplicacion> } />

      <Route path="/simulacion/aplicacion/ejercicio-2" element={ <LayoutAplicacion> <SimulacionEjercicio2 /> </LayoutAplicacion> } />

      <Route path="/simulacion/aplicacion/ejercicio-3" element={ <LayoutAplicacion> <SimulacionEjercicio3 /> </LayoutAplicacion> } />

      <Route path="/simulacion/aplicacion/ejercicio-4" element={ <LayoutAplicacion> <SimulacionEjercicio4 /> </LayoutAplicacion> } />

      <Route path="/simulacion/aplicacion/ejercicio-5" element={ <LayoutAplicacion> <SimulacionEjercicio5 /> </LayoutAplicacion> } />

      <Route path="/simulacion/aplicacion/ejercicio-6" element={ <LayoutAplicacion> <SimulacionEjercicio6 /> </LayoutAplicacion> } />

      <Route path="/ayuda" element={<Ayuda />} />
    </Routes>
  );
}