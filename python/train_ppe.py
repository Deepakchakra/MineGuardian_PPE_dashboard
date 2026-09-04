from ultralytics import YOLO


def main():
    model = YOLO("yolo11n.pt")

    model.train(
        data="construction-ppe.yaml",
        epochs=30,
        imgsz=640,
        batch=8,
        workers=0,
        device=0,
        amp=True,
        project="runs",
        name="mineguardian_ppe",
    )


if __name__ == "__main__":
    main()