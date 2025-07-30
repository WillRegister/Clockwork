import React from 'react';
import './CustomButton.css';

/**
 * A reusable button component with a neon glow effect. You can pass a
 * `variant` prop to slightly alter its appearance and a custom `style`
 * prop for additional inline styling. The button content is provided by
 * children.
 */
const CustomButton = ({ children, variant = 'default', onClick, style = {} }) => {
  return (
    <button
      className={`custom-button ${variant}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
};

export default CustomButton;