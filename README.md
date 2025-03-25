# SPYDRV2 Project Setup and Configuration

## Prerequisites

Before getting started, ensure you have the following installed:
- Node.js (version 18+)
- MongoDB and MongoDB account
- Neo4j and Neo4j account
- OpenAI Account
- Pinecone Account
- AWS Account
- YouTube Developer Account

## Environment Configuration

### 1. Create Environment File

Copy the `.env.example` to a new file named `.env`:

```bash
cd backend
cp .env.example .env
```

### 2. Environment Variables Explanation

#### Database Configuration
- `MONGO_INITDB_ROOT_USERNAME`: Root username for MongoDB
- `MONGO_INITDB_ROOT_PASSWORD`: Root password for MongoDB
- `MONGO_INITDB_DATABASE`: Name of the initial database
- `MONGO_URL`: Full connection URL for MongoDB

#### Graph Database
- `NEO4J_URI`: Connection URI for Neo4j database
- `NEO4J_USERNAME`: Neo4j database username
- `NEO4J_PASSWORD`: Neo4j database password

#### API Configuration
- `FASTAPI_ENV`: Environment (dev/prod)
- `FASTAPI_SECRET_KEY`: Secret key for FastAPI application (Generate a 16-digit HSA key)
- `FASTAPI_API_URL`: Base URL for FastAPI backend

#### OAuth2 Authentication
- `OAUTH2_CLIENT_ID`: OAuth2 provider client ID
- `OAUTH2_CLIENT_SECRET`: OAuth2 provider client secret
- `OAUTH2_REDIRECT_URI`: Callback URL for OAuth2 authentication

#### Frontend
- `NEXT_URL`: Base URL for Next.js frontend

#### Vector Database
- `PINECONE_API_KEY`: API key for Pinecone
- `PINECONE_INDEX_NAME`: Name of the Pinecone index

#### AI Services
- `OPENAI_API_KEY`: OpenAI API key for language models

#### Cloud Storage
- `S3_BUCKET_NAME`: AWS S3 bucket name
- `CLOUDFRONT_DOMAIN`: CloudFront distribution domain

#### External APIs
- `YOUTUBE_API_KEY`: YouTube Data API key
- `FIRECRAWL_API_KEY`: Firecrawl API key for web crawling

### 3. Sensitive Information

⚠️ **Important Security Notes**:
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore`
- Use strong, unique values for all secret keys
- Consider using a secrets management service in production

### 4. Getting Started

#### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python3 -m venv venv
   ```

3. Activate the virtual environment:
   ```bash
   # On macOS and Linux:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Start the FastAPI server:
   ```bash
   uvicorn src.main:app --reload
   ```

#### Frontend Setup (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Copy the environment example file:
   ```bash
   cp .env.example .env
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

#### Full Project Initialization

To set up both backend and frontend in one go:

```bash
# From project root
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

cd ../frontend
cp .env.example .env
npm install

# Run
make start
```


## Troubleshooting

- Ensure all required services are running
- Check that environment variables are correctly set
- Verify network connectivity between services

