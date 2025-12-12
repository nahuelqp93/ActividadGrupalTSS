import { BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar";
import AppRoutes from "./Routes";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <div className="ml-64 mt-4 px-6 min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}

export default App;