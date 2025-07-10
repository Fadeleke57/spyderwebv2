const environment = {
  api_url:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_PROD_API_URL
      : "http://localhost:8000",
};

export default environment;