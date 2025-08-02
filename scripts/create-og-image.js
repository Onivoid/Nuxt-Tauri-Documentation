const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function createOGImage() {
    console.log('🎨 Création de l\'image Open Graph PNG...');
    
    try {
        // Créer un SVG programmatiquement
        const svgContent = [
            '<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">',
            '  <defs>',
            '    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">',
            '      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />',
            '      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />',
            '    </linearGradient>',
            '  </defs>',
            '  <rect width="1200" height="630" fill="url(#grad)"/>',
            '  <circle cx="600" cy="200" r="60" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.2)" stroke-width="2"/>',
            '  <text x="595" y="220" text-anchor="middle" fill="white" font-family="system-ui" font-size="48">⚡</text>',
            '  <text x="600" y="340" text-anchor="middle" fill="white" font-family="system-ui" font-size="72" font-weight="bold">Nuxt Tauri</text>',
            '  <text x="600" y="400" text-anchor="middle" fill="#e0e7ff" font-family="system-ui" font-size="32">Vue Composables for Tauri API</text>',
            '  <g transform="translate(400, 450)">',
            '    <rect x="0" y="0" width="120" height="40" rx="20" fill="rgba(255,255,255,0.2)"/>',
            '    <text x="60" y="28" text-anchor="middle" fill="white" font-family="system-ui" font-size="16">TypeScript</text>',
            '  </g>',
            '  <g transform="translate(540, 450)">',
            '    <rect x="0" y="0" width="120" height="40" rx="20" fill="rgba(255,255,255,0.2)"/>',
            '    <text x="60" y="28" text-anchor="middle" fill="white" font-family="system-ui" font-size="16">Zero Config</text>',
            '  </g>',
            '  <g transform="translate(680, 450)">',
            '    <rect x="0" y="0" width="120" height="40" rx="20" fill="rgba(255,255,255,0.2)"/>',
            '    <text x="60" y="28" text-anchor="middle" fill="white" font-family="system-ui" font-size="16">Reactive</text>',
            '  </g>',
            '</svg>'
        ].join('\n');
        
        // Sauvegarder le SVG
        const publicDir = path.join(__dirname, '../public');
        if (!fs.existsSync(publicDir)) {
            fs.mkdirSync(publicDir, { recursive: true });
        }
        
        const svgPath = path.join(publicDir, 'og-image.svg');
        const pngPath = path.join(publicDir, 'og-image.png');
        
        fs.writeFileSync(svgPath, svgContent);
        console.log('✅ SVG Open Graph créé dans public/og-image.svg');
        
        // Convertir SVG en PNG avec Sharp
        await sharp(Buffer.from(svgContent))
            .png()
            .resize(1200, 630)
            .toFile(pngPath);
            
        console.log('✅ PNG Open Graph créé dans public/og-image.png');
        console.log('🎯 Taille: 1200x630px (optimale pour réseaux sociaux)');
        console.log('📱 Format PNG supporté par Facebook, Twitter, LinkedIn');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

if (require.main === module) {
    createOGImage();
}

module.exports = createOGImage;
