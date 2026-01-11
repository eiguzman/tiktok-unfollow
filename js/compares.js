// API URL already declared in other file.
// const apiUrl = 'https://nas56ip4d8.execute-api.us-west-1.amazonaws.com/default/unfollowers';

// Get references to DOM elements
const uploadArea2 = document.getElementById('customUploadArea2');
const uploadArea3 = document.getElementById('customUploadArea3');
const fileInput2 = document.getElementById('jsonFile2');
const fileInput3 = document.getElementById('jsonFile3');
const compareButton = document.getElementById('compareButton');
const statusDiv2 = document.getElementById('status2');
const resultsHeader2 = document.getElementById('resultsHeader2');
const resultsPre2 = document.getElementById('results2');

// Initially, disable Analyze button
compareButton.disabled = true;
let jsonData2 = null;
let jsonData3 = null;
let fileOneSelected = false;
let fileTwoSelected = false;

// Utility function to handle file selection and parsing
function handleFileSelection(fileInput, uploadArea, setFileSelected, setData) {
	fileInput.addEventListener('change', () => {
		const file = fileInput.files[0];
		if (!file) {
			resetUpload(uploadArea, setFileSelected);
			setData(null);
			return;
		}

		// Define size limits based on file type
		// 1m followers is ~95MB
		// AWS payloads are limited to 10MB. This cannot be changed. This is one of the main reasons for the change in format.
		const maxJsonSize = 100 * 1024 * 1024; // 100MB
		const maxZipSize = 15 * 1024 * 1024;   // 15MB

		// Determine file type and validate size
		const fileNameLower = file.name.toLowerCase();
		let maxFileSize;

		if (fileNameLower.endsWith('.zip')) {
			maxFileSize = maxZipSize;
		} else if (fileNameLower.endsWith('.json')) {
			maxFileSize = maxJsonSize;
		} else {
			alert('Unsupported file type. Please upload a .json or .zip file.');
			return;
		}

		const isZip = fileNameLower.endsWith('.zip');
		uploadArea.innerHTML = `<p>Selected: ${file.name}</p>`;
		const reader = new FileReader();
		reader.onload = () => {
			processFile(reader.result, file.name, isZip, setFileSelected, setData, uploadArea);
		};
		reader.readAsArrayBuffer(file);
	});
}

// Reset upload area and selection flags
function resetUpload(uploadArea, setFileSelected) {
	uploadArea.innerHTML = `<p>Upload your TikTok file</p>`;
	setFileSelected(false);
	compareButtonVisibility();
}

// Process file content
function processFile(arrayBuffer, filename, isZip, setFileSelected, setData, uploadArea) {
	if (isZip) {
		// Read ZIP
		JSZip.loadAsync(arrayBuffer).then(zip => {
			const jsonFileName = Object.keys(zip.files).find(n => n.toLowerCase().endsWith('.json'));
			if (!jsonFileName) {
				alert('No JSON file inside ZIP.');
				resetUpload(uploadArea, setFileSelected);
				setData(null);
				return;
			}
			zip.file(jsonFileName).async('string').then(jsonStr => {
				parseAndExtract(jsonStr, setFileSelected, setData, uploadArea);
			});
		}).catch(() => {
			alert('Error reading ZIP.');
			resetUpload(uploadArea, setFileSelected);
			setData(null);
		});
	} else {
		// Read JSON
		const decoder = new TextDecoder('utf-8');
		const jsonStr = decoder.decode(arrayBuffer);
		parseAndExtract(jsonStr, setFileSelected, setData, uploadArea);
	}
}

// Parse JSON and extract target data
function parseAndExtract(jsonStr, setFileSelected, setData, uploadArea) {
	try {
		const fullJson = JSON.parse(jsonStr);
		const extracted = fullJson?.["Profile And Settings"]?.["Follower"]?.["FansList"];
		if (extracted) {
			setFileSelected(true);
			setData(extracted);
		} else {
			alert('Desired data path not found inside file.');
			resetUpload(uploadArea, setFileSelected);
			setData(null);
		}
	} catch {
		alert('Invalid JSON.');
		resetUpload(uploadArea, setFileSelected);
		setData(null);
	}
}

// Attach handlers
handleFileSelection(fileInput2, uploadArea2, val => { fileOneSelected = val; compareButtonVisibility(); }, data => { jsonData2 = data; });
handleFileSelection(fileInput3, uploadArea3, val => { fileTwoSelected = val; compareButtonVisibility(); }, data => { jsonData3 = data; });

// Trigger file dialog on upload area click
uploadArea2.onclick = () => fileInput2.click();
uploadArea3.onclick = () => fileInput3.click();

// Toggle compare button
function compareButtonVisibility() {
	compareButton.disabled = !(fileOneSelected && fileTwoSelected);
}

// Comparison process
compareButton.onclick = () => {
	if (!jsonData2 || !jsonData3) {
		alert('Please upload both files.');
		return;
	}

	compareButton.disabled = true;
	statusDiv2.innerHTML = '<span class="loading">Comparing followers...</span>';

	// Send an empty POST to log request
	fetch(apiUrl, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({})
	}).then(response => {
		if (response.status === 429) {
			return response.json().then(data => {
				throw new Error(data.Error || 'Rate limit exceeded.');
			});
		}
		if (!response.ok) {
			return response.json().then(data => {
				throw new Error(data.message || 'Error logging request.');
			});
		}
	}).then(() => {
		const followers1 = new Set(jsonData2.map(i => i.UserName));
		const followers2 = new Set(jsonData3.map(i => i.UserName));
		const unfollowers = Array.from(followers1).filter(u => !followers2.has(u));

		// Show results
		statusDiv2.textContent = 'Comparison complete!';
		resultsHeader2.style.display = 'block';
		resultsPre2.style.display = 'block';
		resultsPre2.textContent = unfollowers.length
		? 'Unfollowers:\n' + unfollowers.join(', ')
		: 'No unfollows detected. Either everyone still follows you, or there was an issue generating the file.';
	}).catch(err => {
		if (err.message !== 'Request limit exceeded') {
			statusDiv2.textContent = 'Error: ' + err.message;
		}
	}).finally(() => {
		compareButton.disabled = false;
	});
};

// Reset results display
function resetResults() {
	statusDiv2.textContent = '';
	resultsHeader2.style.display = 'none';
	resultsPre2.style.display = 'none';
}