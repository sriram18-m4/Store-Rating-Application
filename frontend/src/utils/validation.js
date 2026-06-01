export const validationRules = {
  nameMin: 20,
  nameMax: 60,
  addressMax: 400,
  passwordPattern: /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

export const messages = {
  name: 'Name must be between 20 and 60 characters.',
  email: 'Email must be valid.',
  address: 'Address is required and cannot exceed 400 characters.',
  password: 'Password must be 8-16 characters with one uppercase letter and one special character.',
  rating: 'Rating must be between 1 and 5.'
};

export const validateName = (value) => {
  const length = value.trim().length;
  return length >= validationRules.nameMin && length <= validationRules.nameMax;
};

export const validateEmail = (value) => validationRules.emailPattern.test(value.trim());

export const validateAddress = (value) => {
  const trimmed = value.trim();
  return trimmed.length > 0 && trimmed.length <= validationRules.addressMax;
};

export const validatePassword = (value) => validationRules.passwordPattern.test(value);

export const validateUserPayload = (payload, { passwordRequired = true } = {}) => {
  const errors = {};

  if (!validateName(payload.name || '')) {
    errors.name = messages.name;
  }

  if (!validateEmail(payload.email || '')) {
    errors.email = messages.email;
  }

  if (!validateAddress(payload.address || '')) {
    errors.address = messages.address;
  }

  if (passwordRequired && !validatePassword(payload.password || '')) {
    errors.password = messages.password;
  }

  if (!passwordRequired && payload.password && !validatePassword(payload.password)) {
    errors.password = messages.password;
  }

  return errors;
};

export const validateStorePayload = (payload) => {
  const errors = {};

  if (!validateName(payload.name || '')) {
    errors.name = messages.name;
  }

  if (!validateEmail(payload.email || '')) {
    errors.email = messages.email;
  }

  if (!validateAddress(payload.address || '')) {
    errors.address = messages.address;
  }

  return errors;
};
