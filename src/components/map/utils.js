// Helper functions for the Map component
import { MAP_CONFIG, LOCATIONS } from './constants';

/**
 * Creates a marker element for a location
 * @param {string} locationName - The name of the location
 * @param {number} index - The index of the location
 * @param {boolean} isActive - Whether the location is currently active/selected
 * @returns {HTMLDivElement} - The marker DOM element
 */
export const createMarkerElement = (locationName, index, isActive = false) => {
  const markerDiv = document.createElement('div');
  markerDiv.className = 'custom-marker';

  const config = MAP_CONFIG.markerConfig;
  const style = isActive ? config.active : config.inactive;
  
  // Find the location data to get pin position
  const location = LOCATIONS.find(loc => loc.name === locationName);
  const isPinAbove = location?.pinPosition === 'above';

  // Create the pin and label elements
  const pinElement = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center; 
      height: ${config.lineHeight}px;
    ">
      <div style="
        background: ${style.lineColor}; 
        width: 2px; 
        height: ${config.lineHeight}px;
      "></div>
      <div style="
        background: ${style.lineColor}; 
        width: ${config.dotSize}px; 
        height: ${config.dotSize}px; 
        border-radius: 100%;
      "></div>
    </div>
  `;

  const labelElement = `
    <div style="
      background: ${style.backgroundColor};
      border-radius: ${config.borderRadius}px;
      padding: ${config.padding}px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: ${style.textColor};
      border: 1px solid ${style.borderColor};
      font-family: 'Poppins', sans-serif;
      font-weight: 500;
      font-size: ${config.fontSize}px;
      cursor: pointer;
    ">
      <div style="
        display: flex;
        background: ${style.indexBgColor};
        border-radius: 100%;
        width: ${config.indexSize}px;
        height: ${config.indexSize}px;
        align-items: center;
        justify-content: center;
        margin-right: 5px;
      ">
        <p style="color: ${style.indexTextColor};">${index}</p>
      </div>
      <p>${locationName}</p>
    </div>
  `;

  markerDiv.innerHTML = `
    <div style="
      display: flex; 
      flex-direction: column; 
      align-items: center;
      transform: scale(${style.scale});
      transition: transform 0.3s ease-in-out;
    ">
      ${isPinAbove ? pinElement + labelElement : labelElement + pinElement}
    </div>
  `;

  return markerDiv;
};

/**
 * Calculates fly-to animation parameters
 * @param {Array} coordinates - [lng, lat] coordinates
 * @param {number} zoom - Target zoom level
 * @param {number} speed - Animation speed
 * @returns {Object} - Animation parameters object
 */
export const getFlyToParams = (coordinates, zoom = 20, speed = 0.8) => {
  return {
    center: coordinates,
    zoom,
    speed,
    curve: 1.4,
    essential: true
  };
};
