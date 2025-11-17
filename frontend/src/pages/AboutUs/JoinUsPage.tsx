/**
 * =============================================================================
 * COMPONENTE: JoinUsPage
 * COMPONENT: JoinUsPage
 * =============================================================================
 *
 * Página de aterrizaje que dirige a los usuarios a la acción correcta:
 * 1. Socios que quieren registrarse.
 * 2. Gimnasios que quieren unirse a la red.
 *
 * Landing page that directs users to the correct action:
 * 1. Members wanting to register.
 * 2. Gyms wanting to join the network.
 *
 * =============================================================================
 */

import { Link } from 'react-router-dom';
import { CloseButton } from '../../components/ui/CloseButton';
// Importar iconos para los botones
// Import icons for the buttons
import { FaUserPlus, FaBuilding } from 'react-icons/fa';

/* =============================================================================
    ESTILOS (inline)
    STYLES (inline)
    ============================================================================= */
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '20px',
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  title: {
    textAlign: 'center',
    fontSize: '2rem',
    color: '#333',
    marginBottom: '30px',
  },
  cardsContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '30px',
    flexWrap: 'wrap',
  },
  ctaCard: {
    flex: 1, // Las dos tarjetas crecen igual
    minWidth: '300px',
    padding: '30px 25px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    textAlign: 'center',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  ctaCardHover: {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 15px rgba(0,0,0,0.1)',
  },
  iconWrapper: {
    fontSize: '3rem',
    color: '#007bff',
    marginBottom: '15px',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '600',
    color: '#333',
    marginBottom: '10px',
  },
  cardText: {
    fontSize: '1rem',
    color: '#555',
    lineHeight: 1.6,
    marginBottom: '20px',
  },
  cardButton: {
    padding: '12px 25px',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#fff',
    backgroundColor: '#007bff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  cardButtonSecondary: {
    backgroundColor: '#6c757d',
  }
};

export const JoinUsPage = () => {
  return (
    <div style={styles.pageContainer}>
      {/* Botón de cierre con comportamiento por defecto (navigate(-1)) */}
      {/* Close button with default behavior (navigate(-1)) */}
      <CloseButton />

      <h1 style={styles.title}>Únete a la Revolución del Fitness</h1>

      <div style={styles.cardsContainer}>
        {/* --- Tarjeta 1: Soy un Socio --- */}
        {/* --- Card 1: register user --- */}
        <Link
          to="/register"
          style={styles.ctaCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.ctaCardHover.transform || '';
            e.currentTarget.style.boxShadow = styles.ctaCardHover.boxShadow || '';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div style={styles.iconWrapper}>
            <FaUserPlus />
          </div>
          <h2 style={styles.cardTitle}>Soy un Socio</h2>
          <p style={styles.cardText}>
            ¿Tu gimnasio ya es parte de la red? Regístrate aquí para activar
            tu pasaporte Gymnomads y empezar a visitar otros gimnasios.
          </p>
          <div style={styles.cardButton}>
            Registrarme Ahora
          </div>
        </Link>

        {/* --- Tarjeta 2: Soy un Gimnasio --- */}
        {/* --- card 2: Gym --- */}
        <Link
          to="/contact" 
          style={styles.ctaCard}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = styles.ctaCardHover.transform || '';
            e.currentTarget.style.boxShadow = styles.ctaCardHover.boxShadow || '';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = '';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          <div style={styles.iconWrapper}>
            <FaBuilding />
          </div>
          <h2 style={styles.cardTitle}>Soy un Gimnasio</h2>
          <p style={styles.cardText}>
            ¿Quieres atraer nuevos miembros y ofrecer un valor añadido
            increíble a tus socios actuales? Contacta con nosotros para
            unirte a la red.
          </p>
          <div style={{...styles.cardButton, ...styles.cardButtonSecondary}}>
            Contactar
          </div>
        </Link>
      </div>
    </div>
  );
};