const descriptions = [
	"1/11 \nGo to your profile and click on the menu icon (top-right corner)",
	"2/11 \nClick on Settings and privacy",
	"3/11 \nClick on Account",
	"4/11 \nClick on Download your data",
	"5/11 \nIn the Request data tab, in the Select file format, click on the File format dropdown menu (gray text)",
	"6/11 \nClick on JSON. Scroll down a bit",
	"7/11 \nIn the Select data to download, in the TikTok section, press the Show More dropdown menu (gray text)",
	"8/11 \nSelect Profile and Settings. Do not select anything else (It should say '1/10 selected' next to TikTok",
	"9/11 \nClick on Request data (bottom of the screen)",
	"10/11 \nClick on the download data tab. Wait until your data is ready to download (time depends on file size, server issues, etc.)",
	"11/11 \nWhen your data is ready to download, click Download (red button). The file should download as a .zip and not as a .json. You can now upload your .zip file directly to the area above"
];

const images = document.querySelectorAll('.image-container img');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const descriptionEl = document.getElementById('imageDescription');
const container = document.querySelector('.image-container');

let currentIndex = 0;
// For touch events
let startX = 0;
let currentTranslateX = 0;
let isDragging = false;

// Function to display image at currentIndex
function showImage(index) {
	images.forEach((img, i) => {
		img.style.display = (i === index) ? 'block' : 'none';
	});
	// Reset any inline transforms
	images.forEach(img => {
		img.style.transform = 'translateX(0)';
	});
	// Update description
	if (descriptionEl) {
		descriptionEl.innerHTML = (descriptions[index] || '').replace(/\n/g, '<br>');
	}
}

// Initialize first image
showImage(currentIndex);

// Button navigation
prevBtn.addEventListener('click', () => {
	currentIndex = (currentIndex - 1 + images.length) % images.length;
	showImage(currentIndex);
});

nextBtn.addEventListener('click', () => {
	currentIndex = (currentIndex + 1) % images.length;
	showImage(currentIndex);
});

// Touch events
container.addEventListener('touchstart', (e) => {
	if (e.touches.length === 1) {
		startX = e.touches[0].clientX;
		isDragging = true;
	}
});

container.addEventListener('touchmove', (e) => {
	if (!isDragging) return;
	const touchX = e.touches[0].clientX;
	const deltaX = touchX - startX;
	// Move current image
	images.forEach((img, i) => {
		if (i === currentIndex) {
			img.style.transform = `translateX(${deltaX}px)`;
		} else if (i === (currentIndex + 1) % images.length) {
			// Next image
			img.style.display = 'block';
			img.style.transform = `translateX(${deltaX + container.offsetWidth}px)`;
		} else if (i === (currentIndex - 1 + images.length) % images.length) {
			// Previous image
			img.style.display = 'block';
			img.style.transform = `translateX(${deltaX - container.offsetWidth}px)`;
		} else {
			// Hide others
			img.style.display = 'none';
		}
	});
});

container.addEventListener('touchend', (e) => {
	if (!isDragging) return;
	isDragging = false;
	const endX = e.changedTouches[0].clientX;
	const deltaX = endX - startX;
	const threshold = 50; // Minimum swipe distance to change images
	if (deltaX > threshold) {
		// Swipe right -> previous image
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	} else if (deltaX < -threshold) {
		// Swipe left -> next image
		currentIndex = (currentIndex + 1) % images.length;
	}
	// Reset transforms and show the correct image
	showImage(currentIndex);
});
