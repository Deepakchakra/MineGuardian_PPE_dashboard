import cv2
import numpy as np

CAMERA_INDEX = 1
WIDTH = 640
HEIGHT = 480

print("[INFO] Opening DroidCam with MSMF...")

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_MSMF)

if not cap.isOpened():
    print("[ERROR] Could not open DroidCam.")
    raise SystemExit

print("[SUCCESS] DroidCam opened.")

cap.set(cv2.CAP_PROP_FRAME_WIDTH, WIDTH)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, HEIGHT)
cap.set(cv2.CAP_PROP_CONVERT_RGB, 0)

print("[INFO] Reading raw frames...")
print("[INFO] Testing packed formats...")
print("[INFO] Press Q to quit.")

while True:

    ret, raw = cap.read()

    if not ret or raw is None:
        print("\n[ERROR] No frame received.")
        break

    if raw.size != WIDTH * HEIGHT * 2:
        print(
            f"\n[ERROR] Unexpected frame: "
            f"shape={raw.shape}, size={raw.size}"
        )
        break

    packed = raw.reshape((HEIGHT, WIDTH, 2))

    # ---------------------------------------------------------
    # 1. YUY2
    # ---------------------------------------------------------
    yuy2 = cv2.cvtColor(
        packed,
        cv2.COLOR_YUV2BGR_YUY2
    )

    # ---------------------------------------------------------
    # 2. UYVY
    # ---------------------------------------------------------
    uyvy = cv2.cvtColor(
        packed,
        cv2.COLOR_YUV2BGR_UYVY
    )

    # ---------------------------------------------------------
    # 3. YVYU
    # ---------------------------------------------------------
    yvyu = cv2.cvtColor(
        packed,
        cv2.COLOR_YUV2BGR_YVYU
    )

    # ---------------------------------------------------------
    # 4. RGB565
    # ---------------------------------------------------------
    rgb565 = cv2.cvtColor(
        packed,
        cv2.COLOR_BGR5652BGR
    )

    # ---------------------------------------------------------
    # Make 2x2 comparison
    # ---------------------------------------------------------
    top = np.hstack((yuy2, uyvy))
    bottom = np.hstack((yvyu, rgb565))

    comparison = np.vstack((top, bottom))

    labels = [
        ("YUY2", 20, 35),
        ("UYVY", WIDTH + 20, 35),
        ("YVYU", 20, HEIGHT + 35),
        ("RGB565", WIDTH + 20, HEIGHT + 35),
    ]

    for text, x, y in labels:
        cv2.putText(
            comparison,
            text,
            (x, y),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (255, 255, 255),
            2
        )

    cv2.imshow(
        "MineGuardian - DroidCam Format Diagnostic",
        comparison
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("\n[INFO] Camera stopped.")