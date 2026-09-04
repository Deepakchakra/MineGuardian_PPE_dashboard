import cv2
from ultralytics import YOLO

# ============================================================
# MineGuardian PPE Detection
# OBS Virtual Camera → YOLO
# ============================================================

MODEL_PATH = r"C:\Users\Kishor C\runs\detect\runs\mineguardian_ppe-5\weights\best.pt"
CAMERA_INDEX = 3
CONFIDENCE = 0.35

print("=" * 60)
print("       MINEGUARDIAN - AI PPE DETECTION")
print("=" * 60)

# ------------------------------------------------------------
# Load trained PPE model
# ------------------------------------------------------------

print("\n[INFO] Loading trained PPE model...")
print(f"[INFO] Model: {MODEL_PATH}")

model = YOLO(MODEL_PATH)

print("[SUCCESS] PPE model loaded.")

# Print model classes
print("\n[INFO] Model classes:")

for class_id, class_name in model.names.items():
    print(f"  {class_id}: {class_name}")

# ------------------------------------------------------------
# Open OBS Virtual Camera
# ------------------------------------------------------------

print(f"\n[INFO] Opening OBS Virtual Camera at index {CAMERA_INDEX}...")

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("[ERROR] Could not open OBS Virtual Camera.")
    print("[ERROR] Make sure OBS Virtual Camera is running.")
    exit()

# Try to use 1280x720
cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
cap.set(cv2.CAP_PROP_FPS, 30)

print("[SUCCESS] OBS Virtual Camera opened.")

# ------------------------------------------------------------
# Detection loop
# ------------------------------------------------------------

while True:

    ret, frame = cap.read()

    if not ret or frame is None:
        print("[ERROR] Could not read camera frame.")
        break

    # YOLO PPE detection
    results = model(
        frame,
        conf=CONFIDENCE,
        verbose=False
    )

    # Draw detections
    annotated_frame = results[0].plot()

    # --------------------------------------------------------
    # Display detection information
    # --------------------------------------------------------

    detections = results[0].boxes

    if detections is not None and len(detections) > 0:

        detected_names = []

        for box in detections:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            class_name = model.names[class_id]

            detected_names.append(
                f"{class_name} ({confidence:.0%})"
            )

        # Remove duplicates while preserving order
        detected_names = list(dict.fromkeys(detected_names))

        status_text = " | ".join(detected_names)

        cv2.putText(
            annotated_frame,
            status_text,
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 255, 0),
            2,
            cv2.LINE_AA
        )

    else:

        cv2.putText(
            annotated_frame,
            "No PPE detected",
            (20, 40),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.8,
            (0, 165, 255),
            2,
            cv2.LINE_AA
        )

    # Camera information
    cv2.putText(
        annotated_frame,
        "MineGuardian AI PPE Detection",
        (20, annotated_frame.shape[0] - 20),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        (255, 255, 255),
        2,
        cv2.LINE_AA
    )

    # Show result
    cv2.imshow(
        "MineGuardian - AI PPE Detection",
        annotated_frame
    )

    # Q = quit
    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

# ------------------------------------------------------------
# Cleanup
# ------------------------------------------------------------

cap.release()
cv2.destroyAllWindows()

print("\n[INFO] PPE detection stopped.")
print("[INFO] Camera released.")