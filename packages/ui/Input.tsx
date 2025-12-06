import React from "react";

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => {
    return (
        <input
            {...props}
            className={`border px-3 py-2 rounded w-full ${props.className}`}
        />
    );
};
