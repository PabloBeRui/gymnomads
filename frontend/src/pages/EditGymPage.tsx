

import React, { useState, useEffect } from 'react'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { getGymById } from '../services/gym-services'; 
import type { Gym } from '../interfaces/gym-interfaces'; 
// import { useAuth } from '../context/AuthContext'; 
import { toast } from 'sonner'; // sonner toast 
import { handleApiError } from '../utils/error-handler';


// Estilos básicos
// Basic styles
const styles: { [key: string]: React.CSSProperties } = {
    container: { padding: '20px', maxWidth: '800px', margin: '20px auto', border: '1px solid #ccc', borderRadius: '8px' },
};

/**
 * Página (placeholder) para editar un gimnasio existente.
 * Page (placeholder) to edit an existing gym.
 *
 */
export const EditGymPage = ()=> {
    // Obtener parámetros y hooks
    // Get parameters and hooks
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    //const { user } = useAuth(); // TODO Para verificar roles más adelante // To check roles later

    // Estados para los datos del gimnasio, carga y error
    // States for gym data, loading, and error
    const [gymData, setGymData] = useState<Gym | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null); // Guardar error por si acaso // Store error just in case

    // Efecto para obtener los datos del gimnasio al cargar
    // Effect to fetch gym data on load
    useEffect(() => {
        // Definir función asíncrona para la carga
        // Define async function for loading
        const fetchGymData = async () => {
            // Asegurarse de que el ID existe
            // Ensure ID exists
            if (!id) {
                setError("No se proporcionó un ID de gimnasio.");
                setIsLoading(false);
                toast.error("ID de gimnasio inválido.");
                navigate('/gyms'); // Redirigir si no hay ID // Redirect if no ID
                return;
            }

            // Convertir ID a número (opcionalmente validar aquí)
            // Convert ID to number (optionally validate here)
            const gymId = parseInt(id, 10);
            if (isNaN(gymId)) {
                setError("El ID del gimnasio no es válido.");
                setIsLoading(false);
                toast.error("ID de gimnasio inválido.");
                navigate('/gyms'); // Redirigir si ID no es número // Redirect if ID is not a number
                return;
            }


            try {
                // Poner estado de carga
                // Set loading state
                setIsLoading(true);
                setError(null);
                // Llamar al servicio para obtener los datos
                // Call the service to get the data
                const data = await getGymById(gymId);
                // Guardar los datos en el estado
                // Save the data in the state
                setGymData(data);
            } catch (err) {
                // Manejar errores usando el handler centralizado
                // Handle errors using the centralized handler
                const processedErrorMessage = handleApiError(err, 'Error al cargar los datos del gimnasio.');
                setError(processedErrorMessage);
                toast.error(processedErrorMessage);
                // Considerar redirigir si el gimnasio no se encuentra (ej: error 404)
                // Consider redirecting if gym not found (e.g., 404 error)
                // if (err?.response?.status === 404) navigate('/gyms');
            } finally {
                // Quitar estado de carga
                // Remove loading state
                setIsLoading(false);
            }
        };

        // Ejecutar la carga de datos
        // Execute data fetching
        fetchGymData();

    }, [id, navigate]); // Dependencias: re-ejecutar si cambian ID o navigate // Dependencies: re-run if ID or navigate change


    // Renderizado mientras carga
    // Rendering while loading
    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando datos del gimnasio...</div>;
    }

    // Renderizado si hubo error o no se encontraron datos
    // Rendering if there was an error or no data found
    if (error || !gymData) {
        return (
            <div style={styles.container}>
                <h2>Error</h2>
                <p>{error || 'No se encontraron datos para este gimnasio.'}</p>
                <button onClick={() => navigate('/gyms')}>Volver a la lista</button>
            </div>
        );
    }

    // Renderizado principal (Placeholder del formulario)
    // Main rendering (Form placeholder)
    return (
        <div style={styles.container}>
            <h2>Editar Gimnasio: {gymData.name} (ID: {id})</h2>
            <p>Aquí irá el formulario precargado para editar los datos.</p>
             {/* //TODO: Implementar formulario con estados inicializados desde gymData */}
             {/* //TODO: Implement form with states initialized from gymData */}
             <pre>{JSON.stringify(gymData, null, 2)}</pre> {/* Mostrar datos temporalmente */}
        </div>
    );
};