from src.models.user import Users
from src.db.mongodb import get_collection
from src.lib.logger.index import logger

Sources = get_collection("sources")

# Update size constants to be in MB
FILE_SIZE_ESTIMATES = {
    "pdf": {
        "base": 0.1,  # 0.1 MB base size
        "per_page": 0.05,  # 0.05 MB per page
    },
    "website": {
        "per_char": 0.000002,  # ~2 bytes per character converted to MB
        "base": 0.01,  # 0.01 MB base size
    },
    "youtube": {
        "per_char": 0.000002,  # ~2 bytes per character converted to MB
        "base": 0.02,  # 0.02 MB base size
    },
    "vector": 0.001,  # 0.001 MB per vector (1KB)
}

def calculate_storage_usage(user_id: str) -> float:
    """
    Calculate total storage usage for a user based on their sources
    Returns size in megabytes (MB)
    """
    try:
        sources = Sources.find({"userId": user_id})
        total_size = 0.0
        
        for source in sources:
            source_type = source.get("type", "unknown")
            
            if source_type == "pdf":
                pages = source.get("pages", 1)
                total_size += (
                    FILE_SIZE_ESTIMATES["pdf"]["base"] +
                    (pages * FILE_SIZE_ESTIMATES["pdf"]["per_page"])
                )
                
            elif source_type == "website":
                content = source.get("content", "")
                total_size += (
                    FILE_SIZE_ESTIMATES["website"]["base"] +
                    (len(content) * FILE_SIZE_ESTIMATES["website"]["per_char"])
                )
                
            elif source_type == "youtube":
                chunks = source.get("chunks", [])
                transcript_length = sum(len(chunk.get("text", "")) for chunk in chunks)
                total_size += (
                    FILE_SIZE_ESTIMATES["youtube"]["base"] +
                    (transcript_length * FILE_SIZE_ESTIMATES["youtube"]["per_char"])
                )
            
            # Add vector storage for all types
            chunks_count = len(source.get("chunks", [])) or 1
            total_size += chunks_count * FILE_SIZE_ESTIMATES["vector"]
            
        return round(total_size, 2)  # Round to 2 decimal places
        
    except Exception as e:
        logger.error(f"Error calculating storage for user {user_id}: {str(e)}")
        return 0.0