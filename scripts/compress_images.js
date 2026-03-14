
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const assetsDir = path.resolve(__dirname, '../src/assets');

// Helper to walk through directory
function walkSync(dir, filelist = []) {
    fs.readdirSync(dir).forEach(file => {
        const dirFile = path.join(dir, file);
        try {
            if (fs.statSync(dirFile).isDirectory()) {
                filelist = walkSync(dirFile, filelist);
            } else {
                filelist.push(dirFile);
            }
        } catch (err) {
            // Ignore
        }
    });
    return filelist;
}

async function compressImages() {
    const files = walkSync(assetsDir);
    const imageFiles = files.filter(file => /\.(png|jpg|jpeg|webp)$/i.test(file));

    console.log(`Found ${imageFiles.length} images to process to target ~30-40KB.`);

    for (const file of imageFiles) {
        const ext = path.extname(file).toLowerCase();
        const tempFile = file + '.tmp' + ext;

        try {
            const stats = fs.statSync(file);
            // Skip if already small enough (e.g. < 30KB)
            if (stats.size < 30 * 1024) {
                console.log(`Skipping ${path.basename(file)} (already ${stats.size / 1024} KB)`);
                continue;
            }

            console.log(`Processing ${path.basename(file)} (${(stats.size / 1024).toFixed(2)} KB)...`);

            let pipeline = sharp(file);
            const metadata = await pipeline.metadata();

            // HEAVY resizing: Max width 600px. 
            // This is often necessary to get < 40KB for complex photos.
            if (metadata.width > 600) {
                pipeline = pipeline.resize({ width: 600, withoutEnlargement: true });
            }

            // Convert everything to JPEG/WebP logic for max compression? 
            // Staying with original format structure but heavy compression.

            if (ext === '.png') {
                // PNG is hard to get small. converting to indexed colors + low quality
                pipeline = pipeline.png({
                    palette: true,
                    quality: 40, // Very low quality
                    compressionLevel: 9,
                    colors: 128, // limit colors
                    dither: 0.5
                });
            } else { // jpg, jpeg
                pipeline = pipeline.jpeg({
                    quality: 30, // Aggressive JPEG compression
                    mozjpeg: true
                });
            }

            await pipeline.toFile(tempFile);

            const newStats = fs.statSync(tempFile);

            // If still too big, try one more pass with smaller dimensions
            if (newStats.size > 45 * 1024) {
                console.log(`  Still too big (${(newStats.size / 1024).toFixed(2)} KB), resizing more...`);
                const pipeline2 = sharp(tempFile);
                // Resize to 400px
                await pipeline2.resize({ width: 400 }).toBuffer(async (err, buffer) => {
                    if (!err) fs.writeFileSync(tempFile, buffer);
                });
            }

            // Replace original
            fs.unlinkSync(file);
            fs.renameSync(tempFile, file);

            const finalStats = fs.statSync(file);
            console.log(`  -> Final: ${(finalStats.size / 1024).toFixed(2)} KB`);

        } catch (error) {
            console.error(`Error processing ${file}:`, error);
            if (fs.existsSync(tempFile)) {
                try { fs.unlinkSync(tempFile); } catch (e) { }
            }
        }
    }
}

compressImages().catch(console.error);
