/**
 * =============================================================================
 * COMPONENTE: FilterInput
 * COMPONENT:  FilterInput
 * =============================================================================
 *
 * Componente reutilizable para campos de entrada de filtro/búsqueda.
 * Encapsula la etiqueta, el campo de entrada y el texto de ayuda opcional,
 * aplicando estilos consistentes con React-Bootstrap y SASS Modules.
 *
 * Reusable component for filter/search input fields.
 * Encapsulates the label, input field, and optional help text,
 * applying consistent styling with React-Bootstrap and SASS Modules.
 *
 * =============================================================================
 */

import React from "react";
import { Form } from "react-bootstrap"; // Importar componentes de React-Bootstrap / Import React-Bootstrap components
import styles from "./FilterInput.module.scss"; // Importar el módulo SCSS / Import the SCSS module
import clsx from "clsx"; // Importar clsx / Import clsx

// Interfaz para las props del componente FilterInput.
// Interface for FilterInput component props.
interface FilterInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpText?: string;
  type?: string; // Por ejemplo, "text", "email", "password" / e.g., "text", "email", "password"
  id?: string; // ID para la accesibilidad, si no se provee, se genera uno. / ID for accessibility, if not provided, one is generated.
}

export const FilterInput: React.FC<FilterInputProps> = ({
  label,
  value,
  onChange,
  placeholder,
  helpText,
  type = "text",
  id,
}) => {
  // Generar un ID único si no se provee para la accesibilidad.
  // Generate a unique ID if not provided for accessibility.
  const inputId = id || `filter-input-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <Form.Group className={clsx("mb-3", styles.filterGroup)} controlId={inputId}>
      <Form.Label className="small fw-bold text-secondary">{label}</Form.Label>
      <Form.Control
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.input}
      />
      {helpText && <Form.Text muted>{helpText}</Form.Text>}
    </Form.Group>
  );
};
