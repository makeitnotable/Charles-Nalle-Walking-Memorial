import { Routes, Route, Link } from 'react-router';
import './App.css';
import Home from './Home';
import MapBox from './components/MapBox';
import BakeryPage from './BakeryPage';
import BankPage from './BankPage';
import MansionPage from './MansionPage';
import FerryPage from './FerryPage';
import BarberPage from './BarberPage';
import Drawer from './components/Drawer';
import { useState } from 'react';
import ComponentsLibrary from './components/ComponentsLibrary';
function App() {


  return (
    <div className="">
      <Drawer />
      <div className="">
        {/* <MapBox /> */}
        <Routes>
          <Route path="/components" element={<ComponentsLibrary />} />
          <Route path="/" element={<Home />} />
          <Route path="/bakery" element={<BakeryPage />} />
          <Route path="/bank" element={<BankPage />} />
          <Route path="/mansion" element={<MansionPage />} />
          <Route path="/ferry" element={<FerryPage />} />
          <Route path="/barber" element={<BarberPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;