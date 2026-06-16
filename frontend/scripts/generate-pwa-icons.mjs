import sharp from 'sharp'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '..', 'public')
const svgBuffer = readFileSync(resolve(publicDir, 'favicon.svg'))

async function generate() {
  // 192x192
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(resolve(publicDir, 'icon-192.png'))

  // 512x512
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(resolve(publicDir, 'icon-512.png'))

  // 512x512 maskable (icon within safe zone — 80% of canvas)
  const safeSize = Math.round(512 * 0.8) // 410
  const padding = Math.round((512 - safeSize) / 2) // 51
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 45, g: 106, b: 79, alpha: 1 }, // #2D6A4F
    },
  })
    .composite([
      {
        input: await sharp(svgBuffer)
          .resize(safeSize, safeSize)
          .png()
          .toBuffer(),
        top: padding,
        left: padding,
      },
    ])
    .png()
    .toFile(resolve(publicDir, 'icon-512-maskable.png'))

  console.log('PWA icons generated:')
  console.log('  - icon-192.png')
  console.log('  - icon-512.png')
  console.log('  - icon-512-maskable.png')
}

generate().catch((err) => {
  console.error('Failed to generate PWA icons:', err)
  process.exit(1)
})
