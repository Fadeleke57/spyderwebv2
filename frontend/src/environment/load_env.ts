const where = process.env.NEXT_PUBLIC_ENV || "dev";

const local_api_url = process.env.NEXT_PUBLIC_LOCAL_API_URL;
const prod_api_url = process.env.NEXT_PUBLIC_PROD_API_URL;

const local_client_url = process.env.NEXT_PUBLIC_LOCAL_CLIENT_URL;
const prod_client_url = process.env.NEXT_PUBLIC_PROD_CLIENT_URL;

export const environment = {
  environment: where,
  api_url: where === "dev" ? local_api_url : prod_api_url,
  client_url: where === "dev" ? local_client_url : prod_client_url,
};