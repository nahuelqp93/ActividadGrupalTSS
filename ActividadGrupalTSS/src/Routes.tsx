import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Ayuda from "./pages/Ayuda.tsx";

import ConceptosHome from "./modules/conceptos/Conceptos.tsx";
import ConceptosVariablesAleatorias from "./modules/conceptos/variablesAleatorias/Introduccion.tsx";
import VariablesDiscretas from "./modules/conceptos/variablesAleatorias/Discretas.tsx";
import VariablesContinuas from "./modules/conceptos/variablesAleatorias/Continuas.tsx";
import FuncionCDF from "./modules/conceptos/funciones/CDF.tsx";
import FuncionPDF from "./modules/conceptos/funciones/PDF.tsx";

// Importamos las distribuciones
import TriangularDistribution from "./core/distributions/TriangularDistribution/MetodosDistribucionTriangular.tsx"; // Usa el LCG que hicimos antes
import PoissonDistribution from "./core/distributions/PoissonDistribution/PoissonDistribution.tsx";
import ExponentialDistribution from "./core/distributions/ExponentialDistribution/ExponentialDistribution.tsx";
import BernoullyDistribution from "./core/distributions/BernoullyDistribution.tsx";
import UniformDistribution from "./core/distributions/UniformDistribution/UniformDistribution.tsx";

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
import SimulacionEjercicio7 from "./modules/simulacion/aplicacion/Ejercicio7.tsx";



export default function AppRoutes() {
  return (
    <Routes>



      <Route path="/" element={<Home />} />
      <Route path="/conceptos/variables-aleatorias" element={<ConceptosHome />} />

      <Route path="/conceptos/variables-aleatorias/introduccion" element={<ConceptosVariablesAleatorias />} />

      <Route path="/conceptos/variables-aleatorias/discretas" element={<VariablesDiscretas />} />

      <Route path="/conceptos/variables-aleatorias/continuas" element={<VariablesContinuas />} />

      <Route path="/conceptos/funciones/pdf" element={<FuncionPDF />} />

      <Route path="/conceptos/funciones/cdf" element={<FuncionCDF />} />

      
      
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

      <Route path="/simulacion/aplicacion/ejercicio-7" element={ <LayoutAplicacion> <SimulacionEjercicio7 /> </LayoutAplicacion> } />
      <Route path="/ayuda" element={<Ayuda />} />
    </Routes>
  );
}