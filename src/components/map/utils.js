// Helper functions for the Map component

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

  const backgroundColor = isActive ? '#F26835' : '#4A1B0A';
  const textColor = isActive ? '#FED9CC' : '#FF9770'
  const borderColor = isActive ? '#F26835' : '#80412B';
  const indexBgColor = '#E45B27';
  const indexTextColor = '#FED9CC';
  const lineColor = isActive ? '#F26835' : '#80412B';

  markerDiv.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center;">
 
  <div style="
    background: ${backgroundColor};
    border-radius: 30px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${textColor};
    border: 1px solid ${borderColor};
    font-family: 'Poppins', sans-serif;
    font-weight: 500;
    font-size: 12px;
    cursor: pointer;
  ">
  <div style="
    display: flex;
    background: ${indexBgColor};
    border-radius: 100%;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
  ">
  <p style="color: ${indexTextColor};">${index}</p>
  </div>
 <p>${locationName}</p>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center; height: 30px;">
  <div style="background: ${lineColor}; width: 2px; height: 30px;"></div>
  <div style="background: ${lineColor}; width: 8px; height: 8px; border-radius: 100%;"></div>
  </div>
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
