/**
 * =============================================================================
 * UTILIDADES: weather-utils
 * UTILITIES: weather-utils
 * =============================================================================
 *
 * Descripción: Funciones de utilidad para manejar datos relacionados con el clima.
 * Principalmente, proporciona una función para mapear códigos meteorológicos
 * (ej. de Open-Meteo) a iconos de clima visuales.
 *
 * Description: Utility functions for handling weather-related data.
 * Primarily, it provides a function to map weather codes
 * (e.g., from Open-Meteo) to visual weather icons.
 *
 * =============================================================================
 */

// Importamos los iconos / import icons
import {
    WiDaySunny,
    WiCloudy,
    WiRain,
    WiShowers,
    WiSnow,
    WiThunderstorm,
    WiFog
} from 'react-icons/wi';

/**
 * Devuelve un componente de icono de React basado en el código de tiempo WMO.
 * Recibe un código numérico de la API de Open-Meteo.
 * * Returns a React icon component based on the WMO weather code.
 * Receives a numeric code from the Open-Meteo API.
 */

export const getWeatherIcon = (weatherCode: number) => {
//
// ^ ^ ^ HE CAMBIADO 'React.ReactElement' POR 'JSX.Element' ^ ^ ^
//
    
    // Usamos un 'switch (true)' para manejar los rangos de códigos
    // We use a 'switch (true)' to handle code ranges
    switch (true) {
        case weatherCode === 0:
            // 0 = Cielo despejado
            // 0 = Clear sky
            return <WiDaySunny size={30} color="var(--bs-primary)" />;

        case weatherCode >= 1 && weatherCode <= 3:
            // 1, 2, 3 = Principalmente despejado, parcialmente nublado, nublado
            // 1, 2, 3 = Mainly clear, partly cloudy, overcast
            return <WiCloudy size={30} color="var(--bs-primary)" />;

        case weatherCode === 45 || weatherCode === 48:
            // 45, 48 = Niebla
            // 45, 48 = Fog
            return <WiFog size={30} color="var(--bs-primary)" />;

        case (weatherCode >= 51 && weatherCode <= 67):
            // 51-67 = Llovizna, Lluvia
            // 51-67 = Drizzle, Rain
            return <WiRain size={30} color="var(--bs-primary)" />;

        case (weatherCode >= 80 && weatherCode <= 82):
            // 80-82 = Chubascos
            // 80-82 = Rain showers
            return <WiShowers size={30} color="var(--bs-primary)" />;
            
        case (weatherCode >= 71 && weatherCode <= 77):
            // 71-77 = Nieve
            // 71-77 = Snow
            return <WiSnow size={30} color="var(--bs-primary)" />;

        case (weatherCode >= 95 && weatherCode <= 99):
            // 95-99 = Tormenta
            // 95-99 = Thunderstorm
            return <WiThunderstorm size={30} color="var(--bs-primary)" />;

        default:
            // Por defecto, mostramos sol
            // By default, we show the sun
            return <WiDaySunny size={30} color="var(--bs-primary)" />;
    }
};