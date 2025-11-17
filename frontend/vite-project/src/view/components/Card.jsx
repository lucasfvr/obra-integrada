import React from "react";

function Card({ title, children }) {
    return (
        <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-2xl transition-shadow duration-300">
            {title && <h3 className="text-xl font-semibold mb-4">{title}</h3>}
            <div>{children}</div>
        </div>
    );
}

export default Card;
