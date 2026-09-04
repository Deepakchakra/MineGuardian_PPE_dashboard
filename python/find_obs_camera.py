import cv2

CAMERA_INDEX = 3

print(f"[INFO] Opening camera index {CAMERA_INDEX}...")

cap = cv2.VideoCapture(CAMERA_INDEX, cv2.CAP_DSHOW)

if not cap.isOpened():
    print("[ERROR] Could not open camera.")
    exit()

print("[SUCCESS] Camera opened.")

while True:
    ret, frame = cap.read()

    if not ret or frame is None:
        print("[ERROR] Could not read frame.")
        break

    cv2.imshow("MineGuardian - OBS Virtual Camera Test", frame)

    key = cv2.waitKey(1) & 0xFF

    if key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()