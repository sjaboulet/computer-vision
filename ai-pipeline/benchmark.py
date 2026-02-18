import time
import os
import fitz
import cv2
from PIL import Image


from vision_engine import predict_layout as yolo_predict

try:
    from surya.layout import batch_layout_detection
    from surya.model.detection.model import load_model, load_processor

    SURYA_AVAILABLE = True
    surya_model = load_model()
    surya_processor = load_processor()
    print("Surya loaded")
except ImportError:
    SURYA_AVAILABLE = False
    print("'surya-ocr' not installed. Only YOLO will be timed.")


VERTICAL_THRESHOLD = 15
HORIZONTAL_THRESHOLD = 15


def merge_close_boxes(box_list):
    if not box_list:
        return []
    sorted_boxes = sorted(box_list, key=lambda z: z["coordinates"][1])
    merged_list = []
    current = sorted_boxes[0]

    for next_box in sorted_boxes[1:]:
        c1, c2 = current["coordinates"], next_box["coordinates"]
        same_type = current["type"] == next_box["type"]
        aligned_x = abs(c1[0] - c2[0]) < HORIZONTAL_THRESHOLD
        distance_y = c2[1] - c1[3]

        if same_type and aligned_x and distance_y < VERTICAL_THRESHOLD:
            new_coords = [
                min(c1[0], c2[0]),
                min(c1[1], c2[1]),
                max(c1[2], c2[2]),
                max(c1[3], c2[3]),
            ]
            current["coordinates"] = new_coords
        else:
            merged_list.append(current)
            current = next_box
    merged_list.append(current)
    return merged_list


def surya_predict(image, model, processor):
    preds = batch_layout_detection([image], model, processor)
    raw_zones = []
    for zone in preds[0].bboxes:
        if hasattr(zone, "bbox"):
            box = [int(x) for x in zone.bbox]
        else:
            poly = zone.polygon
            xs = [p[0] for p in poly]
            ys = [p[1] for p in poly]
            box = [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))]
        raw_zones.append({"type": zone.label, "coordinates": box})
    return merge_close_boxes(raw_zones)


TEST_DIR = "test_cvs"
OUTPUT_DIR = "benchmark_results"

os.makedirs(TEST_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)


def pdf_to_image(pdf_path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    pix = page.get_pixmap(dpi=300)
    img_path = pdf_path.replace(".pdf", ".png")
    pix.save(img_path)
    return img_path


def run_benchmark():
    pdfs = [f for f in os.listdir(TEST_DIR) if f.endswith(".pdf")]
    if not pdfs:
        print(f"No PDF found in the folder '{TEST_DIR}'. Put some CVs in it")
        return

    print(f"Benchmark for {len(pdfs)} CVs\n")

    for pdf in pdfs:
        print(f"Current file : {pdf}")
        pdf_path = os.path.join(TEST_DIR, pdf)
        img_path = pdf_to_image(pdf_path)

        start_time = time.time()
        yolo_boxes = yolo_predict(img_path)
        yolo_time = time.time() - start_time
        print(f"YOLOv8 : {yolo_time:.2f} sec | {len(yolo_boxes)} blocs found")

        img_yolo = cv2.imread(img_path)
        for b in yolo_boxes:
            x1, y1, x2, y2 = b["bbox"]
            cv2.rectangle(img_yolo, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.imwrite(os.path.join(OUTPUT_DIR, f"YOLO_{pdf}.png"), img_yolo)

        if SURYA_AVAILABLE:
            img_pil = Image.open(img_path).convert("RGB")
            start_time = time.time()
            surya_boxes = surya_predict(img_pil, surya_model, surya_processor)
            surya_time = time.time() - start_time
            print(f"Surya  : {surya_time:.2f} sec | {len(surya_boxes)} blocs found")

            img_surya = cv2.imread(img_path)
            for b in surya_boxes:
                x1, y1, x2, y2 = b["coordinates"]
                cv2.rectangle(img_surya, (x1, y1), (x2, y2), (0, 0, 255), 3)
            cv2.imwrite(os.path.join(OUTPUT_DIR, f"SURYA_{pdf}.png"), img_surya)

        if os.path.exists(img_path):
            os.remove(img_path)


if __name__ == "__main__":
    run_benchmark()
