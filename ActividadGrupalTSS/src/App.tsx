import { BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import AppRoutes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      {/* Eliminamos el px-6 y dejamos que el layout maneje el ancho */}
      <div className="ml-64 min-h-screen bg-slate-50"> 
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
export default App;