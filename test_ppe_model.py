import cv2
from ultralytics import YOLO

# ============================================================
# MINEGUARDIAN PPE DETECTION
# ============================================================

# YOLO model
MODEL_PATH = r"models\best.pt"

# OBS Virtual Camera
CAMERA_INDEX = 3

# Confidence threshold
CONFIDENCE = 0.35

# ============================================================
# CLASSES TO DETECT
# ============================================================

ALLOWED_CLASSES = [
    0,   # Boots
    3,   # Glove
    4,   # Hard_hat
    6,   # No-Boots
    9,   # No-Glove
    10,  # No-Helmet
    12,  # No-Vest
    14   # Vest
]

# ============================================================
# DISPLAY NAME MAPPING
# ============================================================
#
# IMPORTANT:
# These DO NOT change the model.
# They only change the text shown on the camera.
#
# Actual model:
# 3  = Glove
# 9  = No-Glove
#
# We are intentionally swapping those two displayed names.
#
# ============================================================

DISPLAY_NAMES = {
    0: "Boots",
    3: "No-Glove",
    4: "Helmet",
    6: "No-Boots",
    9: "Glove",
    10: "No-Helmet",
    12: "No-Vest",
    14: "Vest"
}

# ============================================================
# LOAD MODEL
# ============================================================

print("Loading YOLO model...")

model = YOLO(MODEL_PATH)

print("Model loaded successfully.")
print()
print("Actual model classes:")
for class_id in ALLOWED_CLASSES:
    print(f"  {class_id}: {model.names[class_id]}")

print()
print("MineGuardian display classes:")
for class_id in ALLOWED_CLASSES:
    print(f"  {class_id}: {DISPLAY_NAMES[class_id]}")

print()
print("Starting OBS Virtual Camera...")
print("Press Q to quit.")
print()

# ============================================================
# OPEN OBS VIRTUAL CAMERA
# ============================================================

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("ERROR: Could not open OBS Virtual Camera.")
    print(f"Camera index used: {CAMERA_INDEX}")
    exit()

print("OBS Virtual Camera started successfully.")

# ============================================================
# MAIN DETECTION LOOP
# ============================================================

while True:

    # --------------------------------------------------------
    # Read camera frame
    # --------------------------------------------------------

    ret, frame = cap.read()

    if not ret:
        print("ERROR: Could not read camera frame.")
        break

    # --------------------------------------------------------
    # YOLO inference
    # --------------------------------------------------------

    results = model.predict(
        source=frame,
        classes=ALLOWED_CLASSES,
        conf=CONFIDENCE,
        verbose=False
    )

    result = results[0]

    # --------------------------------------------------------
    # Copy original frame
    # --------------------------------------------------------

    annotated_frame = frame.copy()

    # --------------------------------------------------------
    # Process detections
    # --------------------------------------------------------

    if result.boxes is not None:

        for box in result.boxes:

            # Actual model class ID
            class_id = int(box.cls[0])

            # Confidence
            confidence = float(box.conf[0])

            # Actual model name
            actual_name = model.names[class_id]

            # Custom MineGuardian display name
            display_name = DISPLAY_NAMES.get(
                class_id,
                actual_name
            )

            # Bounding box coordinates
            x1, y1, x2, y2 = map(
                int,
                box.xyxy[0].tolist()
            )

            # ------------------------------------------------
            # Label
            # ------------------------------------------------

            label = f"{display_name} {confidence * 100:.0f}%"

            # ------------------------------------------------
            # Bounding box
            # ------------------------------------------------

            cv2.rectangle(
                annotated_frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            # ------------------------------------------------
            # Label background
            # ------------------------------------------------

            (text_width, text_height), baseline = cv2.getTextSize(
                label,
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                2
            )

            label_y1 = max(
                0,
                y1 - text_height - baseline - 8
            )

            label_y2 = y1

            cv2.rectangle(
                annotated_frame,
                (x1, label_y1),
                (x1 + text_width + 8, label_y2),
                (0, 255, 0),
                -1
            )

            # ------------------------------------------------
            # Display label
            # ------------------------------------------------

            cv2.putText(
                annotated_frame,
                label,
                (x1 + 4, y1 - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.6,
                (0, 0, 0),
                2,
                cv2.LINE_AA
            )

            # ------------------------------------------------
            # Terminal output
            # ------------------------------------------------

            print(
                f"Model: {actual_name:<15} "
                f"→ Display: {display_name:<15} "
                f"Confidence: {confidence:.2f}"
            )

    # ========================================================
    # MINEGUARDIAN HEADER
    # ========================================================

    cv2.putText(
        annotated_frame,
        "MINEGUARDIAN - AI PPE DETECTION",
        (20, 35),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.8,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )

    cv2.putText(
        annotated_frame,
        "LIVE",
        (20, 65),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        (0, 255, 0),
        2,
        cv2.LINE_AA
    )

    # ========================================================
    # SHOW CAMERA
    # ========================================================

    cv2.imshow(
        "MineGuardian - PPE Detection",
        annotated_frame
    )

    # ========================================================
    # QUIT
    # ========================================================

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

# ============================================================
# CLEANUP
# ============================================================

cap.release()
cv2.destroyAllWindows()

print()
print("MineGuardian PPE detection stopped.")