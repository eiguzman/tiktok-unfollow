const apiUrl = 'https://nas56ip4d8.execute-api.us-west-1.amazonaws.com/default/unfollowers';

// Get references to DOM elements
const uploadArea = document.getElementById('customUploadArea');
const fileInput = document.getElementById('jsonFile');
const analyzeButton = document.getElementById('analyzeButton');

// Initially, disable Analyze button
analyzeButton.disabled = true;
document.getElementById('uploadForm').addEventListener('submit', function(e) {
	e.preventDefault();

	// Prepare results div
	const statusDiv = document.getElementById('status');
	const resultsPre = document.getElementById('results');
	resultsPre.textContent = '';
	statusDiv.textContent = '';

	if (fileInput.files.length === 0) {
		alert('Please select a JSON or ZIP file.');
		return;
	}

	const file = fileInput.files[0];

	// Define size limits based on file type
	const maxJsonSize = 15 * 1024 * 1024; // 15MB
	const maxZipSize = 2 * 1024 * 1024;   // 2MB

	// Determine file type and validate size
	const fileNameLower = file.name.toLowerCase();
	let maxFileSize;

	if (fileNameLower.endsWith('.zip')) {
		maxFileSize = maxZipSize;
	} else if (fileNameLower.endsWith('.json')) {
		maxFileSize = maxJsonSize;
	} else {
		alert('Unsupported file type. Please upload a .json or .zip file.');
		analyzeButton.disabled = false;
		return;
	}

	if (file.size > maxFileSize) {
		alert(`File size exceeds the limit for ${fileNameLower.endsWith('.zip') ? 'ZIP' : 'JSON'} files. Please upload a smaller file.`);
		return;
	}

	// Function to process JSON data
	const processJsonData = (jsonData) => {
		try {
			if (!jsonData.hasOwnProperty("Profile And Settings")) {
				throw new Error('Invalid file');
			}
		} catch (err) {
			analyzeButton.disabled = true;
			statusDiv.textContent = 'Error: ' + err.message;
			return;
		}

		// Extract only required nested data; disable misclicks
		const extractedData = {};
		analyzeButton.disabled = true;

		try {
			if (
				jsonData["Profile And Settings"] &&
				jsonData["Profile And Settings"]["Follower"] &&
				jsonData["Profile And Settings"]["Follower"]["FansList"]
			) {
				extractedData["Profile And Settings"] = {
					...jsonData["Profile And Settings"],
					Follower: {
						FansList: jsonData["Profile And Settings"]["Follower"]["FansList"]
					}
				};
			} else {
				throw new Error('Required nested data not found');
			}
		} catch (err) {
			alert('Could not extract the required data: ' + err.message);
			return;
		}

		// Prepare payload for API
		statusDiv.innerHTML = '<span class="loading">Sending data to server...</span>';
		const payload = extractedData;

		fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(payload)
		})
		.then(response => {
			if (response.status === 429) {
				throw new Error('You have reached the maximum allowed requests per day. Please try again in 24 hours.');
			}
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			return response.json();
		})
		.then(data => {
			statusDiv.textContent = 'Analysis complete!';
			displayResults(data);
			document.getElementById('resultsHeader').style.display = 'block';
			document.getElementById('results').style.display = 'block';
		})
		.catch(error => {
			statusDiv.textContent = 'Error: ' + error.message;
		});
	};

	// Handle ZIP files
	if (file.name.endsWith('.zip')) {
		const reader = new FileReader();
		reader.onload = function(e) {
			JSZip.loadAsync(e.target.result)
			.then(zip => {
				// Find JSON file inside zip
				const jsonFileName = Object.keys(zip.files).find(filename => filename.endsWith('.json'));
				if (!jsonFileName) {
					alert('No JSON file found inside the ZIP archive.');
					analyzeButton.disabled = false;
					return;
				}
				return zip.file(jsonFileName).async('string');
			})
			.then(jsonString => {
				if (jsonString) {
					const jsonData = JSON.parse(jsonString);
					processJsonData(jsonData);
				}
			})
			.catch(err => {
				alert('Error reading ZIP file: ' + err.message);
				analyzeButton.disabled = false;
			});
		};
		reader.readAsArrayBuffer(file);
	}
	// Handle JSON files directly
	else if (file.name.endsWith('.json')) {
		const reader = new FileReader();
		reader.onload = function(e) {
			try {
				const jsonData = JSON.parse(e.target.result);
				processJsonData(jsonData);
			} catch (err) {
				alert('Invalid JSON file. Please upload a valid TikTok JSON file.');
				analyzeButton.disabled = false;
			}
		};
		reader.readAsText(file);
	} else {
		alert('Unsupported file type. Please upload a .json or .zip file.');
		analyzeButton.disabled = false;
	}
});

// Add click event to custom upload area to trigger file input
uploadArea.addEventListener('click', () => {
	fileInput.click();
});

// Change upload area text upon file selection
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

function displayResults(data) {
	const resultsPre = document.getElementById('results');
	if (data.not_following_back && data.not_following_back.length > 0) {
		resultsPre.textContent = 'People you follow who do not follow back:\n' + data.not_following_back.join(', ');
	} else {
		resultsPre.textContent = 'People you follow who do not follow back: 0 \nEither everyone you follow follows you back, or there are issues with the way TikTok generated your JSON file (This is very common).';
	}
}