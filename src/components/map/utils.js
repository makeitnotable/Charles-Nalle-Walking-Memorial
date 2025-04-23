// Helper functions for the Map component

/**
 * Creates a marker element for a location
 * @param {string} locationName - The name of the location
 * @returns {HTMLDivElement} - The marker DOM element
 */
export const createMarkerElement = (locationName, index) => {
  const markerDiv = document.createElement('div');
  markerDiv.className = 'custom-marker';

  markerDiv.innerHTML = `
  <div style="display: flex; flex-direction: column; align-items: center;">
 
  <div style="
    background: #1D1411;
    border-radius: 30px;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #FF9770;
    border: 1px solid #69311D;
    font-weight: bold;
    cursor: pointer;
  ">
  <div style="
    display: flex;
    background: #FF9770;
    border-radius: 100%;
    width: 20px;
    height: 20px;
    align-items: center;
    justify-content: center;
    margin-right: 5px;
  ">
  <p style="color: #FED9CC;">${index}</p>
  </div>
 <p>${locationName}</p>
  </div>
  <div style="display: flex; flex-direction: column; align-items: center;">
  <div style="background: #FF9770; width: 2px; height: 30px;"/>
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
