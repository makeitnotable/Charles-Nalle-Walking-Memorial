import { Routes, Route, useLocation } from 'react-router';
import './App.css';
import Home from './Home';
import MapBox from './components/map';
import LocationPage from './components/LocationPage';
import MenuOverlay from './components/MenuOverlay';
import { LOCATIONS } from './components/map/constants';

export const Layout = () => {
  const location = useLocation();
  const isRootRoute = location.pathname === '/';

  return (
    <>
      <div className={`w-full ${isRootRoute ? 'hidden' : 'block'}`}>
        <MapBox interactive={true} showButtons={true} />
      </div>
    </>
  );
}

function App() {
  return (
    <div className="">
      {/* Global menu overlay - available on all pages */}
      <MenuOverlay locations={LOCATIONS} position="top-right" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/map" element={<Layout />} />

        {/* Location routes */}
        <Route path="/:location" element={<LocationPage />} />
      </Routes>
    </div>
  );
}

export default App;