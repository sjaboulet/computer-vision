import os
import json
import fitz
from PIL import Image, ImageDraw

# Local module imports
from config import UI_COLORS
from vision_engine import load_vision_models, detect_layout
from extraction_engine import smart_extraction


def run_pipeline(pdf_path):
    print(f"\nPipeline started on: {pdf_path}")

    output_folder = "label_image_output"
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    # Load PDF and convert first page to Image
    try:
        doc = fitz.open(pdf_path)
        page = doc.load_page(0)

        # Zoom x2 for better detection resolution
        pix = page.get_pixmap(matrix=fitz.Matrix(2, 2))
        image = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)

        scale_x = page.rect.width / image.width
        scale_y = page.rect.height / image.height
    except Exception as e:
        print(f"Error opening PDF: {e}")
        return []

    # --- Step 1: Vision ---
    det_model, det_processor = load_vision_models()
    final_zones = detect_layout(image, det_model, det_processor)

    # --- Step 2: Extraction ---
    print(f"Extracting content from {len(final_zones)} zones...")
    draw = ImageDraw.Draw(image)
    layout_data = []

    for i, zone in enumerate(final_zones):
        box = zone["coordinates"]
        label = zone["type"]

        content, method = smart_extraction(
            page, box, scale_x, scale_y, image_full=image
        )

        # Debug Visualization
        color = UI_COLORS.get(label, "gray")
        draw.rectangle(box, outline=color, width=3)
        draw.rectangle([box[0], box[1] - 20, box[0] + 150, box[1]], fill=color)
        draw.text((box[0] + 5, box[1] - 15), f"{label} ({method})", fill="white")

        # Save individual crop
        crop_path = os.path.join(output_folder, f"zone_{i}_{label}.png")
        try:
            image.crop(
                (
                    max(0, box[0] - 5),
                    max(0, box[1] - 5),
                    min(image.width, box[2] + 5),
                    min(image.height, box[3] + 5),
                )
            ).save(crop_path)
        except:
            pass

        layout_data.append(
            {
                "id": i,
                "type": label,
                "extraction_method": method,
                "content": content,
                "ui_color": color,
                "coordinates": box,
                "image_path": crop_path,
            }
        )

    debug_image_name = "Result_Visual.png"
    image.save(debug_image_name)

    return layout_data, debug_image_name


if __name__ == "__main__":
    pdf_file = "./Attestation_Navigo (1).pdf"

    if os.path.exists(pdf_file):
        data, debug_img = run_pipeline(pdf_file)

        json_output = "Result.json"
        with open(json_output, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

        print("\nDONE.")
        print(f"JSON Data: {os.path.abspath(json_output)}")
        print(f"Debug Image: {os.path.abspath(debug_img)}")

    else:
        print(f"File not found: {pdf_file}")
