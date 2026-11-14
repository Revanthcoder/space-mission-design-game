import { BrowserRouter } from "react-router-dom";
import "./App.css";
import "./index.css";
import { AppRoutes } from "./app/routes";
import { Footer } from "./components/layout/Footer";
import { Navbar } from "./components/layout/Navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="mission-app min-h-screen text-slate-100">
        <div className="mission-app__glow mission-app__glow--left" />
        <div className="mission-app__glow mission-app__glow--right" />
        <Navbar />
        <AppRoutes />
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
