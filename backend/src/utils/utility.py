def clean_unicode(obj):
    """
    Clean Unicode characters from a string, dictionary, list, or tuple.

    Replaces problematic Unicode characters with ASCII equivalents,
    and removes any other non-ASCII characters.

    Returns a new object with the modified values.
    """
    if isinstance(obj, str):
        # replace problematic Unicode characters
        replacements = {
            "\u2019": "'",  # Right single quotation mark
            "\u2018": "'",  # Left single quotation mark
            "\u201c": '"',  # Left double quotation mark
            "\u201d": '"',  # Right double quotation mark
            "\u2013": "-",  # En dash
            "\u2014": "--",  # Em dash
            "\u2026": "...",  # Horizontal ellipsis
        }
        for unicode_char, ascii_char in replacements.items():
            obj = obj.replace(unicode_char, ascii_char)

        return obj.encode("ascii", "ignore").decode("ascii")
    elif isinstance(obj, dict):
        return {clean_unicode(k): clean_unicode(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [clean_unicode(item) for item in obj]
    elif isinstance(obj, tuple):
        return tuple(clean_unicode(item) for item in obj)
    else:
        return obj
