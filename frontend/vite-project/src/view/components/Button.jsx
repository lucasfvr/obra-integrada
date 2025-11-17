import React from "react";

function Button({ children, onClick, type = "button", variant = "primary" }) {
    const base = "px-6 py-3 font-semibold rounded-lg shadow-md transition ";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
        danger: "bg-red-500 text-white hover:bg-red-600",
    };

    return (
        <button type={type} onClick={onClick} className={base + (variants[variant] || variants.primary)}>
            {children}
        </button>
    );
}

export default Button;
