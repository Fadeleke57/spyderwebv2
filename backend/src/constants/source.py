DOCUMENT_TYPES = {"document", "pdf", "ppt", "pptx", "doc", "docx"}
AUDIO_TYPES = {"audio", "mp3", "mp4", "webm", "wav", "voice_note"}
TEXT_TYPES = {"txt", "md", "website"}

MEDIA_TYPE_MAP = {
    # Documents
    "pdf": "application/pdf",
    "document": "application/pdf",
    "doc": "application/msword",
    "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "ppt": "application/vnd.ms-powerpoint",
    "pptx": "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "xls": "application/vnd.ms-excel",
    "xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "txt": "text/plain",
    "rtf": "application/rtf",
    "odt": "application/vnd.oasis.opendocument.text",
    "md": "text/markdown",
    "csv": "text/csv",
    "tsv": "text/tab-separated-values",
    "json": "application/json",
    "xml": "application/xml",
    # Images
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "bmp": "image/bmp",
    "webp": "image/webp",
    "tiff": "image/tiff",
    "svg": "image/svg+xml",
    # Audio
    "mp3": "audio/mpeg",
    "audio": "audio/mpeg",
    "voice_note": "audio/webm",  # internal voice note format
    "wav": "audio/wav",
    "aac": "audio/aac",
    "ogg": "audio/ogg",
    "flac": "audio/flac",
    "m4a": "audio/mp4",
    # Video
    "mp4": "video/mp4",
    "mov": "video/quicktime",
    "avi": "video/x-msvideo",
    "wmv": "video/x-ms-wmv",
    "webm": "video/webm",
    "mkv": "video/x-matroska",
    # Archives
    "zip": "application/zip",
    "tar": "application/x-tar",
    "gz": "application/gzip",
    "rar": "application/vnd.rar",
    "7z": "application/x-7z-compressed",
    # Code
    "html": "text/html",
    "css": "text/css",
    "js": "application/javascript",
    "ts": "application/typescript",
    "py": "text/x-python",
    "java": "text/x-java-source",
    "c": "text/x-c",
    "cpp": "text/x-c++",
    # Fonts
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
    "otf": "font/otf",
}
