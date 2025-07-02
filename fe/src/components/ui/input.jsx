import React from "react";

export const Input = ({ value, onChange, placeholder }) => (
  <input
    type="text"
    className="w-full px-4 py-2 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);
