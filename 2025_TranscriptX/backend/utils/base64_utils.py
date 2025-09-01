import mimetypes
import base64

def get_file_extension(base64_string: str) -> str:
    if base64_string.startswith("data:"):
        try:
            header = base64_string.split(";")[0]
            mime_type = header.split(":")[1]
            ext = mimetypes.guess_extension(mime_type)
            return ext if ext else ""
        except Exception:
            return ""
    return ""

def get_file_size(base64_string: str) -> int:
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    padding = base64_string.count('=')
    total_length = len(base64_string)

    file_size = (3 * (total_length // 4)) - padding
    return file_size

def get_safe_base64(base64_string: str) -> bytes:
    if "," in base64_string:
        base64_string = base64_string.split(",", 1)[1]
    # Add padding if needed
    padding_needed = 4 - (len(base64_string) % 4)
    if padding_needed and padding_needed != 4:
        base64_string += "=" * padding_needed
    return base64.b64decode(base64_string)

