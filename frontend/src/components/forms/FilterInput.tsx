/**
 * =============================================================================
 * COMPONENTE: FilterInput
 * COMPONENT:  FilterInput
 * =============================================================================
 *
 * Componente reutilizable para campos de entrada de filtro/búsqueda.
 * Encapsula la etiqueta, el campo de entrada y el texto de ayuda opcional,
 * aplicando estilos consistentes.
 *
 * Reusable component for filter/search input fields.
 * Encapsulates the label, input field, and optional help text,
 * applying consistent styling.
 *
 * =============================================================================
 */

import React from "react";

// Interfaz para las props del componente FilterInput.
// Interface for FilterInput component props.
interface FilterInputProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helpText?: string;
  type?: string; // Por ejemplo, "text", "email", "password" // e.g., "text", "email", "password"
  id?: string; // ID para la accesibilidad, si no se provee, se genera uno. // ID for accessibility, if not provided, one is generated.
}

// Estilos (inline) para el componente, consistentes con el proyecto.
// Inline styles for the component, consistent with the project.
const styles: { [key: string]: React.CSSProperties } = {
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
    flex: "1 1 200px", // Permite que el grupo se flexione en contenedores. // Allows the group to flex in containers.
  },
  label: {
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#495057",
  },
  input: {
    padding: "10px",
    fontSize: "1rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    minWidth: "200px",
    width: "100%", // Asegura que el input ocupe el espacio disponible. // Ensures the input takes available space.
  },
  helpText: {
    fontSize: "0.85em",
    color: "#6c757d",
    marginTop: "2px",
  },
};

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
    <div style={styles.filterGroup}>
      <label htmlFor={inputId} style={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={styles.input}
      />
      {helpText && <small style={styles.helpText}>{helpText}</small>}
    </div>
  );
};
