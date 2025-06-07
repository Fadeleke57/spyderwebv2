def clean_metadata(metadata: dict) -> dict:
    """
    Clean the metadata dictionary by removing any keys that are not allowed.
    """
    accepted_web_keys = {"webId", "name", "description", "created", "updated"}
    accepted_source_keys = {
        "sourceId",
        "webId",
        "text",
        "type",
        "url",
        "websiteTitle",
        "videoTitle",
        "documentTitle",
        "noteTitle",
        "voiceNoteTitle",
        "videoDescription",
        "startTime",
        "endTime",
        "pageNumber",
    }

    keys = metadata.keys()
    result = {}
    for key in keys:
        if key in accepted_web_keys or key in accepted_source_keys:
            value = metadata[key]
            result[key] = (
                (value[:200] if value else "") + "..."
                if key == "videoDescription"
                else value
            )
    return result
