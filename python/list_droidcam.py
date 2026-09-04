from pygrabber.dshow_graph import FilterGraph

graph = FilterGraph()
devices = graph.get_input_devices()

print("\n=== WINDOWS CAMERA DEVICES ===")

for i, device in enumerate(devices):
    print(f"Index {i}: {device}")

print("\n=== DONE ===")