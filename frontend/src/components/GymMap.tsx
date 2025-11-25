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

// Importar el módulo SCSS / Import the SCSS module
import styles from "./GymMap.module.scss";
// import clsx from "clsx"; // Importar clsx / Import clsx

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
      className={styles.mapContainer}>
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
          <div className={styles.popupWrapper}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={`${gymName} logo`}
                className={styles.popupLogo}
              />
            )}
            <p className={styles.popupText}>{gymName}</p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};
