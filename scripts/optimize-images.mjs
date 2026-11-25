import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Run deliberately after adding/changing assets; never on each production build.
const report = [];
for (const directory of ['public/services', 'public/brand']) {
  for (const name of await fs.readdir(directory)) {
    if (!/\.(webp|png|jpe?g)$/i.test(name)) continue;
    const source = path.join(directory, name);
    const original = await fs.readFile(source);
    const brand = directory.endsWith('brand');
    const width = brand ? (name.includes('logo') ? 800 : 192)
      : name.includes('washer-diagnosis') ? 1200
      : /care-|service-professional|washer-disconnection/.test(name) ? 800 : 480;
    const output = await sharp(original).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: brand ? 85 : 72, effort: 6, alphaQuality: 90 }).toBuffer();
    const destination = source.replace(/\.(png|jpe?g)$/i, '.webp');
    const useOutput = destination !== source || output.length < original.length;
    if (useOutput) await fs.writeFile(destination, output);
    const final = useOutput ? output : original;
    const metadata = await sharp(final).metadata();
    report.push({ file: destination, before: original.length, after: final.length, width: metadata.width, height: metadata.height });
  }
}
const before = report.reduce((sum, image) => sum + image.before, 0);
const after = report.reduce((sum, image) => sum + image.after, 0);
await fs.mkdir('artifacts', { recursive: true });
await fs.writeFile('artifacts/image-optimization.json', JSON.stringify({ before, after, savedPercent: Math.round((1 - after / before) * 100), images: report }, null, 2) + '\n');
console.table(report.map(image => ({ file: image.file, beforeKB: (image.before / 1024).toFixed(1), afterKB: (image.after / 1024).toFixed(1), dimensions: `${image.width}×${image.height}` })));
console.log(`Total: ${(before / 1024).toFixed(1)} KB -> ${(after / 1024).toFixed(1)} KB (${Math.round((1 - after / before) * 100)}% smaller)`);
