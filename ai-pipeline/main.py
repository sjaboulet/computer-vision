import fitz
from vision_engine import predict_layout
import cv2
import os
import pytesseract
from PIL import Image


def draw_debug_image(image_path, layout_data, output_path):
    image = cv2.imread(image_path)
    for block in layout_data:
        x1, y1, x2, y2 = block["bbox"]
        label = block["type"]
        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)
        cv2.putText(
            image, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2
        )
    cv2.imwrite(output_path, image)


def run_pipeline(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=300)

    image_filename = pdf_path.replace(".pdf", ".png")
    pix.save(image_filename)

    layout_data = predict_layout(image_filename)
    full_image = Image.open(image_filename)
    final_blocks = []

    for block in layout_data:
        box = block["bbox"]

        crop = full_image.crop((box[0], box[1], box[2], box[3]))

        try:
            text = pytesseract.image_to_string(crop, lang="fra+eng")
        except:
            text = ""

        block["content"] = text.strip().replace("\n", " ")
        final_blocks.append(block)

    debug_image_name = f"debug_{os.path.basename(image_filename)}"
    draw_debug_image(image_filename, layout_data, debug_image_name)

    return final_blocks, debug_image_name
