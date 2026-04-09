
const fs = require('fs');
const https = require('https');
const path = require('path');

const images = [
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/3/36/African_mama_washing_clothes_for_the_whole_family.jpg',
        dest: 'src/assets/services/lessive-hero.jpg'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/A_woman_ironing_clothes.jpg',
        dest: 'src/assets/services/lessive-ironing.jpg'
    },
    {
        url: 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Women_washing_clothes_1.jpg',
        dest: 'src/assets/services/lessive-standard.jpg'
    }
];

const download = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded ${dest}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => { });
            reject(err);
        });
    });
};

async function run() {
    for (const img of images) {
        try {
            await download(img.url, path.join(__dirname, img.dest));
        } catch (err) {
            console.error(err);
        }
    }
}

run();
