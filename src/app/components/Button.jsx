// src/components/Button.jsx
import React from "react";
import PropTypes from "prop-types";

/**
 * Botón reutilizable
 * @param {string} label - Texto del botón
 * @param {function} onClick - Función al hacer clic
 */
export default function Button({ label, onClick }) {
  return (
    <button onClick={onClick} style={{ padding: "8px 16px" }}>
      {label}
    </button>
  );
}

Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func
};