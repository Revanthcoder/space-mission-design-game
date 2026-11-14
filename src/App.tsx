import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import { AppRoutes } from "./app/routes";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
