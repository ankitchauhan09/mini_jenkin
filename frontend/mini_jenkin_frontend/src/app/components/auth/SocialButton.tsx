import React from 'react';
import { IconType } from 'react-icons';

interface SocialButtonProps {
    icon: IconType;
    onClick: () => void;
    label: string;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon: Icon, onClick, label }) => {
    return (
        <button
            onClick={onClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg
        text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500
        focus:ring-offset-2 transition-colors duration-200"
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
};

export default SocialButton;