import axios from "axios";
import { environment } from "@/environment/load_env";

const api = axios.create({
  baseURL: environment.api_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

const mcpAPI = axios.create({
  baseURL: environment.mcp_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
    }
    return Promise.reject(error);
  }
);

export { api, mcpAPI };
