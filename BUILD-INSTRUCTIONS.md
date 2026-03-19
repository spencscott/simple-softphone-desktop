# Simple Softphone Desktop App - Build Instructions

Follow these steps on your **Windows computer** to build the Simple Softphone desktop installer.

---

## What You Need First

### 1. Node.js

1. Go to https://nodejs.org/
2. Click the big green **LTS** button to download
3. Run the installer — just click "Next" through everything, don't change any settings
4. When it finishes, you're done

**To verify it worked:**
- Press the **Windows key** on your keyboard
- Type **cmd** and press Enter (this opens Command Prompt)
- Type `node --version` and press Enter
- You should see something like `v20.x.x` — that means it worked

### 2. ImageMagick (creates the app icons from your logo)

- Open Command Prompt (Windows key → type "cmd" → Enter)
- Paste this and press Enter:
  ```
  winget install ImageMagick.ImageMagick
  ```
- Close Command Prompt when it finishes
- **Important:** You must close and reopen Command Prompt after installing this

---

## Building the Installer (Step by Step)

### Step 1: Download the electron-app folder

1. In Replit, find the `electron-app` folder in the file list on the left
2. Right-click it → **Download**
3. Save it somewhere easy to find, like your Desktop
4. If it downloads as a `.zip`, right-click it → **Extract All** → click **Extract**

### Step 2: Set your app URL

1. Find the `electron-app` folder you just downloaded
2. Open the `main.js` file — right-click it → **Open with** → **Notepad**
3. Near the top, you'll see this line:
   ```
   const APP_URL = "https://YOUR-APP-NAME.replit.app";
   ```
4. Replace `YOUR-APP-NAME` with your actual Replit app name. For example:
   ```
   const APP_URL = "https://simplesoftphone.replit.app";
   ```
5. Save the file (Ctrl+S) and close Notepad

### Step 3: Open Command Prompt in the right folder

1. Open the `electron-app` folder in File Explorer
2. Click in the **address bar** at the top (where it shows the folder path)
3. Type `cmd` and press **Enter**
4. A black Command Prompt window will open — it's already in the right folder

### Step 4: Install the required packages

In Command Prompt, paste this and press Enter:
```
npm install
```
Wait for it to finish. It will download everything needed. This takes 2-5 minutes.

### Step 5: Generate the app icons from your logo

In the same Command Prompt window, paste this and press Enter:
```
node generate-icons.js
```

You should see output like:
```
Generating Simple Softphone app icons...

Found ImageMagick (magick)

  Created icon-16.png
  Created icon-32.png
  Created icon-48.png
  Created icon-64.png
  Created icon-128.png
  Created icon-256.png
  Created icon.png (256x256)
  Created icon.ico

Done! All icons generated successfully.
```

### Step 6: Test it (optional but recommended)

In Command Prompt, paste this and press Enter:
```
npm start
```

A window should open showing Simple Softphone with your logo in the title bar and taskbar. If it looks good, close the window.

### Step 7: Build the Windows installer

In Command Prompt, paste this and press Enter:
```
npm run build
```

This takes 3-10 minutes. When it's done, you'll find your installer at:
```
electron-app\dist\Simple Softphone Setup 1.0.0.exe
```

---

## Installing Simple Softphone

1. Double-click **Simple Softphone Setup 1.0.0.exe**
2. If Windows shows "Windows protected your PC" — click **More info** → **Run anyway** (this is normal for unsigned apps)
3. Choose where to install (or just use the default)
4. Click **Install**
5. Simple Softphone will launch automatically

### What you get after installation

- **Desktop shortcut** — "Simple Softphone" icon on your desktop
- **Start Menu entry** — search "Simple Softphone" from the Start menu
- **System tray icon** — small icon in the bottom-right notification area
- **Starts with Windows** — enabled by default, toggle via tray menu
- **Tel: link handler** — click any phone number link on a webpage and it opens in Simple Softphone

### System Tray Options

Right-click the small icon in the system tray (bottom-right of your screen):

- **Show Simple Softphone** — brings the window to front
- **Start with Windows** — toggle auto-launch on/off
- **Minimize to Tray** — when enabled, clicking X minimizes instead of quitting
- **Quit Simple Softphone** — fully closes the app

---

## Setting Simple Softphone as Your Default Phone App

To make phone number links (tel: links) open in Simple Softphone:

1. Open **Windows Settings** (Windows key → type "Settings")
2. Click **Apps** → **Default apps**
3. Search for **tel**
4. Select **Simple Softphone**

---

## Updating

When you update the web app on Replit and publish it, the desktop app automatically gets the update — it loads the deployed URL, so there's nothing to rebuild.

If you need to update the Electron wrapper itself (like changing the icon or window settings):
1. Download the updated `electron-app` folder from Replit
2. Follow Steps 3-7 above again
3. Install the new `.exe` over the existing installation

---

## Troubleshooting

**"npm is not recognized"**
→ Node.js is not installed. Go back to the "What You Need First" section.

**Icon generation says "ImageMagick not found"**
→ Install ImageMagick (see instructions above), then close and reopen Command Prompt.

**Build fails with code signing error**
→ This is normal for unsigned apps. The installer still works fine — Windows just shows a warning the first time you run it.

**App shows a blank white screen**
→ Check that the URL in `main.js` is correct and that your Replit app is published/deployed.

**The icon still shows the old Electron logo**
→ Make sure you ran `node generate-icons.js` before building. Check that `build/icon.ico` exists in the electron-app folder.
