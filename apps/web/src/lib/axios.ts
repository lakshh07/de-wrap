import axios, { AxiosError } from "axios";
import type { AxiosInstance } from "axios";
import { toast } from "sonner";

type ApiVersion = "v1" | "v2";

const createApiClient = (version: ApiVersion = "v1"): AxiosInstance => {
  return axios.create({
    baseURL: `/api/${version}`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
};

export const Api = createApiClient();

export const getVersionedApi = (version: ApiVersion) =>
  createApiClient(version);

export const errorHandler = (error: Error | unknown) => {
  if (error instanceof AxiosError) {
    console.log(error);
    const message =
      error.response?.data.error ||
      error.response?.data.message ||
      error.message;
    toast.error(`Error: ${message}`);
  }
};
