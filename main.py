from pymongo import MongoClient

uri = "mongodb+srv://spy:2ppRX7fEXUBKfBbR@cluster0.dzkndbz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(uri)

try:
    print(client.server_info())
    print("✅ Connected successfully.")
except Exception as e:
    print("❌ Failed to connect:", e)

