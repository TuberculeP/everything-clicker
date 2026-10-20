import axios from "axios";
import type { AxiosError } from "axios";

const axiosClient = axios.create({
  baseURL: "/api",
  withCredentials: true, // Include cookies in requests
  headers: {
    "Content-Type": "application/json",
  },
});

const dataMethods = ["post", "put", "patch", "delete"] as const;

// Prefer the server message ({ message } from AppError / validation) over
// the generic Axios one ("Request failed with status code 400").
const getErrorMessage = (error: unknown) => {
  const axiosError = error as AxiosError<{ message?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    "An error occurred"
  );
};

const apiClient = {
  get: async <T>(url: string, params?: any) => {
    try {
      const result = await axiosClient.get<T>(url, { params });
      return {
        data: result.data,
        error: null,
      };
    } catch (error) {
      return {
        data: null,
        error: getErrorMessage(error),
      };
    }
  },

  ...dataMethods.reduce(
    (acc, method) => {
      acc[method] = async <T>(url: string, data?: any, config?: any) => {
        try {
          const isFormData = data instanceof FormData;
          const headers = isFormData
            ? { "Content-Type": "multipart/form-data", ...config?.headers }
            : config?.headers;

          const result = await axiosClient[method]<T>(url, data, {
            ...config,
            headers,
          });
          return {
            data: result.data,
            error: null,
          };
        } catch (error) {
          return {
            data: null,
            error: getErrorMessage(error),
          };
        }
      };
      return acc;
    },
    {} as Record<
      "post" | "put" | "patch" | "delete",
      <T>(
        url: string,
        data?: any,
        config?: any,
      ) => Promise<{ data: T; error: null } | { data: null; error: string }>
    >,
  ),
};

export default apiClient;
