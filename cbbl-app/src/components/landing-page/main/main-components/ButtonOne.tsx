import React, { ReactNode } from "react";

function ButtonOne({
  onClick,
  children,
}: {
  onClick?: () => void;
  children?: ReactNode; // ✅ Accept children
}) {
  return (
    <button className="button-style" onClick={onClick}>
      {children}
    </button>
  );
}

export default ButtonOne;
