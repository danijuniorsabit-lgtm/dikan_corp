const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^[+()\-\s0-9]{7,20}$/;

export const isRequired = (value) => typeof value === 'string' && value.trim().length > 0;

export const isValidEmail = (value) => EMAIL_PATTERN.test(value.trim());

export const isValidPhone = (value) => PHONE_PATTERN.test(value.trim());
