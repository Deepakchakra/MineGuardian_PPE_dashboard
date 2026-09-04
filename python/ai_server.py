import cv2
import threading
import time
from pathlib import Path

from flask import Flask, Response, jsonify
from flask_cors import CORS
from ultralytics import YOLO


# ============================================================
# MINEGUARDIAN AI PPE SERVER
# OBS Virtual Camera -> YOLO -> Next.js Dashboard
# ============================================================

# ============================================================
# CONFIGURATION
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

MODEL_PATH = PROJECT_ROOT / "models" / "best.pt"

CAMERA_INDEX = 3

CONFIDENCE = 0.35

HOST = "127.0.0.1"

PORT = 8000


# ============================================================
# MINEGUARDIAN PPE CLASSES
# ============================================================

ALLOWED_CLASSES = [
    0,      # Boots
    3,      # Glove -> displayed as No-Glove
    4,      # Hard_hat -> displayed as Helmet
    6,      # No-Boots
    9,      # No-Glove -> displayed as Glove
    10,     # No-Helmet
    12,     # No-Vest
    14,     # Vest
]


# ============================================================
# DISPLAY NAME MAPPING
# ============================================================
#
# This changes ONLY the displayed name.
# It does not modify the trained model.
#
# Glove / No-Glove are intentionally swapped according to
# your live-camera testing.
# ============================================================

DISPLAY_NAMES = {
    0: "Boots",
    3: "No-Glove",
    4: "Helmet",
    6: "No-Boots",
    9: "Glove",
    10: "No-Helmet",
    12: "No-Vest",
    14: "Vest",
}


# ============================================================
# PPE STATUS COLORS
# ============================================================
#
# IMPORTANT:
#
# GREEN = PPE PRESENT
# RED   = PPE MISSING / WARNING
#
# Color is determined from the FINAL DISPLAY NAME.
# This is important because class 3 and class 9 are swapped
# for display.
# ============================================================

GREEN = (0, 255, 0)
RED = (0, 0, 255)
YELLOW = (0, 255, 255)
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
DARK = (25, 25, 25)


WARNING_NAMES = {
    "No-Helmet",
    "No-Glove",
    "No-Boots",
    "No-Vest",
}


# ============================================================
# FLASK
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# SHARED STATE
# ============================================================

latest_detections = []

latest_frame = None

frame_lock = threading.Lock()

server_running = True

camera_status = False

last_error = None


# ============================================================
# LOAD MODEL
# ============================================================

print("=" * 70)
print("                 MINEGUARDIAN AI PPE SERVER")
print("=" * 70)
print()

print("[INFO] Project root:")
print(f"       {PROJECT_ROOT}")

print()

print("[INFO] Loading PPE model:")
print(f"       {MODEL_PATH}")


if not MODEL_PATH.exists():

    print()
    print("[ERROR] Model file was not found.")
    print()

    print("Expected:")
    print(f"       {MODEL_PATH}")

    print()

    print("Make sure your folder looks like:")
    print("       MineGuardian_PPE_dashboard")
    print("       ├── models")
    print("       │   └── best.pt")
    print("       ├── python")
    print("       │   └── ai_server.py")
    print("       └── src")

    raise FileNotFoundError(
        f"YOLO model not found: {MODEL_PATH}"
    )


try:

    model = YOLO(str(MODEL_PATH))

except Exception as error:

    print()
    print("[ERROR] Could not load YOLO model.")
    print(f"[ERROR] {error}")

    raise


print()
print("[SUCCESS] PPE model loaded.")
print()

print("[INFO] Original model classes:")

for class_id, class_name in model.names.items():

    print(
        f"  {class_id:2d}: {class_name}"
    )


print()
print("[INFO] MineGuardian active classes:")

for class_id in ALLOWED_CLASSES:

    original_name = model.names.get(
        class_id,
        "Unknown"
    )

    display_name = DISPLAY_NAMES.get(
        class_id,
        original_name
    )

    print(
        f"  {class_id:2d}: "
        f"{original_name} -> {display_name}"
    )


print()
print("[INFO] Warning classes:")

for warning_name in sorted(WARNING_NAMES):

    print(f"       {warning_name}")


# ============================================================
# OPEN OBS VIRTUAL CAMERA
# ============================================================

print()
print("[INFO] Opening OBS Virtual Camera...")
print(
    f"[INFO] Camera index: {CAMERA_INDEX}"
)


camera = cv2.VideoCapture(
    CAMERA_INDEX,
    cv2.CAP_DSHOW
)


if not camera.isOpened():

    print()
    print(
        "[ERROR] Could not open OBS Virtual Camera."
    )

    print()
    print("Check:")
    print("  1. OBS Studio is running.")
    print("  2. DroidCam OBS source is active.")
    print("  3. DroidCam phone is connected.")
    print("  4. OBS Virtual Camera is started.")
    print(
        f"  5. Camera index {CAMERA_INDEX} is correct."
    )

    raise RuntimeError(
        "OBS Virtual Camera could not be opened."
    )


# ============================================================
# CAMERA SETTINGS
# ============================================================

camera.set(
    cv2.CAP_PROP_FRAME_WIDTH,
    1280
)

camera.set(
    cv2.CAP_PROP_FRAME_HEIGHT,
    720
)

camera.set(
    cv2.CAP_PROP_FPS,
    30
)


actual_width = int(
    camera.get(
        cv2.CAP_PROP_FRAME_WIDTH
    )
)


actual_height = int(
    camera.get(
        cv2.CAP_PROP_FRAME_HEIGHT
    )
)


actual_fps = camera.get(
    cv2.CAP_PROP_FPS
)


camera_status = True


print()
print("[SUCCESS] OBS Virtual Camera opened.")

print(
    f"[INFO] Resolution: "
    f"{actual_width}x{actual_height}"
)

print(
    f"[INFO] FPS: "
    f"{actual_fps:.1f}"
)


# ============================================================
# DRAW DETECTION
# ============================================================

def draw_detection(
    frame,
    x1,
    y1,
    x2,
    y2,
    label,
    confidence,
    class_id
):

    # --------------------------------------------------------
    # CORRECT WARNING COLOR LOGIC
    # --------------------------------------------------------
    #
    # IMPORTANT:
    # Use the FINAL DISPLAY LABEL, NOT class_id.
    #
    # This prevents the Glove / No-Glove display swap from
    # breaking the warning color logic.
    # --------------------------------------------------------

    if label in WARNING_NAMES:

        box_color = RED

    else:

        box_color = GREEN


    # --------------------------------------------------------
    # Bounding box
    # --------------------------------------------------------

    cv2.rectangle(
        frame,
        (x1, y1),
        (x2, y2),
        box_color,
        2
    )


    # --------------------------------------------------------
    # Label
    # --------------------------------------------------------

    label_text = (
        f"{label} "
        f"{confidence * 100:.0f}%"
    )


    (
        text_width,
        text_height
    ), baseline = cv2.getTextSize(
        label_text,
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        2
    )


    label_top = max(
        0,
        y1 - text_height - baseline - 8
    )


    label_bottom = y1


    # --------------------------------------------------------
    # Label background
    # --------------------------------------------------------

    cv2.rectangle(
        frame,
        (x1, label_top),
        (
            x1 + text_width + 10,
            label_bottom
        ),
        box_color,
        -1
    )


    # --------------------------------------------------------
    # Label text
    # --------------------------------------------------------

    cv2.putText(
        frame,
        label_text,
        (
            x1 + 5,
            max(
                text_height + 2,
                y1 - 6
            )
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.6,
        BLACK,
        2,
        cv2.LINE_AA
    )


# ============================================================
# DRAW HEADER
# ============================================================

def draw_header(frame, detections):

    frame_width = frame.shape[1]


    # --------------------------------------------------------
    # Header background
    # --------------------------------------------------------

    cv2.rectangle(
        frame,
        (0, 0),
        (frame_width, 62),
        DARK,
        -1
    )


    # --------------------------------------------------------
    # Detection names
    # --------------------------------------------------------

    if detections:

        unique_names = []

        for detection in detections:

            name = detection["class"]

            if name not in unique_names:

                unique_names.append(name)


        detection_text = " | ".join(
            unique_names
        )

    else:

        detection_text = "No PPE detected"


    # --------------------------------------------------------
    # Header color
    # --------------------------------------------------------
    #
    # If ANY displayed detection is a warning class,
    # header becomes RED.
    #
    # Otherwise detected PPE is GREEN.
    # --------------------------------------------------------

    has_warning = any(
        detection["class"] in WARNING_NAMES
        for detection in detections
    )


    if has_warning:

        header_color = RED

    elif detections:

        header_color = GREEN

    else:

        header_color = YELLOW


    # --------------------------------------------------------
    # Header text
    # --------------------------------------------------------

    cv2.putText(
        frame,
        f"AI: {detection_text}",
        (20, 40),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.75,
        header_color,
        2,
        cv2.LINE_AA
    )


# ============================================================
# DRAW FOOTER
# ============================================================

def draw_footer(frame):

    frame_height = frame.shape[0]


    cv2.putText(
        frame,
        "MineGuardian AI PPE Detection",
        (
            20,
            frame_height - 20
        ),
        cv2.FONT_HERSHEY_SIMPLEX,
        0.65,
        WHITE,
        2,
        cv2.LINE_AA
    )


# ============================================================
# CAMERA + YOLO PROCESSING
# ============================================================

def process_camera():

    global latest_frame
    global latest_detections
    global camera_status
    global last_error


    print()
    print(
        "[INFO] AI processing thread started."
    )


    while server_running:

        # ----------------------------------------------------
        # Read camera
        # ----------------------------------------------------

        success, frame = camera.read()


        if not success or frame is None:

            camera_status = False

            print(
                "[WARNING] Camera frame unavailable."
            )

            time.sleep(0.1)

            continue


        camera_status = True


        try:

            # =================================================
            # YOLO
            # =================================================
            #
            # Ultralytics supports filtering predictions with
            # classes=[...], so only MineGuardian PPE classes
            # are returned.
            # =================================================

            results = model.predict(
                source=frame,
                conf=CONFIDENCE,
                classes=ALLOWED_CLASSES,
                verbose=False
            )


            result = results[0]


            # =================================================
            # DETECTIONS
            # =================================================

            detections = []


            if result.boxes is not None:

                for box in result.boxes:

                    # -----------------------------------------
                    # Class
                    # -----------------------------------------

                    class_id = int(
                        box.cls[0]
                    )


                    # -----------------------------------------
                    # Confidence
                    # -----------------------------------------

                    confidence = float(
                        box.conf[0]
                    )


                    # -----------------------------------------
                    # Original model name
                    # -----------------------------------------

                    original_name = model.names.get(
                        class_id,
                        "Unknown"
                    )


                    # -----------------------------------------
                    # MineGuardian display name
                    # -----------------------------------------

                    display_name = DISPLAY_NAMES.get(
                        class_id,
                        original_name
                    )


                    # -----------------------------------------
                    # Bounding box
                    # -----------------------------------------

                    x1, y1, x2, y2 = map(
                        int,
                        box.xyxy[0].tolist()
                    )


                    # -----------------------------------------
                    # Detection JSON
                    # -----------------------------------------

                    detections.append({

                        "class_id":
                            class_id,

                        "model_class":
                            original_name,

                        "class":
                            display_name,

                        "confidence":
                            round(
                                confidence,
                                3
                            ),

                        "warning":
                            display_name in WARNING_NAMES,

                        "status":
                            (
                                "WARNING"
                                if display_name in WARNING_NAMES
                                else "SAFE"
                            ),

                        "x1":
                            x1,

                        "y1":
                            y1,

                        "x2":
                            x2,

                        "y2":
                            y2

                    })


            # =================================================
            # CREATE ANNOTATED FRAME
            # =================================================

            annotated_frame = frame.copy()


            # -------------------------------------------------
            # Draw detections
            # -------------------------------------------------

            for detection in detections:

                draw_detection(

                    annotated_frame,

                    detection["x1"],

                    detection["y1"],

                    detection["x2"],

                    detection["y2"],

                    detection["class"],

                    detection["confidence"],

                    detection["class_id"]

                )


            # -------------------------------------------------
            # Header
            # -------------------------------------------------

            draw_header(
                annotated_frame,
                detections
            )


            # -------------------------------------------------
            # Footer
            # -------------------------------------------------

            draw_footer(
                annotated_frame
            )


            # =================================================
            # SAVE LATEST STATE
            # =================================================

            with frame_lock:

                latest_detections = detections

                latest_frame = (
                    annotated_frame.copy()
                )


            last_error = None


        except Exception as error:

            last_error = str(error)

            print(
                f"[ERROR] AI processing error: {error}"
            )

            time.sleep(0.1)


# ============================================================
# MJPEG VIDEO
# ============================================================

def generate_video():

    while server_running:

        with frame_lock:

            if latest_frame is None:

                frame = None

            else:

                frame = latest_frame.copy()


        if frame is None:

            time.sleep(0.01)

            continue


        success, encoded = cv2.imencode(

            ".jpg",

            frame,

            [
                cv2.IMWRITE_JPEG_QUALITY,
                85
            ]

        )


        if not success:

            continue


        frame_bytes = encoded.tobytes()


        yield (

            b"--frame\r\n"

            b"Content-Type: image/jpeg\r\n\r\n"

            + frame_bytes

            + b"\r\n"

        )


# ============================================================
# HOME API
# ============================================================

@app.route("/")
def home():

    return jsonify({

        "service":
            "MineGuardian AI PPE Server",

        "status":
            "running",

        "camera":
            "OBS Virtual Camera",

        "camera_index":
            CAMERA_INDEX,

        "camera_ready":
            camera_status,

        "model":
            str(MODEL_PATH),

        "confidence":
            CONFIDENCE,

        "allowed_classes":
            ALLOWED_CLASSES,

        "warning_classes":
            sorted(WARNING_NAMES)

    })


# ============================================================
# HEALTH API
# ============================================================

@app.route("/health")
def health():

    with frame_lock:

        detection_count = len(
            latest_detections
        )

        frame_ready = (
            latest_frame is not None
        )


    return jsonify({

        "status":
            "online",

        "camera":
            "OBS Virtual Camera",

        "camera_index":
            CAMERA_INDEX,

        "camera_ready":
            camera_status,

        "frame_ready":
            frame_ready,

        "model":
            str(MODEL_PATH),

        "detection_count":
            detection_count,

        "last_error":
            last_error

    })


# ============================================================
# VIDEO API
# ============================================================

@app.route("/video")
def video():

    return Response(

        generate_video(),

        mimetype=
            "multipart/x-mixed-replace; boundary=frame"

    )


# ============================================================
# DETECTIONS API
# ============================================================

@app.route("/detections")
def detections():

    with frame_lock:

        current_detections = list(
            latest_detections
        )


    warning_count = sum(
        1
        for detection in current_detections
        if detection["warning"]
    )


    safe_count = sum(
        1
        for detection in current_detections
        if not detection["warning"]
    )


    return jsonify({

        "timestamp":
            time.time(),

        "count":
            len(current_detections),

        "warning_count":
            warning_count,

        "safe_count":
            safe_count,

        "detections":
            current_detections

    })


# ============================================================
# START
# ============================================================

if __name__ == "__main__":

    processing_thread = threading.Thread(

        target=process_camera,

        daemon=True

    )


    processing_thread.start()


    print()
    print("=" * 70)

    print(
        "MineGuardian AI server is running"
    )

    print("=" * 70)

    print()

    print("Live video:")
    print(
        f"http://{HOST}:{PORT}/video"
    )

    print()

    print("Detection API:")
    print(
        f"http://{HOST}:{PORT}/detections"
    )

    print()

    print("Health:")
    print(
        f"http://{HOST}:{PORT}/health"
    )

    print()

    print("Service:")
    print(
        f"http://{HOST}:{PORT}/"
    )

    print()

    print("Press CTRL+C to stop.")

    print()

    try:

        app.run(

            host=HOST,

            port=PORT,

            debug=False,

            threaded=True,

            use_reloader=False

        )

    except KeyboardInterrupt:

        print()

        print(
            "[INFO] Shutting down..."
        )

    finally:

        server_running = False

        camera_status = False

        camera.release()

        print(
            "[INFO] Camera released."
        )

        print(
            "[INFO] MineGuardian AI server stopped."
        )
