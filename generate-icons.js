const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const buildDir = path.join(__dirname, "build");
const sourcePng = path.join(buildDir, "icon-source.png");
const pngPath = path.join(buildDir, "icon.png");
const icoPath = path.join(buildDir, "icon.ico");

console.log("Generating Simple Softphone app icons...\n");

if (!fs.existsSync(sourcePng)) {
  console.error("ERROR: build/icon-source.png not found!");
  console.error("Place your logo PNG in the electron-app/build/ folder as icon-source.png");
  process.exit(1);
}

const sizes = [16, 32, 48, 64, 128, 256];

function findImageMagick() {
  for (const cmd of ["magick", "convert"]) {
    try {
      execSync(`${cmd} -version`, { stdio: "pipe" });
      return cmd;
    } catch {
      continue;
    }
  }
  return null;
}

const magick = findImageMagick();

if (magick) {
  console.log(`Found ImageMagick (${magick})\n`);

  const isV7 = magick === "magick";

  for (const size of sizes) {
    const outPath = path.join(buildDir, `icon-${size}.png`);
    if (isV7) {
      execSync(`magick "${sourcePng}" -background none -resize ${size}x${size} "${outPath}"`, { stdio: "pipe", shell: true });
    } else {
      execSync(`convert -background none -resize ${size}x${size} "${sourcePng}" "${outPath}"`, { stdio: "pipe", shell: true });
    }
    console.log(`  Created icon-${size}.png`);
  }

  const icon256path = path.join(buildDir, "icon-256.png");
  if (fs.existsSync(icon256path)) {
    fs.copyFileSync(icon256path, pngPath);
    console.log("  Created icon.png (256x256)");
  }

  if (isV7) {
    execSync(`magick "${sourcePng}" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, { stdio: "pipe", shell: true });
  } else {
    execSync(`convert "${sourcePng}" -resize 256x256 -define icon:auto-resize=256,128,64,48,32,16 "${icoPath}"`, { stdio: "pipe", shell: true });
  }
  console.log("  Created icon.ico (with 256x256 layer)");

  console.log("\nDone! All icons generated successfully.");
  console.log("You can now run: npm run build");
} else {
  console.log("ImageMagick not found. Trying manual fallback...\n");

  fs.copyFileSync(sourcePng, pngPath);
  console.log("  Copied icon-source.png as icon.png");
  console.log("");
  console.log("NOTE: To generate a proper .ico file, install ImageMagick:");
  console.log("  winget install ImageMagick.ImageMagick");
  console.log("  (close and reopen Command Prompt after installing)");
  console.log("  Then run this script again: node generate-icons.js");
  console.log("");
  console.log("Alternatively, convert your PNG to ICO manually:");
  console.log("  1. Go to https://convertio.co/png-ico/");
  console.log("  2. Upload build/icon-source.png");
  console.log("  3. Download the .ico file and save it as build/icon.ico");
  console.log("");
  console.log("The build may still work with just the PNG, but the .ico");
  console.log("gives you the best icon quality on Windows.");
}
