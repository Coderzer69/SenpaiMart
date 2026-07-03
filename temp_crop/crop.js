const Jimp = require('jimp');

async function cropImage() {
  try {
    const image = await Jimp.read('../frontend/public/logo.png');
    // Autocrop will remove borders of the same color as the top-left pixel (usually white or transparent)
    image.autocrop();
    await image.writeAsync('../frontend/public/logo-cropped.png');
    console.log('Successfully cropped and saved to logo-cropped.png');
    
    // Also save as logo-cropped.png in dist just in case, or we can just let Vite handle it
  } catch (error) {
    console.error('Error cropping image:', error);
  }
}

cropImage();
