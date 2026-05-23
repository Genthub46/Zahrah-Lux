const puppeteer = require('puppeteer');
const fs = require('fs');
const marked = require('marked');

(async () => {
    try {
        const md = fs.readFileSync('Zarhrah_Admin_Guide.md', 'utf8');
        const html = `
            <!DOCTYPE html>
            <html>
                <head>
                    <style>
                        body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #333; }
                        h1, h2, h3 { color: #111; }
                        h1 { border-bottom: 2px solid #C5A059; padding-bottom: 10px; }
                        h2 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 30px; }
                        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
                        a { color: #C5A059; text-decoration: none; }
                        ul { margin-bottom: 15px; }
                        li { mb-2; }
                    </style>
                </head>
                <body>
                    ${marked.parse(md)}
                </body>
            </html>
        `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(html);
        await page.pdf({ path: 'Zarhrah_Admin_Guide.pdf', format: 'A4' });

        await browser.close();
        console.log('PDF generated successfully!');
    } catch (e) {
        console.error('Error:', e);
    }
})();
