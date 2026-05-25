# AEB Demo

Industrial-style Automatic Emergency Braking demo for NVIDIA Orin.

## Runtime Pipeline

```text
H.264 all-I-frame file or camera encoder
  -> UDP debug packet protocol
  -> UdpH264Receiver
  -> GStreamer nvv4l2decoder hardware decode
  -> NV12/YUV frame
  -> SimpleAebAlgorithm
  -> /aeb/decision
```

The core C++ library is dependency-light and testable without ROS2 or GStreamer. Orin-specific hardware decoding and ROS2 node integration are optional CMake targets.

## Local Build and Tests

```bash
CXX=g++ cmake -S . -B build -DAEB_DEMO_BUILD_TESTING=ON
cmake --build build
ctest --test-dir build --output-on-failure
```

## Orin Build

Install ROS2 and NVIDIA Jetson GStreamer development packages, then build with:

```bash
colcon build --cmake-args \
  -DAEB_DEMO_ENABLE_ROS2=ON \
  -DAEB_DEMO_ENABLE_GSTREAMER=ON \
  -DAEB_DEMO_BUILD_TESTING=ON
```

Run:

```bash
source install/setup.bash
ros2 launch aeb_demo aeb_demo.launch.py
```

## Debug H.264 UDP Sender

The debug sender reads an Annex-B H.264 file, extracts IDR access units, fragments each frame into UDP packets, and sends them at the requested frame rate.

```bash
./build/aeb_udp_h264_sender \
  --file sample_all_i.h264 \
  --ip 127.0.0.1 \
  --port 5600 \
  --fps 30 \
  --loop
```

The packet protocol is intentionally simple for demo use:

- 36-byte packed header with magic `AEB1`
- frame id and timestamp
- frame size
- packet index/count
- payload size
- max payload 1200 bytes

## AEB Algorithm Scope

The first demo algorithm is a deterministic ROI luma rule over the Y plane:

1. Select the forward ROI.
2. Count pixels darker than `dark_pixel_threshold`.
3. Compute dark-pixel ratio.
4. Trigger AEB only after `trigger_confirm_frames` consecutive risky frames.
5. Fail safe on invalid ROI.

This is a pipeline and integration demo, not a production AEB perception model.
