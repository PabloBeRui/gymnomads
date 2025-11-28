/**
 * =============================================================================
 * UTILIDAD: Ordenador de Gimnasios
 * UTILITY:  Gym Sorter
 * =============================================================================
 *
 * Este archivo contiene la lógica de negocio para ordenar la lista de gimnasios
 * según el rol del usuario.
 *
 * This file contains the business logic for sorting the list of gyms
 * according to the user's role.
 *
 * =============================================================================
 */

import type { Gym, User } from "../interfaces";

/**
 * Algoritmo de ordenación aleatoria Fisher-Yates.
 * Baraja un array de forma eficiente y uniforme.
 *
 * Fisher-Yates shuffle algorithm.
 * Shuffles an array efficiently and uniformly.
 * @param array - El array a barajar. / The array to shuffle.
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array]; // No mutar el original // Do not mutate the original
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

/**
 * Ordena la lista de gimnasios según el rol del usuario.
 * - admin: Orden alfabético (se asume que viene del backend, aquí no se hace nada).
 * - manager: Su gimnasio primero, el resto aleatorio.
 * - user/guest: Orden completamente aleatorio.
 *
 * Sorts the list of gyms based on the user's role.
 * - admin: Alphabetical order (assumed to come from the backend, nothing is done here).
 * - manager: Their gym first, the rest are random.
 * - user/guest: Completely random order.
 *
 * @param gyms - La lista de gimnasios a ordenar. / The list of gyms to sort.
 * @param user - El objeto de usuario (o null si es invitado). / The user object (or null if guest).
 * @returns La lista de gimnasios ordenada. / The sorted list of gyms.
 */
export const sortGymsByRole = (gyms: Gym[], user: User | null): Gym[] => {
  const role = user?.role;

  switch (role) {
    // Para el admin, el backend se encargará de la ordenación alfabética para
    // que la paginación sea eficiente. La función devuelve la lista tal cual.
    // For the admin, the backend will handle alphabetical sorting for
    // efficient pagination. The function returns the list as is.
    case "admin":
      return gyms;

    // Para el manager, su gimnasio va primero y el resto se baraja.
    // For the manager, their gym comes first and the rest are shuffled.
    case "manager": {
      // Comprobar si el usuario existe, aunque el rol sea manager.
      // Check if the user exists, even if the role is manager.
      if (!user) {
        return shuffleArray(gyms);
      }

      if (!user.home_gym_id) {
        return shuffleArray(gyms); // Si no tiene home_gym, tratar como usuario normal. // If no home_gym, treat as a normal user.
      }
      const homeGym = gyms.find((gym) => gym.id === user.home_gym_id);
      const otherGyms = gyms.filter((gym) => gym.id !== user.home_gym_id);

      if (!homeGym) {
        return shuffleArray(gyms); // Si su gimnasio no está en la lista, barajar todo. // If their gym is not in the list, shuffle everything.
      }

      return [homeGym, ...shuffleArray(otherGyms)];
    }

    // Para usuarios y huéspedes, toda la lista se baraja.
    // For users and guests, the entire list is shuffled.
    case "user":
    default:
      return shuffleArray(gyms);
  }
};
