# 3i SmartHome Favicon Setup Guide

## Your 3i Logo as Favicon

To use your 3i logo (red gradient circle with "3i" and WiFi signal) as the favicon:

### Required Favicon Files

Create these files using your 3i logo image:

1. **favicon.ico** (16x16, 32x32, 48x48 multi-size ICO file)

   - Convert your 3i logo to ICO format
   - Should contain multiple sizes in one file

2. **favicon-16x16.png** (16x16px)

   - Smallest favicon size for browser tabs

3. **favicon-32x32.png** (32x32px)

   - Standard favicon size

4. **apple-touch-icon.png** (180x180px)

   - For iOS devices when adding to home screen

5. **android-chrome-192x192.png** (192x192px)

   - For Android Chrome

6. **android-chrome-512x512.png** (512x512px)
   - High resolution for Android

### How to Create These Files

1. **Take your 3i logo image** (the red gradient circle)
2. **Use an online favicon generator** like:

   - https://favicon.io/favicon-converter/
   - https://realfavicongenerator.net/
   - https://www.favicon-generator.org/

3. **Upload your 3i logo** to the generator
4. **Download the generated files**
5. **Place them in** `3i-smarthome/client/public/`

### File Locations

All favicon files should be placed in: `3i-smarthome/client/public/`

The HTML head will automatically reference these files.
