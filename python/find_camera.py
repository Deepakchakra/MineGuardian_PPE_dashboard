import cv2
import time

CAMERA_INDEX = 2

print(f"[INFO] Trying camera index {CAMERA_INDEX}...")

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("[ERROR] Could not open camera.")
    raise SystemExit

print("[SUCCESS] Camera opened.")

time.sleep(1)

while True:
    ret, frame = cap.read()

    if not ret or frame is None:
        print("[ERROR] Camera opened but frame could not be read.")
        break

    cv2.imshow("Camera Index 2 Test", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()