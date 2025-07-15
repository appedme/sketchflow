const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

// Favicon sizes
const faviconSizes = [16, 32, 48];

async function generateIcons() {
  const logoPath = path.join(__dirname, '../public/logo.svg');
  const iconsDir = path.join(__dirname, '../public/icons');
  const publicDir = path.join(__dirname, '../public');

  // Ensure icons directory exists
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  console.log('🎨 Generating PWA icons from logo.svg...');

  // Generate PWA icons
  for (const size of sizes) {
    const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);
    
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${size}x${size} icon`);
  }

  // Generate favicons
  console.log('🔖 Generating favicons...');
  
  for (const size of faviconSizes) {
    const outputPath = path.join(publicDir, `favicon-${size}x${size}.png`);
    
    await sharp(logoPath)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated favicon-${size}x${size}.png`);
  }

  // Generate main favicon.ico (32x32)
  const faviconPath = path.join(publicDir, 'favicon.ico');
  await sharp(logoPath)
    .resize(32, 32, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(faviconPath.replace('.ico', '.png'));
  
  // Rename to .ico (browsers will handle PNG in ICO format)
  fs.renameSync(faviconPath.replace('.ico', '.png'), faviconPath);
  
  console.log('✅ Generated favicon.ico');

  // Generate Apple Touch Icon
  const appleTouchIconPath = path.join(publicDir, 'apple-touch-icon.png');
  await sharp(logoPath)
    .resize(180, 180, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 }
    })
    .png()
    .toFile(appleTouchIconPath);
  
  console.log('✅ Generated apple-touch-icon.png');

  console.log('🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);