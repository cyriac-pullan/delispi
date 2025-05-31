const https = require('https');
const fs = require('fs');
const path = require('path');

// Create icons directory if it doesn't exist
const iconDir = 'images/icons';
if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
}

// Font Awesome icons to download
const icons = {
    'cart': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/cart-shopping.svg',
    'search': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/magnifying-glass.svg',
    'user': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/user.svg',
    'facebook': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/facebook.svg',
    'twitter': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/twitter.svg',
    'instagram': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/instagram.svg',
    'linkedin': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/linkedin.svg',
    'whatsapp': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/brands/whatsapp.svg',
    'arrow-right': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/arrow-right.svg',
    'arrow-left': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/arrow-left.svg',
    'star': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/star.svg',
    'star-half': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/star-half-stroke.svg',
    'star-empty': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/regular/star.svg',
    'check': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/check.svg',
    'phone': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/phone.svg',
    'email': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/envelope.svg',
    'location': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/location-dot.svg',
    'menu': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/bars.svg',
    'close': 'https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/xmark.svg'
};

// Function to download an icon
function downloadIcon(url, filename) {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filename);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Downloaded: ${filename}`);
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

// Main function to download all icons
async function downloadAllIcons() {
    console.log('Starting icon downloads...');
    
    for (const [name, url] of Object.entries(icons)) {
        const filename = path.join(iconDir, `${name}.svg`);
        try {
            await downloadIcon(url, filename);
            // Add a small delay to be respectful to the server
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            console.error(`Error downloading ${name} icon:`, error);
        }
    }
    
    console.log('All icons downloaded successfully!');
}

// Run the download process
downloadAllIcons().catch(console.error); 