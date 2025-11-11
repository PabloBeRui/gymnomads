/**
 * =============================================================================
 * COMPONENTE: GymMap
 * =============================================================================
 *
 * Componente reutilizable para mostrar un mapa interactivo usando Leaflet y
 * OpenStreetMaps, centrado en una latitud y longitud específicas.
 *
 * Reusable component to display an interactive map using Leaflet and
 * OpenStreetMaps, centered on specific latitude and longitude.
 *
 * Props:
 * - lat: Latitud del centro del mapa / Map center latitude
 * - lon: Longitud del centro del mapa / Map center longitude
 * - gymName: Nombre del gimnasio para el Popup / Gym name for the Popup
 *
 * =============================================================================
 */


import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// Importar íconos de Leaflet (soluciona problema de íconos por defecto)
// Import Leaflet icons (solves default icon problem)
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Configuración del ícono por defecto de Leaflet
// Leaflet default icon setup
const DefaultIcon = L.icon({
  iconUrl: iconUrl,
  shadowUrl: iconShadowUrl,
  iconAnchor: [12, 41], // Punto del ícono que corresponde a la ubicación del marcador
});
L.Marker.prototype.options.icon = DefaultIcon;

/* =============================================================================
    PROPS DEL COMPONENTE
    ============================================================================= */
interface GymMapProps {
  lat: number;
  lon: number;
  gymName: string;
}

/* =============================================================================
    ESTILOS (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  mapContainer: {
    height: "300px", // Altura fija para el contenedor del mapa
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 0, // Asegura que el mapa esté en el flujo normal
  },
  popupContent: {
    margin: 0,
    fontWeight: 600,
    textAlign: "center",
  },
};

/* =============================================================================
    COMPONENTE
    ============================================================================= */
export const GymMap: React.FC<GymMapProps> = ({ lat, lon, gymName }) => {
  const position: [number, number] = [lat, lon];

  return (
    <MapContainer
      center={position}
      zoom={15} // Zoom inicial (15 es bueno para nivel de calle)
      style={styles.mapContainer}>
      {/* Capa de teselas (el mapa base de OpenStreetMap) */}
      {/* Tile layer (the base map from OpenStreetMap) */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Marcador en la posición del gimnasio */}
      {/* Marker at the gym's position */}
      <Marker position={position}>
        <Popup>
          <p style={styles.popupContent}>{gymName}</p>
        </Popup>
      </Marker>
    </MapContainer>
  );
};