import { useState } from "react";
import axios from "axios";

type ValidationErrors = { [key: string]: string };

type ValidationRules = {
  required?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: RegExp;
  matchField?: string;
};

export const useFormValidation = () => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = (
    formValues: { [key: string]: string },
    validationRules: { [key: string]: ValidationRules }
  ): boolean => {
    let valid = true;
    const newErrors: ValidationErrors = {};

    Object.keys(formValues).forEach((field) => {
      const value = formValues[field];
      const rules = validationRules[field];

      if (rules?.required && !value.trim()) {
        newErrors[field] = "This field is required";
        valid = false;
      }

      if (rules?.maxLength && value.length > rules.maxLength) {
        newErrors[field] = `Maximum length is ${rules.maxLength} characters`;
        valid = false;
      }

      if (rules?.minLength && value.length < rules.minLength) {
        newErrors[field] = `Minimum length is ${rules.minLength} characters`;
        valid = false;
      }

      if (rules?.pattern && !rules.pattern.test(value)) {
        newErrors[field] = "Invalid format";
        valid = false;
      }

      if (rules?.matchField && formValues[rules.matchField] !== value) {
        newErrors[field] = "Password confirmation does not match.";
        valid = false;
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/users/check-email`, {
        params: { email },
      });

      if (response.data.exists) {
        setErrors((prev) => ({
          ...prev,
          email: "The email has already been taken",
        }));
        return true;
      }

      return false;
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  return { errors, validateForm, setErrors, checkEmailExists };
};