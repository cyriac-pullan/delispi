const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'briyyRTlMJG3c43y1pWgNHXjaSezFdZHS4DCDe3qhlAUhOmTA0JUOSG7';
const BASE_URL = 'https://api.pexels.com/v1';

// Create directories if they don't exist
const dirs = [
    'images',
    'images/spices',
    'images/icons'
];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Function to download an image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${filepath}`);
                    resolve();
                });
            } else {
                reject(`Failed to download ${url}: ${response.statusCode}`);
            }
        }).on('error', (err) => {
            reject(`Error downloading ${url}: ${err.message}`);
        });
    });
}

// Function to search and download images
async function searchAndDownload(query, filename, size = 'large') {
    try {
        const response = await new Promise((resolve, reject) => {
            https.get(`${BASE_URL}/search?query=${encodeURIComponent(query)}&per_page=1`, {
                headers: {
                    'Authorization': API_KEY
                }
            }, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
                res.on('error', reject);
            }).on('error', reject);
        });

        if (response.photos && response.photos.length > 0) {
            const photo = response.photos[0];
            const url = photo.src[size] || photo.src.original;
            await downloadImage(url, filename);
        } else {
            console.log(`No images found for: ${query}`);
        }
    } catch (error) {
        console.error(`Error searching for ${query}:`, error);
    }
}

// Main function to download all required images
async function downloadAllImages() {
    // Spice product images
    const spices = [
        'black pepper spice',
        'cardamom spice',
        'cinnamon spice',
        'cloves spice',
        'cumin spice',
        'turmeric spice',
        'ginger spice',
        'coriander spice',
        'fenugreek spice',
        'mustard seeds spice',
        'bay leaves spice',
        'star anise spice'
    ];

    for (const spice of spices) {
        const filename = `images/spices/${spice.split(' ')[0]}.jpg`;
        await searchAndDownload(spice, filename);
    }

    // Hero and banner images
    await searchAndDownload('spice market', 'images/hero-bg.jpg');
    await searchAndDownload('spice factory', 'images/about-banner.jpg');

    // Quality assurance images
    await searchAndDownload('food certification', 'images/quality-certificate.jpg');
    await searchAndDownload('food processing facility', 'images/processing-facility.jpg');
    await searchAndDownload('spice packaging', 'images/packaging.jpg');

    // Testimonial images (using people photos)
    await searchAndDownload('business person portrait', 'images/testimonial-1.jpg');
    await searchAndDownload('chef portrait', 'images/testimonial-2.jpg');
    await searchAndDownload('restaurant owner portrait', 'images/testimonial-3.jpg');

    // Background images
    await searchAndDownload('spice pattern', 'images/pattern-bg.jpg');
    await searchAndDownload('spice market night', 'images/footer-bg.jpg');

    console.log('All images downloaded successfully!');
}

// Run the download process
downloadAllImages().catch(console.error); 