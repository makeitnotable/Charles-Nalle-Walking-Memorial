import { Routes, Route, Link, useLocation } from 'react-router';
import './App.css';
import Home from './Home';
import MapBox from './components/map';
import BakeryPage from './BakeryPage';
import BankPage from './BankPage';
import MansionPage from './MansionPage';
import FerryPage from './FerryPage';
import BarberPage from './BarberPage';
import Drawer from './components/Drawer';
import { useState } from 'react';
import ComponentsLibrary from './components/ComponentsLibrary';
// import MapDemo from './components/mapdemo'

export const Layout = () => {
  const location = useLocation();
  const isRootRoute = location.pathname === '/';

  return (
    <>
      <div className={`w-full ${isRootRoute ? 'hidden' : 'block'}`}>
        <MapBox interactive />
      </div>
    </>
  );
}
function App() {
  return (
    <div className="">
      {/* <Drawer /> */}
      {/* <Layout />  */}
      <Routes>

        {/* <Route path="/components" element={<ComponentsLibrary />} /> */}
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Layout />} />
        {/* <Route path="map" element={<MapDemo />} /> */}
        {/* <Route path="bakery" element={<BakeryPage />} /> */}
        {/* <Route path="/bank" element={<BankPage />} />
        <Route path="/mansion" element={<MansionPage />} />
        <Route path="/ferry" element={<FerryPage />} />
        <Route path="/barber" element={<BarberPage />} /> */}
      </Routes>
    </div>
  );
}

export default App;