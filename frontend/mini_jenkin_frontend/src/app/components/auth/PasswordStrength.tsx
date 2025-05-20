import React from 'react';

interface PasswordStrengthProps {
    password: string;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
    const calculateStrength = (): { strength: number; text: string; color: string } => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        const strengthMap = {
            0: { text: 'Very Weak', color: 'bg-red-500' },
            1: { text: 'Weak', color: 'bg-orange-500' },
            2: { text: 'Fair', color: 'bg-yellow-500' },
            3: { text: 'Good', color: 'bg-blue-500' },
            4: { text: 'Strong', color: 'bg-green-500' },
            5: { text: 'Very Strong', color: 'bg-green-600' }
        };

        return {
            strength,
            text: strengthMap[strength as keyof typeof strengthMap].text,
            color: strengthMap[strength as keyof typeof strengthMap].color
        };
    };

    const { strength, text, color } = calculateStrength();
    const width = (strength / 5) * 100;

    return (
        <div className="mt-2">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`h-full ${color} transition-all duration-300`}
                    style={{ width: `${width}%` }}
                />
            </div>
            <p className="text-sm mt-1 text-gray-600">
                Password Strength: <span className="font-medium">{text}</span>
            </p>
        </div>
    );
};

export default PasswordStrength;