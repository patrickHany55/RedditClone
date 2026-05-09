export const getControllerErrorMessage = (error, fallback = "Server error") => {
  if (error.name === "ValidationError") {
    if (error.errors?.password?.kind === "minlength") {
      return "Password can't be less than 6 characters";
    }

    return Object.values(error.errors)
      .map((validationError) => validationError.message)
      .join(", ");
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    if (field) {
      return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`;
    }
    return "This record already exists";
  }

  if (error.name === "CastError") {
    return "Invalid ID format";
  }

  return fallback;
};

export const sendControllerError = (res, error, fallback = "Server error") => {
  const message = getControllerErrorMessage(error, fallback);
  const statusCode = ["ValidationError", "CastError"].includes(error.name) || error.code === 11000
    ? 400
    : 500;

  return res.status(statusCode).json({ message });
};
