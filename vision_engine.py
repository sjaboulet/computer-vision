import sys
from surya.layout import batch_layout_detection
from surya.model.detection.model import load_model, load_processor
from config import VERTICAL_THRESHOLD, HORIZONTAL_THRESHOLD


def load_vision_models():
    print("Loading Surya Layout models...")
    try:
        model = load_model()
        processor = load_processor()
        return model, processor
    except ImportError:
        print("Error: surya-ocr not found.")
        sys.exit(1)


def merge_close_boxes(box_list):
    """
    Post-processing: merges boxes that are visually close (same column, same type)
    to reconstruct paragraphs from fragmented lines.
    """
    if not box_list:
        return []

    # Sort by Y coordinate (top to bottom)
    sorted_boxes = sorted(box_list, key=lambda z: z["coordinates"][1])
    merged_list = []

    current = sorted_boxes[0]

    for next_box in sorted_boxes[1:]:
        c1, c2 = current["coordinates"], next_box["coordinates"]

        # Merge criteria: Same Label AND Aligned X AND Close Y
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


def detect_layout(image, model, processor):
    print("Running layout detection...")
    preds = batch_layout_detection([image], model, processor)

    raw_zones = []
    for zone in preds[0].bboxes:
        if hasattr(zone, "bbox"):
            box = [int(x) for x in zone.bbox]
        else:
            # Handle polygons
            poly = zone.polygon
            xs = [p[0] for p in poly]
            ys = [p[1] for p in poly]
            box = [int(min(xs)), int(min(ys)), int(max(xs)), int(max(ys))]

        raw_zones.append({"type": zone.label, "coordinates": box})

    return merge_close_boxes(raw_zones)
