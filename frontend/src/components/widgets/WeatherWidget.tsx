/**
 * =============================================================================
 * COMPONENTE: WeatherWidget
 * COMPONENT:  WeatherWidget
 * =============================================================================
 *
 * Componente reutilizable para mostrar un pronóstico del tiempo de 3 días.
 * Utiliza la API de Open-Meteo y las coordenadas (lat/lon) para obtener
 * los datos. Falla silenciosamente (muestra un espacio vacío) si la API
 * no responde o da un error, para no interrumpir la UI principal.
 *
 * Reusable component to display a 3-day weather forecast.
 * It uses the Open-Meteo API and coordinates (lat/lon) to fetch
 * the data. It fails silently (shows an empty space) if the API
 * doesn't respond or returns an error, to avoid breaking the main UI.
 *
 * Props:
 * - latitude: Latitud del punto a consultar / Latitude of the point to query
 * - longitude: Longitud del punto a consultar / Longitude of the point to query
 *
 * =============================================================================
 */

import React, { useState, useEffect } from "react";
// Importar nuestro traductor de iconos
// Import our icon translator
import { getWeatherIcon } from "../../utils/weather-utils";

// Definir las props que recibirá: latitud y longitud
// Define the props it will receive: latitude and longitude
interface WeatherWidgetProps {
  latitude: number;
  longitude: number;
}

// Definir una interfaz para el estado de los datos del tiempo
// Define an interface for the weather data state
interface WeatherData {
  time: string[];
  weathercode: number[];
  temperature_2m_max: number[];
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  latitude,
  longitude,
}) => {
  // Definir estado para guardar los datos de la API
  // Define state to store API data
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Definir estado de carga
  // Define loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Definir función asíncrona para hacer el fetch
    // Define async function to perform the fetch
    const fetchWeather = async () => {
      setIsLoading(true);
      try {
        // Construir la URL de la API de Open-Meteo
        // Build the Open-Meteo API URL
        // Pedir el código, la temp. máxima y los datos para 3 días
        // Request the code, max temp, and data for 3 days
        const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_max&forecast_days=3&timezone=auto`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error("Failed to fetch weather data");
        }
        const data = await response.json();

        // Guardar solo la parte 'daily' de la respuesta
        // Save only the 'daily' part of the response
        setWeatherData(data.daily);
      } catch (error) {
        console.error("Error fetching weather:", error);
        setWeatherData(null); // Resetear en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    // Llamar a la función solo si tenemos latitud y longitud
    // Call the function only if we have latitude and longitude
    if (latitude && longitude) {
      fetchWeather();
    }

    // Ejecutar cada vez que la latitud o longitud cambien
    // Execute every time the latitude or longitude changes
  }, [latitude, longitude]);

  // --- Renderizado ---
  // --- Rendering ---

  // Definir un estilo para el placeholder (carga y error)
  // Define a style for the placeholder (loading and error)
  // Altura aprox: (label 0.85rem + gap 5px + icon 30px + gap 5px + temp 0.85rem) ≈ 68px
  // Approx height: (label 0.85rem + gap 5px + icon 30px + gap 5px + temp 0.85rem) ≈ 68px
  const placeholderStyle: React.CSSProperties = {
    height: "68px", // Altura fija para evitar saltos de layout
    fontSize: "0.8rem",
    color: "#666",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  };

  // Renderizar estado de carga
  // Render loading state
  if (isLoading) {
    return <div style={placeholderStyle}>Cargando tiempo...</div>;
  }

  // Renderizar estado de error (falla silenciosa)
  // Render error state (silent failure)
  if (!weatherData || !weatherData.time || weatherData.time.length === 0) {
    // Devolver el placeholder vacío, que ocupa el mismo espacio
    // Return the empty placeholder, which occupies the same space
    return <div style={placeholderStyle} aria-hidden="true"></div>;
  }

  // Definir array para los nombres de los días
  // Define array for day names
  const dayLabels = ["Hoy", "Mañana", "Pasado"];

  return (
    // Contenedor principal: horizontal
    // Main container: horizontal
    <div
      style={{
        display: "flex",
        flexDirection: "row", // Días uno al lado del otro
        gap: "15px", // Espacio entre días
        alignItems: "center",
      }}>
      {weatherData.time.map((time, index) => (
        // Contenedor de día: vertical y centrado
        // Day container: vertical and centered
        <div
          key={time}
          style={{
            display: "flex",
            flexDirection: "column", // (Hoy / Icono / Temp)
            alignItems: "center",
            gap: "5px",
            fontSize: "0.85rem",
          }}>
          {/* Etiqueta del día (Hoy, Mañana, Pasado) */}
          {/* Day label (Today, Tomorrow, After) */}
          <span style={{ fontWeight: "500" }}>{dayLabels[index]}</span>

          {/* Icono del tiempo */}
          {/* Weather icon */}
          {getWeatherIcon(weatherData.weathercode[index])}

          {/* Temperatura */}
          {/* Temperature */}
          <span>{Math.round(weatherData.temperature_2m_max[index])}°C</span>
        </div>
      ))}
    </div>
  );
};
