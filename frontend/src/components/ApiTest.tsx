/**
 * =============================================================================
 * COMPONENTE: ApiTest
 * COMPONENT:  ApiTest
 * =============================================================================
 *
 * Descripción: Componente de prueba simple para verificar la conectividad
 * con la API y mostrar una lista de gimnasios, o un mensaje de error si
 * la llamada falla.
 *
 * Description: Simple test component to verify API connectivity and
 * display a list of gyms, or an error message if the call fails.
 *
 * =============================================================================
 */
import { useEffect, useState } from "react";

// Interfaz Gym
// Gym interface
import type { Gym } from "../interfaces/gym-interfaces";
import { getAllGyms } from "../services/gym-services";

export const ApiTest = () => {
  // Crear useState para almacenar la lista de gimnasios.
  // Create useState to store the list of gyms.
  const [gyms, setGyms] = useState<Gym[]>([]);

  // Crear useState para gestionar errores.
  // Create useState to manage errors.

  const [error, setError] = useState<string | null>(null);

  // Ejecutar useEffect al montar el componente para pedir datos a la API.
  // Run useEffect on component mount to fetch data from the API.

  useEffect(() => {
    // Definir función asíncrona para obtener los gimnasios.
    // Define an async function to fetch the gyms.
    const loadGyms = async () => {
      try {
        setError(null); // Limpiar errores previos. // Clear previous errors.
        // La función ahora devuelve un objeto { data, total } y requiere un token
        // The function now returns an objeto { data, total } and requires a token
        const response = await getAllGyms(""); // Pasamos un token vacío para la prueba
        setGyms(response.data); // Asignar solo la propiedad 'data' al estado
      } catch (err) {
        // Mostrar error en consola y en el estado si la petición falla.
        // Log the error and set it in the state if the request fails.
        console.error("Error fetching gyms:", err);
        setError(
          "No se pudieron cargar los gimnasios. ¿Está el arrancado backend ?"
        );
      }
    };
    loadGyms();
  }, []); // El array vacío asegura una única ejecución. // The empty array ensures a single execution.

  return (
    <div>
      <h1>Prueba de conexión a la API</h1>
      {error && <p className="text-danger" style={{ fontSize: "2rem" }}>{error}</p>}
      <ul>
        {gyms.map((gym: Gym) => (
          <li key={gym.id}>
            <strong>{gym.name}</strong> -- {gym.city}{" "}
          </li>
        ))}
      </ul>
    </div>
  );
};