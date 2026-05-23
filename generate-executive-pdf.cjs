const puppeteer = require('puppeteer');
const fs = require('fs');
const marked = require('marked');

(async () => {
    try {
        console.log('Reading markdown content...');
        const md = fs.readFileSync('Zahrah_Luxury_Boutique_Executive_Guide.md', 'utf8');
        
        console.log('Rendering Markdown to Luxury styled HTML...');
        const htmlContent = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>Zahrah Luxury Boutique - Complete Operations Guide</title>
                    <style>
                        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;700&display=swap');
                        
                        body {
                            font-family: 'Plus Jakarta Sans', sans-serif;
                            padding: 50px 60px;
                            line-height: 1.7;
                            color: #2b2927;
                            background-color: #ffffff;
                            font-size: 14px;
                        }
                        
                        .header-cover {
                            border-bottom: 2px solid #C5A059;
                            padding-bottom: 25px;
                            margin-bottom: 40px;
                            display: flex;
                            justify-content: space-between;
                            align-items: flex-end;
                        }
                        
                        .header-title h1 {
                            font-family: 'Playfair Display', serif;
                            font-size: 32px;
                            font-weight: 700;
                            color: #1c1a18;
                            margin: 0 0 5px 0;
                            letter-spacing: -0.02em;
                        }
                        
                        .header-subtitle {
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.3em;
                            color: #C5A059;
                            font-weight: 700;
                        }
                        
                        .date-stamp {
                            font-size: 11px;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            color: #8c857b;
                            font-weight: 500;
                        }
                        
                        h1 {
                            font-family: 'Playfair Display', serif;
                            color: #1c1a18;
                            font-size: 26px;
                            margin-top: 40px;
                            margin-bottom: 20px;
                            font-weight: 700;
                        }
                        
                        h2 {
                            font-family: 'Playfair Display', serif;
                            color: #1c1a18;
                            font-size: 20px;
                            margin-top: 35px;
                            margin-bottom: 15px;
                            border-bottom: 1px solid #e8e5e0;
                            padding-bottom: 8px;
                            font-weight: 700;
                        }
                        
                        h3 {
                            font-family: 'Plus Jakarta Sans', sans-serif;
                            color: #C5A059;
                            font-size: 13px;
                            text-transform: uppercase;
                            letter-spacing: 0.15em;
                            font-weight: 700;
                            margin-top: 25px;
                            margin-bottom: 12px;
                        }
                        
                        p {
                            margin-top: 0;
                            margin-bottom: 15px;
                            color: #4a4540;
                        }
                        
                        ul, ol {
                            margin-top: 0;
                            margin-bottom: 20px;
                            padding-left: 20px;
                        }
                        
                        li {
                            margin-bottom: 8px;
                            color: #4a4540;
                        }
                        
                        li strong {
                            color: #1c1a18;
                        }
                        
                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin: 25px 0;
                            font-size: 12px;
                        }
                        
                        th {
                            background-color: #faf9f6;
                            color: #1c1a18;
                            font-weight: 700;
                            text-transform: uppercase;
                            letter-spacing: 0.1em;
                            border-bottom: 2px solid #C5A059;
                            padding: 12px 15px;
                            text-align: left;
                        }
                        
                        td {
                            padding: 12px 15px;
                            border-bottom: 1px solid #e8e5e0;
                            color: #4a4540;
                        }
                        
                        tr:nth-child(even) td {
                            background-color: #fdfdfc;
                        }
                        
                        code {
                            font-family: monospace;
                            background-color: #faf9f6;
                            padding: 2px 6px;
                            border-radius: 4px;
                            font-size: 12px;
                            color: #b2883b;
                            border: 1px solid #eae7e2;
                        }
                        
                        hr {
                            border: 0;
                            height: 1px;
                            background-color: #e8e5e0;
                            margin: 40px 0;
                        }
                        
                        .page-break {
                            page-break-before: always;
                        }
                        
                        /* Custom elegant callouts */
                        blockquote {
                            margin: 20px 0;
                            padding: 15px 20px;
                            background-color: #faf9f6;
                            border-left: 3px solid #C5A059;
                            font-style: italic;
                            color: #615a52;
                        }
                    </style>
                </head>
                <body>
                    <div class="header-cover">
                        <div class="header-title">
                            <h1>Zahrah Luxury Boutique</h1>
                            <div class="header-subtitle">Executive & Customer Operations Guide</div>
                        </div>
                        <div class="date-stamp">May 2026</div>
                    </div>
                    ${marked.parse(md)}
                </body>
            </html>
        `;
        
        console.log('Launching browser and printing PDF...');
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        
        await page.pdf({
            path: 'Zahrah_Luxury_Boutique_Executive_Guide.pdf',
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20mm',
                bottom: '20mm',
                left: '15mm',
                right: '15mm'
            }
        });
        
        await browser.close();
        console.log('PDF generated successfully at: Zahrah_Luxury_Boutique_Executive_Guide.pdf');
    } catch (error) {
        console.error('Error rendering PDF:', error);
        process.exit(1);
    }
})();
