export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }

  if (error?.response?.status === 400) {
    return "The request has invalid or missing information.";
  }

  if (error?.response?.status === 401) {
    return "You need to log in to do that.";
  }

  if (error?.response?.status === 403) {
    return "You do not have permission to do that.";
  }

  if (error?.response?.status === 404) {
    return "The requested item could not be found.";
  }

  if (error?.response?.status >= 500) {
    return "The server had a problem processing this request.";
  }

  if (error?.code === "ECONNABORTED") {
    return "The request took too long. Please try again.";
  }

  if (error?.message === "Network Error") {
    return "Could not reach the server. Make sure the backend is running and CORS is configured.";
  }

  return error?.message || fallback;
};
