STORAGE_LIMITS_MB = {
    "free": 2048,
    "basic": 51200,
    "pro": 204800,
}

STORAGE_LIMITS_BYTES = {
    tier: mb * 1024 * 1024 for tier, mb in STORAGE_LIMITS_MB.items()
}
