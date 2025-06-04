import { Routes, Route, useLocation } from 'react-router';
import Home from './Home';
import MapBox from './components/map';
import LocationPage from './components/location-page/LocationPage';
import MenuOverlay from './components/MenuOverlay';
import BrandingPage from './components/BrandingPage';
import { LOCATIONS } from './components/map/constants';

export const Layout = () => {
  const location = useLocation();
  const isRootRoute = location.pathname === '/';

  return (
    <>
      <MapBox interactive={true} showButtons={true} />
    </>
  );
}

function App() {
  const location = useLocation();

  // Determine if the current path is a location page route (e.g., /bakery)
  // It should start with '/' and have only one segment, excluding '/' and '/map'
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLocationPageRoute = pathSegments.length === 1 && location.pathname !== '/map';
  const isRootRoute = location.pathname === '/';

  const menuPosition = isLocationPageRoute ? 'bottom-right' : 'top-right';

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        {!isRootRoute && <MenuOverlay locations={LOCATIONS} position={menuPosition} />}
      </div>

      <div id="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Layout />} />
          <Route path="/branding" element={<BrandingPage />} />

          {/* Location routes */}
          <Route path="/:location" element={<LocationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;