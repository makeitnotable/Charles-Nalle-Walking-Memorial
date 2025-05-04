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
  const location = useLocation();

  // Determine if the current path is a location page route (e.g., /bakery)
  // It should start with '/' and have only one segment, excluding '/' and '/map'
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLocationPageRoute = pathSegments.length === 1 && location.pathname !== '/map';

  const menuPosition = isLocationPageRoute ? 'bottom-right' : 'top-right';

  return (
    <div className="">
      {/* Global menu overlay - available on all pages */}
      <MenuOverlay locations={LOCATIONS} position={menuPosition} />

      <div id="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Layout />} />

          {/* Location routes */}
          <Route path="/:location" element={<LocationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;