import { Routes, Route, useLocation } from 'react-router';
import Home from './Home';
import MapBox from './components/map';
import LocationPage from './components/location-page/LocationPage';
import MenuOverlay from './components/MenuOverlay';
import BrandingPage from './components/BrandingPage';
import AboutPage from './AboutPage';

import { SWIPEABLE_LOCATIONS } from './components/map/constants';
import { useMapStore } from './stores/useMapStore';

export const Layout = () => {
  return (
    <>
      <MapBox interactive={true} showButtons={true} initialLocationName={null} />
    </>
  );
}

function App() {
  const location = useLocation();
  const { isOverview } = useMapStore();

  // Determine if the current path is a location page route (e.g., /bakery)
  // It should start with '/' and have only one segment, excluding '/' and '/map'
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const isLocationPageRoute = pathSegments.length === 1 && location.pathname !== '/map' && location.pathname !== '/about';
  const isRootRoute = location.pathname === '/';
  const isMapRoute = location.pathname === '/map';

  // Menu position logic:
  // - Location pages: bottom-right
  // - Map overview: bottom-right
  // - Map with location selected: top-right  
  // - Other routes: top-right
  const menuPosition = isLocationPageRoute || (isMapRoute && isOverview) ? 'bottom-right' : 'top-right';

  return (
    <div className="relative">
      <div className="absolute top-0 right-0 z-50">
        {!isRootRoute && <MenuOverlay locations={SWIPEABLE_LOCATIONS} position={menuPosition} />}
      </div>

      <div id="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/map" element={<Layout />} />
          <Route path="/branding" element={<BrandingPage />} />
          <Route path="/about" element={<AboutPage />} />

          {/* Location routes */}
          <Route path="/:location" element={<LocationPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;