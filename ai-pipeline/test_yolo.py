import sys
import os
import shutil
from huggingface_hub import hf_hub_download
from ultralytics import YOLO
import fitz
import cv2

MODEL_REPO = "hantian/yolo-doclaynet"
MODEL_FILENAME = "yolov8m-doclaynet.pt"
LOCAL_MODEL_NAME = "yolov8m-doclaynet.pt"


def get_model():
    if not os.path.exists(LOCAL_MODEL_NAME):
        print(f"Model not found locally. Downloading from {MODEL_REPO}...")
        try:
            cached_path = hf_hub_download(repo_id=MODEL_REPO, filename=MODEL_FILENAME)
            shutil.copy(cached_path, LOCAL_MODEL_NAME)
            print(f"Model downloaded and saved as : {LOCAL_MODEL_NAME}")
        except Exception as e:
            print(f"Error: {e}")
            sys.exit(1)
    else:
        print(f"Model found locally : {LOCAL_MODEL_NAME}")

    return YOLO(LOCAL_MODEL_NAME)


def convert_pdf_to_image(pdf_path):
    print(f"Conversion of PDF to image : {pdf_path}")
    try:
        doc = fitz.open(pdf_path)
        page = doc[0]
        pix = page.get_pixmap(dpi=300)
        image_path = pdf_path.replace(".pdf", ".png")
        pix.save(image_path)
        return image_path
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if len(sys.argv) < 2:
    print("Usage: python3 run_yolo.py <file.pdf or image.png>")
    sys.exit(1)

input_path = sys.argv[1]


model = get_model()


if input_path.lower().endswith(".pdf"):
    image_path = convert_pdf_to_image(input_path)
else:
    image_path = input_path

if not os.path.exists(image_path):
    print(f"Error: {image_path}")
    sys.exit(1)

print(f"Analysis of {image_path}...")


results = model.predict(image_path, conf=0.25, save=False, verbose=False)


image = cv2.imread(image_path)
count = 0

for result in results:
    for box in result.boxes:
        count += 1
        x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
        cls_id = int(box.cls[0])
        label = result.names[cls_id]
        conf = float(box.conf[0])

        cv2.rectangle(image, (x1, y1), (x2, y2), (0, 255, 0), 2)

        text = f"{label} {conf:.2f}"
        (w, h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(image, (x1, y1 - 20), (x1 + w, y1), (0, 255, 0), -1)
        cv2.putText(
            image, text, (x1, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1
        )


output_file = f"result_{os.path.basename(image_path)}"
cv2.imwrite(output_file, image)

print(f"Done ! {count} items detected.")
print(f"Result saved in : {output_file}")
