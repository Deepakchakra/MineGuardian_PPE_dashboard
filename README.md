# ⛏️ MineGuardian
### Smart Mining Helmet & Real-Time Mine Safety Monitoring System

<p align="center">
  <img src="docs/images/mineguardian-banner.png" alt="MineGuardian Banner" width="100%">
</p>

<p align="center">
  <b>From reactive safety to real-time, intelligent mine protection.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-ESP32-000000?style=for-the-badge&logo=espressif" alt="ESP32">
  <img src="https://img.shields.io/badge/Firebase-Realtime%20Database-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/Frontend-Web%20Dashboard-2563EB?style=for-the-badge" alt="Frontend">
  <img src="https://img.shields.io/badge/IoT-Real--Time%20Monitoring-16A34A?style=for-the-badge" alt="IoT">
  <img src="https://img.shields.io/badge/Project-Mine%20Safety-F97316?style=for-the-badge" alt="Mine Safety">
</p>

---

## 📌 Overview

**MineGuardian** is a smart mining safety and worker-monitoring system built to improve situational awareness in underground mining environments.

The system combines a **sensor-equipped smart helmet**, **ESP32 wireless communication**, **Firebase Realtime Database**, and a **web-based monitoring dashboard** to provide live visibility into worker and environmental conditions.

The helmet continuously monitors:

- 🌡️ Temperature
- 💧 Humidity
- 🧪 MQ-2 gas level / methane-equivalent prototype reading
- ☁️ MQ-7 CO-equivalent prototype reading
- 📳 Vibration
- 📐 Acceleration and orientation
- 🔄 Gyroscope / rotational motion
- 🪖 Helmet motion and possible fall conditions
- 🚨 Local and dashboard-triggered emergency alerts
- 📍 RFID checkpoint-based worker positioning

The collected information is transmitted to Firebase and presented through a centralized dashboard for real-time monitoring and faster emergency response.

---

## 🎯 Problem Statement

Underground mine workers may be exposed to hazardous gases, excessive temperature, vibration, accidental falls, sudden impacts, and rapidly changing working conditions.

Traditional safety methods can depend heavily on manual observation and delayed reporting.

**MineGuardian addresses this gap by combining wearable sensing, wireless communication, centralized monitoring, and immediate alert mechanisms into one integrated system.**

---

## 💡 Key Features

| Feature | Description |
|---|---|
| 🪖 Smart Helmet | Wearable ESP32-based safety monitoring unit |
| 🧪 Gas Monitoring | MQ-2 and MQ-7 sensor-based gas-level monitoring |
| 🌡️ Environment Monitoring | DHT22 temperature and humidity sensing |
| 📳 Vibration Detection | Detects vibration events using SW-420 |
| 📐 Motion Monitoring | MPU-based acceleration and rotational sensing |
| 🛬 Fall Detection | Uses free-fall + impact / rotation logic |
| 🚨 Local Alarm | Red LED + buzzer during danger conditions |
| 🟢 Safety Indicator | Green LED during normal/warning operation |
| ☁️ Firebase IoT | Continuous cloud telemetry |
| 📊 Live Dashboard | Centralized real-time monitoring interface |
| 📢 Remote Alert | Operator can trigger an emergency alert remotely |
| ⏱️ Alert Countdown | 10 / 20 / 30 second dashboard-controlled alarm duration |
| 📡 RFID Positioning | Worker position is based on the most recently crossed RFID checkpoint |
| 🧭 Independent Checkpoints | Each checkpoint has its own forward direction; checkpoints are not connected into a route |

---

# 🏗️ System Architecture

<p align="center">
  <img src="docs/images/system-architecture.png" alt="MineGuardian System Architecture" width="92%">
</p>

### Data Flow

```text
┌─────────────────────┐
│   Smart Helmet      │
│       ESP32         │
└─────────┬───────────┘
          │
          ├── DHT22 ──────────────► Temperature / Humidity
          ├── MQ-2 ───────────────► Gas Level
          ├── MQ-7 ───────────────► CO Level
          ├── SW-420 ─────────────► Vibration
          └── MPU6050-compatible ─► Motion / Fall Detection
          │
          ▼
┌─────────────────────┐
│       Wi-Fi         │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ Firebase RTDB       │
│ Sensor Telemetry    │
│ + Independent Alert │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│   Web Dashboard     │
│ Live Monitoring     │
│ Alerts & Mine Map   │
└─────────────────────┘
```

---

# 🪖 Smart Helmet Hardware

<p align="center">
  <img src="docs/images/helmet-hardware.jpg" alt="MineGuardian Smart Helmet Hardware" width="75%">
</p>

### Main Components

| Component | Purpose |
|---|---|
| **ESP32 Dev Module** | Main controller + Wi-Fi communication |
| **DHT22** | Temperature and humidity |
| **MQ-2** | Combustible-gas sensing / prototype methane-equivalent indication |
| **MQ-7** | Carbon-monoxide sensing / prototype CO-equivalent indication |
| **SW-420** | Vibration detection |
| **MPU6050-compatible MPU** | Acceleration, gyroscope and motion detection |
| **Green LED** | Normal / warning indication |
| **Red LED** | Danger indication |
| **Buzzer** | Audible danger alarm |
| **RFID Reader + Tags** | Checkpoint-based worker positioning |

---

# 🔌 ESP32 Pin Configuration

| Device | ESP32 GPIO |
|---|---:|
| DHT22 Data | `GPIO 4` |
| MQ-2 Analog | `GPIO 34` |
| MQ-7 Analog | `GPIO 35` |
| SW-420 Vibration | `GPIO 27` |
| MPU SDA | `GPIO 21` |
| MPU SCL | `GPIO 22` |
| MPU Address | `0x68` |
| Green LED | `GPIO 25` |
| Red LED | `GPIO 26` |
| Buzzer | `GPIO 33` |

---

# 📡 Real-Time Firebase Structure

MineGuardian intentionally separates **sensor telemetry** from the **dashboard alert controller**.

### Sensor telemetry

```text
/MineGuardian/helmet_01
```

Example:

```json
{
  "temperature": 30.8,
  "temperature_status": "NORMAL",
  "humidity": 59.4,
  "mq2": {
    "ppm": 1.82,
    "status": "NORMAL"
  },
  "mq7": {
    "ppm": 0.4,
    "status": "NORMAL"
  },
  "vibration": {
    "raw": 0,
    "detected": false,
    "status": "NORMAL"
  },
  "mpu6050": {
    "connected": true,
    "who_am_i": 112,
    "accel_x": -0.19,
    "accel_y": -0.25,
    "accel_z": 0.99,
    "acceleration_magnitude": 1.04,
    "gyro_x": -4.08,
    "gyro_y": 1.34,
    "gyro_z": 1.47,
    "rotation_magnitude": 4.53
  }
}
```

### Independent dashboard alert tree

```text
/MineGuardian/alert/helmet_01/dashboard_alert
/MineGuardian/alert/helmet_01/dashboard_alert_duration
```

This keeps emergency-control data independent of the normal 1-second sensor telemetry path.

---

# 🚨 Alert System

The dashboard can trigger a remote alert for a selected duration.

Supported durations:

```text
10 seconds
20 seconds
30 seconds
```

### Alert behavior

```text
Dashboard
   │
   ├── dashboard_alert = true
   └── dashboard_alert_duration = 10 / 20 / 30
              │
              ▼
        ESP32 starts timer
              │
              ▼
        🔴 Red LED ON
        🔊 Buzzer ON
        🟢 Green LED OFF
              │
              ▼
      Duration counts down
              │
              ▼
        duration = 0
        dashboard_alert = false
```

During the countdown, **only the duration value changes**.

The normal sensor telemetry update does **not** reset or overwrite the alert fields.

---

# 🧭 RFID Checkpoint Positioning

MineGuardian uses a simple checkpoint-relative positioning model.

### Positioning rule

> **Each helmet is positioned only relative to the most recently crossed RFID checkpoint.**

Important design characteristics:

- Every checkpoint has its own **independent forward direction**.
- There is **no route connection** between checkpoints.
- Crossing a new checkpoint replaces the previous positional reference.
- Helmet location is interpreted relative to the latest checkpoint event.

<p align="center">
  <img src="docs/images/rfid-positioning.png" alt="RFID Checkpoint Positioning" width="85%">
</p>

---

# 📊 Dashboard

<p align="center">
  <img src="docs/images/dashboard-main.png" alt="MineGuardian Dashboard" width="95%">
</p>

The dashboard is designed to provide a single monitoring view for:

- Helmet status
- Environmental conditions
- Gas levels
- Motion and fall information
- Vibration events
- Worker/checkpoint information
- Mine map visualization
- Real-time emergency alerts

### Suggested Dashboard Screenshots

```text
docs/images/dashboard-main.png
docs/images/dashboard-alert.png
docs/images/mine-map.png
docs/images/helmet-details.png
```

Replace these files with your actual screenshots.

---

# 🧠 Safety Logic

MineGuardian classifies the helmet state using multiple sensor conditions.

### Temperature

```text
20°C – 50°C   → NORMAL
< 20°C        → WARNING
> 50°C        → DANGER
```

### Motion / Fall

The prototype considers:

```text
Acceleration < 0.50 g      → possible free-fall
Acceleration ≥ 2.50 g      → possible impact
Rotation ≥ 300 °/s         → strong rotation / danger
```

A free-fall event followed by an impact within the configured fall window is used as a possible fall condition.

### Outputs

```text
NORMAL / WARNING
    🟢 Green LED ON
    🔴 Red LED OFF
    🔊 Buzzer OFF

DANGER
    🟢 Green LED OFF
    🔴 Red LED ON
    🔊 Buzzer ON
```

---

# 🧪 Gas Sensor Notes

MineGuardian currently uses:

- **MQ-2** for combustible-gas sensing / prototype methane-equivalent indication
- **MQ-7** for CO-oriented sensing

The displayed gas values are intended for the **prototype monitoring dashboard**.

> ⚠️ **Important:** MQ-2 is a broad combustible-gas sensor and is not a methane-specific laboratory instrument. Likewise, accurate MQ-7 CO measurement requires the correct heater-cycle procedure and calibration. Therefore, the displayed PPM values should be treated as **estimated/prototype values**, not certified gas concentrations.

For the current project display, the MQ-2 value is scaled for the dashboard presentation so that:

```text
182 → 1.82
```

The underlying sensor acquisition and danger logic remain separate from this presentation scaling.

---

# ⚡ Power & Deployment

The helmet is designed to operate as a portable wearable IoT unit.

Recommended deployment considerations:

- Stable regulated supply for the ESP32 and sensors
- Common ground across connected modules
- Short, secure SDA/SCL wiring
- Appropriate I²C pull-up configuration
- Adequate current capacity for the gas-sensor heater loads
- Proper enclosure and strain relief for mine-environment deployment

For testing, verify sensor behavior under both **USB power** and the intended portable battery supply.

---

# 🧰 Software Stack

| Layer | Technology |
|---|---|
| Microcontroller | ESP32 |
| Firmware | Arduino / C++ |
| Wireless | Wi-Fi |
| Cloud Database | Firebase Realtime Database |
| Authentication | Firebase Authentication |
| Frontend | Web Dashboard |
| Visualization | Dashboard charts / mine map |
| Positioning | RFID checkpoints |
| Communication Pattern | Real-time sensor telemetry + independent alert control |

---

# 📁 Suggested Repository Structure

```text
MineGuardian/
│
├── README.md
│
├── firmware/
│   └── MineGuardian.ino
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── hooks/
│   └── ...
│
├── docs/
│   ├── images/
│   │   ├── mineguardian-banner.png
│   │   ├── system-architecture.png
│   │   ├── helmet-hardware.jpg
│   │   ├── dashboard-main.png
│   │   ├── dashboard-alert.png
│   │   ├── mine-map.png
│   │   ├── helmet-details.png
│   │   └── rfid-positioning.png
│   │
│   └── diagrams/
│       └── ...
│
└── hardware/
    ├── circuit-diagram.png
    └── pinout.png
```

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/MineGuardian.git
cd MineGuardian
```

## 2. ESP32 Firmware

Open:

```text
firmware/MineGuardian.ino
```

Configure:

- Wi-Fi credentials
- Firebase API key
- Firebase authentication
- Firebase Realtime Database URL

> 🔐 Never commit real passwords, API secrets, or private credentials to a public repository. Use environment variables, a secure local configuration file, or GitHub secrets where appropriate.

## 3. Connect the Hardware

Follow the pin map shown above.

Make sure:

- ESP32 GND and sensor GND are common
- MPU SDA → GPIO 21
- MPU SCL → GPIO 22
- Gas sensor analog outputs are connected to the correct ADC pins
- LEDs and buzzer are connected according to the active-high configuration used by the firmware

## 4. Upload Firmware

Select:

```text
Board: ESP32 Dev Module
```

Then select the correct serial port and upload the firmware using Arduino IDE.

## 5. Start the Dashboard

Place the frontend inside:

```text
frontend/
```

Install dependencies and start the development server according to the frontend project's package configuration.

---

# 🔬 Example Live Telemetry

Example operating state:

```text
Temperature       : 30.80 °C
Humidity          : 59.40 %
MQ2               : 1.82 ppm
MQ7               : 0.4 ppm
Vibration         : NORMAL
Acceleration      : ~1 g
Rotation           : Low
Motion Status     : NORMAL
Overall Status    : NORMAL
```

A normal stationary helmet should show an acceleration magnitude near **1 g**, with small gyroscope offsets depending on sensor calibration and mounting.

---

# 🛡️ Why MineGuardian?

MineGuardian combines several layers of protection instead of relying on a single sensor.

```text
           ┌────────────────────┐
           │   Smart Helmet     │
           └─────────┬──────────┘
                     │
      ┌──────────────┼──────────────┐
      ▼              ▼              ▼
 Environmental     Motion        Vibration
    Sensing       Monitoring      Detection
      │              │              │
      └──────────────┼──────────────┘
                     ▼
             ESP32 Intelligence
                     │
                     ▼
               Wi-Fi + Firebase
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
       Dashboard            Remote Alert
          │                     │
          └──────────┬──────────┘
                     ▼
               Faster Response
```

---

# 📈 Future Scope

The project can be extended toward:

- 📍 More precise underground localization
- 🛰️ Mesh / LoRa communication for low-connectivity zones
- 🤖 AI-based anomaly and fall detection
- 🧠 Sensor fusion for more reliable worker-state classification
- 📹 Camera-assisted safety monitoring
- 🔋 Battery-health and power monitoring
- 📡 Multiple-helmet fleet management
- 🗺️ Advanced digital mine mapping
- 🧪 Better gas calibration and certified sensing hardware
- ☁️ Historical analytics and predictive safety insights
- 🏭 Industry-grade ruggedization and certification

---

# 🏆 Project Highlights

### ✅ Real-Time
Live sensor telemetry is continuously transmitted to the cloud dashboard.

### ✅ Wearable
Safety monitoring is integrated directly into the worker's helmet.

### ✅ Multi-Sensor
Environmental and motion conditions are monitored together.

### ✅ Cloud Connected
Firebase enables centralized access to helmet data.

### ✅ Emergency Ready
Both automatic safety conditions and dashboard-triggered alerts are supported.

### ✅ Location Aware
RFID checkpoints provide a clear checkpoint-relative positioning model.

---

# 🎓 Academic / Hackathon Project

**Project Name:** MineGuardian  
**Domain:** IoT + Embedded Systems + Web Development + Mine Safety  
**Core Platform:** ESP32  
**Cloud:** Firebase Realtime Database  
**Application:** Underground Worker Safety & Monitoring  

<p align="center">
  <img src="docs/images/team-photo.jpg" alt="MineGuardian Team" width="70%">
</p>

> Replace `docs/images/team-photo.jpg` with your team photograph.

---

# 👨‍💻 Team

<p align="center">
  <b>MineGuardian Development Team</b>
</p>

Add your team members here:

```text
1. Name — Role
2. Name — Role
3. Name — Role
4. Name — Role
```

---

# 📜 License

Choose and add the license that matches your project.

Recommended for an open-source academic project:

```text
MIT License
```

---

# ⭐ Support the Project

If you find **MineGuardian** useful or interesting, consider giving the repository a ⭐ and sharing the project.

<p align="center">
  <b>MineGuardian — Safer Mines Through Connected Intelligence.</b>
</p>
