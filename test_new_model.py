from ultralytics import YOLO

MODEL_PATH = r"..\models\best.pt"

model = YOLO(MODEL_PATH)

print("\nModel loaded successfully.")
print("\nClasses:")

for class_id, class_name in model.names.items():
    print(f"{class_id}: {class_name}")