import fitz

try:
    import pytesseract
except ImportError:
    print("Warning: pytesseract not installed. OCR will fail on images.")


def smart_extraction(page, box, scale_x, scale_y, image_full=None):
    """
    1. Try native PDF text extraction (fast/accurate).
    2. Fallback to OCR if text is missing but area is large (scanned document).
    """
    # 1. Native Extraction
    rect = fitz.Rect(
        box[0] * scale_x, box[1] * scale_y, box[2] * scale_x, box[3] * scale_y
    )

    text = page.get_text("text", clip=rect, flags=fitz.TEXT_PRESERVE_WHITESPACE)
    clean_text = text.replace("\n", " ").strip()

    # Heuristic to detect scanned images: Large area but very little text
    box_area = (box[2] - box[0]) * (box[3] - box[1])
    is_scan = len(clean_text) < 3 and box_area > 500

    method = "native"

    # 2. OCR Fallback
    if is_scan and image_full:
        method = "ocr_tesseract"
        crop = image_full.crop((box[0], box[1], box[2], box[3]))
        try:
            # Config: French + English, assume single text block
            ocr_text = pytesseract.image_to_string(
                crop, lang="fra+eng", config="--psm 6"
            )
            clean_text = ocr_text.replace("\n", " ").strip()
        except Exception as e:
            clean_text = f"[OCR Error: {e}]"

    return clean_text, method
