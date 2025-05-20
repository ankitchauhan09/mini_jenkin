import React from 'react';
import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';

interface FormInputProps {
    id: string;
    label: string;
    type: string;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    placeholder?: string;
    required?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
                                                 id,
                                                 label,
                                                 type,
                                                 register,
                                                 errors,
                                                 placeholder,
                                                 required = true
                                             }) => {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={id}
                type={type}
                {...register(id, { required: required && 'This field is required' })}
                className={`w-full px-4 py-2 text-black border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200
          ${errors[id] ? 'border-red-500' : 'border-gray-300'}`}
                placeholder={placeholder}
            />
            {errors[id] && (
                <p className="mt-1 text-sm text-red-600">
                    {errors[id]?.message?.toString()}
                </p>
            )}
        </div>
    );
};

export default FormInput;