const apiUrl = 'https://nas56ip4d8.execute-api.us-west-1.amazonaws.com/default/unfollowers';

// Get references to DOM elements
const uploadArea = document.getElementById('customUploadArea');
const fileInput = document.getElementById('jsonFile');
const analyzeButton = document.getElementById('analyzeButton');

// Initially, disable Analyze button
analyzeButton.disabled = true;

document.getElementById('uploadForm').addEventListener('submit', function(e) {
	e.preventDefault();
	// Disable Analyze button to prevent duplicate requests
	analyzeButton.disabled = true;

	// Prepare results div
	const statusDiv = document.getElementById('status');
	const resultsPre = document.getElementById('results');
	resultsPre.textContent = '';
	statusDiv.textContent = '';
	statusDiv.innerHTML = '<span class="loading">Sending data to server...</span>';

	if (fileInput.files.length === 0) {
		alert('Please select a JSON or ZIP file.');
		return;
	}

	const file = fileInput.files[0];

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

	if (file.size > maxFileSize) {
		alert(`File size exceeds the limit for ${fileNameLower.endsWith('.zip') ? 'ZIP' : 'JSON'} files.`);
		return;
	}

	// Function to send an empty POST to log request
	const logRequest = () => {
		fetch(apiUrl, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({})
		})
		.then(res => {
			if (res.status === 429) {
				return res.json().then(data => {
					throw new Error(data.Error || 'Rate limit exceeded.');
				});
			}
			if (!res.ok) {
				return res.json().then(data => {
					throw new Error(data.message || 'Error logging request.');
				});
			}
			processFile();
		})
		.catch(err => {
			statusDiv.textContent = 'Error: ' + err.message;
		});
	};

	const processFile = () => {
		// Handle ZIP files
		if (file.name.endsWith('.zip')) {
			const reader = new FileReader();
			reader.onload = function(e) {
				JSZip.loadAsync(e.target.result)
				.then(zip => {
					const jsonFileName = Object.keys(zip.files).find(filename => filename.endsWith('.json'));
					if (!jsonFileName) {
						alert('No JSON file found inside the ZIP archive.');
						return;
					}
					return zip.file(jsonFileName).async('string');
				})
				.then(jsonString => {
					if (jsonString) {
						const jsonData = JSON.parse(jsonString);
						handleJsonData(jsonData);
					}
				})
				.catch(err => {
					alert('Error reading ZIP file: ' + err.message);
				});
			};
			reader.readAsArrayBuffer(file);
		} else if (file.name.endsWith('.json')) {
			// Handle JSON files directly
			const reader = new FileReader();
			reader.onload = function(e) {
				try {
					const jsonData = JSON.parse(e.target.result);
					handleJsonData(jsonData);
				} catch (err) {
					alert('Invalid JSON file. Please upload a valid TikTok JSON file.');
				}
			};
			reader.readAsText(file);
		} else {
			alert('Unsupported file type. Please upload a .json or .zip file.');
		}
	};

	const handleJsonData = (jsonData) => {
		// Validate JSON structure
		if (!jsonData['Profile And Settings']) {
			document.getElementById('status').textContent = 'Error: Invalid file structure.';
			return;
		}

		// Extract followers and followings
		const profile = jsonData['Profile And Settings'];
		const followers = new Set();
		const followings = new Set();

		const followerList = profile['Follower']?.['FansList'] || [];
		followerList.forEach(item => {
			const username = item['UserName'];
			if (username) followers.add(username);
		});

		const followingList = profile['Following']?.['Following'] || [];
		followingList.forEach(item => {
			const username = item['UserName'];
			if (username) followings.add(username);
		});

		// Compute who doesn't follow back
		const notFollowingBack = Array.from(followings).filter(user => !followers.has(user));

		// Display results
		const resultsPre = document.getElementById('results');
		if (notFollowingBack.length > 0) {
			resultsPre.textContent = 'People you follow who do not follow back:\n' + notFollowingBack.join(', ');
		} else {
			resultsPre.textContent = 'People you follow who do not follow back: 0. Either everyone you follow follows you back, or there was an issue generating the file.';
		}
		document.getElementById('resultsHeader').style.display = 'block';
		document.getElementById('results').style.display = 'block';
		statusDiv.textContent = 'Analysis complete!';
	};

	// Kick off the process
	logRequest();
});

// Upload area click
uploadArea.addEventListener('click', () => {
	fileInput.click();
});

// File selection change
fileInput.addEventListener('change', () => {
	const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : '';
	if (fileName) {
		document.getElementById('customUploadArea').innerHTML = `<p>Selected file: ${fileName}</p>`;
		analyzeButton.disabled = false;
	} else {
		document.getElementById('customUploadArea').innerHTML = `<p>Click here to upload your TikTok JSON or ZIP file</p>`;
		analyzeButton.disabled = true;
	}
});
