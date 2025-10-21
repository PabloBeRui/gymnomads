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
        const data = await getAllGyms();
        setGyms(data);
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
      {error && <p style={{ color: "red", fontSize: "2rem" }}>{error}</p>}
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
