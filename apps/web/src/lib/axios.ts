import axios from "axios";
import type { AxiosInstance } from "axios";

const createApiClient = (): AxiosInstance => {
  return axios.create({
    baseURL: `/api`,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
  });
};

export const Api = createApiClient();
