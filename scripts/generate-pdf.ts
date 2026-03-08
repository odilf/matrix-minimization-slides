import puppeteer from 'puppeteer';

async function slidesToPDF() {
	process.env.SLIDES_PRINT = '1';
	const browser = await puppeteer.launch({
		executablePath: process.env.CHROMIUM_PATH
	});
	const page = await browser.newPage();

	// Point to your local SvelteKit dev server or built site
	await page.goto('http://localhost:5173?print=true', {
		waitUntil: 'networkidle0'
	});

	await page.setViewport({ width: 1920, height: 1080 });

	await page.pdf({
		path: 'slides.pdf',
		width: '1920px',
		height: '1080px',
		printBackground: true,
		preferCSSPageSize: false
	});

	await browser.close();
	console.log('PDF generated: slides.pdf');
}

slidesToPDF().catch(console.error);
