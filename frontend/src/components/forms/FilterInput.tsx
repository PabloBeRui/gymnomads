import React from "react";
import { Form, CloseButton } from "react-bootstrap";
import styles from "./FilterInput.module.scss";

// Interfaz para las props del componente FilterInput.
// Interface for FilterInput component props.
interface FilterInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void; // Nueva prop para limpiar el input
  placeholder?: string;
  type?: string;
  id?: string;
  icon?: React.ReactNode; // Nueva prop para el icono
}

export const FilterInput: React.FC<FilterInputProps> = ({
  label,
  value,
  onChange,
  onClear,
  placeholder,
  type = "text",
  id,
  icon,
}) => {
  // Generar un ID único si no se provee para la accesibilidad.
  // Generate a unique ID if not provided for accessibility.
  const inputId =
    id || `filter-input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Form.Group className={styles.filterGroup} controlId={inputId}>
      <Form.Label className="small fw-bold text-dark">{label}</Form.Label>
      <div className={styles.inputContainer}>
        {icon && <span className={styles.leadingIcon}>{icon}</span>}
        <Form.Control
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.input}
        />
        {value && (
          <CloseButton
            className={styles.clearButton}
            onClick={onClear}
            aria-label="Limpiar filtro"
          />
        )}
      </div>
    </Form.Group>
  );
};
