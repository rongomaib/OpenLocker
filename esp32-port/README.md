# ALoT Locker UI - ESP32-S3 Port

This folder contains a complete C++ port of the React ALoT Locker UI, rewritten from the ground up to run natively on the ESP32-S3 inside your **WT32S3-28S PRO** using the LVGL graphics library.

## How to Flash this to your board

### 1. Install VS Code & PlatformIO
1. Download and install [Visual Studio Code](https://code.visualstudio.com/).
2. Open VS Code, go to Extensions, and search for **PlatformIO IDE**. Install it.

### 2. Open this project
1. Extract the `.zip` file of this project you downloaded from AI Studio.
2. In VS Code, go to **File > Open Folder...** and select *only* the `esp32-port` folder.

### 3. Configure TFT_eSPI (Crucial Step for WT32S3-28S)
The `WT32S3-28S PRO` has a specific pinout connecting the ESP32-S3 to the LCD. 
You must tell the `TFT_eSPI` library which pins to use. 
1. Go to `.pio/libdeps/wt32s3_28s/TFT_eSPI/User_Setup.h` (this folder generates after you open the project).
2. Or better yet, define them in `platformio.ini` (which I have pre-configured in the `platformio.ini` file for typical WT-32S3-28S boards). 
*Note: If your screen stays white, you may need to adjust the ILI9341 vs ST7789 driver flag in platformio.ini based on your exact board variant.*

### 4. Build and Upload
1. Plug your ESP32-S3 into your computer via USB (Make sure you plug into the "USB" or "OTG" port, not "UART" if there are two, though UART works for programming too).
2. Click the **Alien Icon** on the left sidebar (PlatformIO).
3. Click **Upload** under the `wt32s3_28s` environment.
4. The code will compile and push to the screen.

## What's implemented so far?
I have set up the core LVGL boilerplate, the custom theming system (Square edges, Chunky shadows, ALoT Colors), the **Welcome Screen**, and the **PIN Pad (Identify Screen)**.

Look inside `src/main.cpp` to see how the screens are constructed!