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

import { Link, useNavigate } from 'react-router-dom';
import { CloseButton } from '../../components/ui/CloseButton';
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import styles from "./JoinUsPage.module.scss";
import clsx from "clsx";

export const JoinUsPage = () => {
  const navigate = useNavigate();

  const handleBackdropClick = () => {
    navigate(-1); // Navegar hacia atrás // Navigate back
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Detener propagación para no cerrar al hacer clic dentro // Stop propagation to not close on inner click
  };

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <Container
        className={styles.pageContainer}
        onClick={handleContainerClick}
      >
        <CloseButton
          onClick={() => navigate(-1)} // Ir a la página anterior // Go to previous page
          className={styles.closeButton}
          color="#FFB700"
          ariaLabel="Volver al inicio"
        />

        <h1 className={styles.title}>Únete a la Revolución del Fitness</h1>

        <Row className="justify-content-center g-4">
          {/* --- Tarjeta 1: Soy un Socio --- */}
          {/* --- Card 1: register user --- */}
          <Col md={6} lg={5}>
            <Card as={Link} to="/register" className={clsx(styles.ctaCard, "h-100")}>
              <div className={styles.cardImageWrapper}>
                <Card.Img 
                  variant="top" 
                  src="/images/join-us/socio.png" 
                  className={styles.cardImage}
                  alt="Imagen representativa de un socio entrenando"
                />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className={styles.cardTitle}>Soy un Socio</Card.Title>
                <Card.Text className={styles.cardText}>
                  ¿Tu gimnasio ya es parte de la red? Regístrate aquí para activar
                  tu pasaporte Gymnomads y empezar a visitar otros gimnasios.
                </Card.Text>
                <Button variant="primary" className={clsx(styles.cardButton, "mt-auto")}>
                  Registrarme Ahora
                </Button>
              </Card.Body>
            </Card>
          </Col>

          {/* --- Tarjeta 2: Soy un Gimnasio --- */}
          {/* --- card 2: Gym --- */}
          <Col md={6} lg={5}>
            <Card as={Link} to="/gym-contact" className={clsx(styles.ctaCard, "h-100")}>
              <div className={styles.cardImageWrapper}>
                 <Card.Img 
                    variant="top" 
                    src="/images/join-us/gimnasio.png" 
                    className={styles.cardImage}
                    alt="Imagen representativa de un gimnasio moderno"
                 />
              </div>
              <Card.Body className="d-flex flex-column">
                <Card.Title className={styles.cardTitle}>Soy un Gimnasio</Card.Title>
                <Card.Text className={styles.cardText}>
                  ¿Quieres atraer nuevos miembros y ofrecer un valor añadido
                  increíble a tus socios actuales? Contacta con nosotros para
                  unirte a la red.
                </Card.Text>
                <Button variant="secondary" className={clsx(styles.cardButton, "mt-auto")}>
                  Contactar
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};
