import React from "react";

function Button({ children, onClick, type = "button", variant = "primary" }) {
    const base = "px-6 py-3 font-semibold rounded-lg shadow-md transition-all duration-200 focus:outline-none focus:ring-2 ";
    
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus:ring-blue-500",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 active:bg-gray-400 focus:ring-gray-500",
        danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500",
    };

    return (
        <button type={type} onClick={onClick} className={base + (variants[variant] || variants.primary)}>
            {children}
        </button>
    );
}

export default Button;