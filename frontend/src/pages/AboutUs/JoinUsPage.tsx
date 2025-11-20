/**
 * =============================================================================
 * COMPONENTE: JoinUsPage
 * COMPONENT: JoinUsPage
 * =============================================================================
 *
 * Página de aterrizaje que dirige a los usuarios a la acción correcta:
 * 1. Socios que quieren registrarse.
 * 2. Gimnasios que quieren unirse a la red.
 * Refactorizado para usar React-Bootstrap y SASS Modules.
 *
 * Landing page that directs users to the correct action:
 * 1. Members wanting to register.
 * 2. Gyms wanting to join the network.
 * Refactored to use React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import { Link, useNavigate } from 'react-router-dom'; // Importar useNavigate // Import useNavigate
import { CloseButton } from '../../components/ui/CloseButton';
// Importar iconos para los botones / Import icons for the buttons
import { FaUserPlus, FaBuilding } from 'react-icons/fa';

// Importar componentes de React-Bootstrap / Import React-Bootstrap components
import { Container, Row, Col, Card, Button } from "react-bootstrap";

// Importar el módulo SCSS / Import the SCSS module
import styles from "./JoinUsPage.module.scss";
import clsx from "clsx"; // Importar clsx / Import clsx

export const JoinUsPage = () => {
  const navigate = useNavigate(); // Inicializar useNavigate // Initialize useNavigate

  return (
    <Container className={styles.pageContainer}>
      <CloseButton
        onClick={() => navigate(-1)}
        className={styles.closeButton}
        color="#FFB700"
        ariaLabel="Volver a la página anterior"
      />

      <h1 className={styles.title}>Únete a la Revolución del Fitness</h1>

      <Row className="justify-content-center g-4">
        {/* --- Tarjeta 1: Soy un Socio --- */}
        {/* --- Card 1: register user --- */}
        <Col md={6} lg={5}>
          <Card as={Link} to="/register" className={clsx(styles.ctaCard, "h-100")}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FaUserPlus />
              </div>
              <Card.Title className={styles.cardTitle}>Soy un Socio</Card.Title>
              <Card.Text className={styles.cardText}>
                ¿Tu gimnasio ya es parte de la red? Regístrate aquí para activar
                tu pasaporte Gymnomads y empezar a visitar otros gimnasios.
              </Card.Text>
              <Button variant="primary">
                Registrarme Ahora
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* --- Tarjeta 2: Soy un Gimnasio --- */}
        {/* --- card 2: Gym --- */}
        <Col md={6} lg={5}>
          <Card as={Link} to="/gym-contact" className={clsx(styles.ctaCard, "h-100")}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FaBuilding />
              </div>
              <Card.Title className={styles.cardTitle}>Soy un Gimnasio</Card.Title>
              <Card.Text className={styles.cardText}>
                ¿Quieres atraer nuevos miembros y ofrecer un valor añadido
                increíble a tus socios actuales? Contacta con nosotros para
                unirte a la red.
              </Card.Text>
              <Button variant="secondary">
                Contactar
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};