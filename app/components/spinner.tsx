import React from "react";

const Spinner: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <span
    className="inline-block animate-spin border-2 border-t-emerald-500 border-r-emerald-500 border-b-transparent border-l-transparent rounded-full"
    style={{ width: size, height: size }}
    aria-label="Loading"
  />
);

export default Spinner;
