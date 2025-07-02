import React from "react";

export const Card = ({ className = "", children }) => (
  <div className={`bg-white p-4 rounded-2xl shadow ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children }) => (
  <div className="text-sm text-gray-800">{children}</div>
);
