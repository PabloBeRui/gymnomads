/**
 * =============================================================================
 * COMPONENTE: GymMap
 * COMPONENT: GymMap
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
 * - logoUrl: (Opcional) URL del logo del gimnasio / (Optional) Gym logo URL
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
  iconAnchor: [12, 41], // Punto del ícono que corresponde a la ubicación del marcador / Point of the icon which will correspond to marker's location
});
L.Marker.prototype.options.icon = DefaultIcon;

/* =============================================================================
    PROPS DEL COMPONENTE
    COMPONENT PROPS
    ============================================================================= */
interface GymMapProps {
  lat: number;
  lon: number;
  gymName: string;
  logoUrl?: string | null; // (Opcional) URL del logo / (Optional) Logo URL
}

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  mapContainer: {
    height: "300px", // Altura fija para el contenedor del mapa / Fixed height for the map container
    width: "100%",
    borderRadius: "8px",
    border: "1px solid #ccc",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    zIndex: 0, // Asegura que el mapa esté en el flujo normal / Ensures map is in normal flow
  },
  popupWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Espacio entre logo y texto / Space between logo and text
    margin: 0,
    padding: 0,
  },
  popupLogo: {
    width: "24px",
    height: "24px",
    objectFit: "contain",
    borderRadius: "4px",
    flexShrink: 0, // Evita que el logo se encoja / Prevents logo from shrinking
  },
  popupText: {
    margin: 0,
    fontWeight: 600,
    textAlign: "left",
  },
};

/* =============================================================================
    COMPONENTE
    COMPONENT
    ============================================================================= */
export const GymMap: React.FC<GymMapProps> = ({
  lat,
  lon,
  gymName,
  logoUrl, // Prop de logo añadida / Logo prop added
}) => {
  const position: [number, number] = [lat, lon];

  return (
    <MapContainer
      center={position}
      zoom={15} // Zoom inicial (15 es bueno para nivel de calle) / Initial zoom (15 is good for street level)
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
          {/* Contenido del Popup con logo y nombre */}
          {/* Popup content with logo and name */}
          <div style={styles.popupWrapper}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${gymName} logo`}
                style={styles.popupLogo}
              />
            )}
            <p style={styles.popupText}>{gymName}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};
