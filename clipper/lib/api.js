import axios from "axios";
import environment from "./loadenv";

const api = axios.create({
  baseURL: environment.api_url,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

export { api };