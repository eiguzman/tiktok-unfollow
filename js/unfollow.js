const apiUrl = 'https://nas56ip4d8.execute-api.us-west-1.amazonaws.com/default/unfollowers';

// Get references to DOM elements
const uploadArea = document.getElementById('customUploadArea');
const fileInput = document.getElementById('jsonFile');
const analyzeButton = document.getElementById('analyzeButton'); // Add this line

// Initially, disable the Analyze button until a file is uploaded
analyzeButton.disabled = true;

document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const statusDiv = document.getElementById('status');
  const resultsPre = document.getElementById('results');

  // Clear previous output
  resultsPre.textContent = '';
  statusDiv.textContent = '';

  if (fileInput.files.length === 0) {
    alert('Please select a JSON file.');
    return;
  }

  const file = fileInput.files[0];

  const maxFileSize = 10 * 1024 * 1024; // 10MB in bytes

  if (file.size > maxFileSize) {
    alert('File size exceeds 10MB limit. Please upload a smaller file.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const jsonData = JSON.parse(e.target.result);
      // Prepare payload for API
      const payload = jsonData;

      statusDiv.innerHTML = '<span class="loading">Sending data to server...</span>';

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        statusDiv.textContent = 'Analysis complete!';
        displayResults(data);
        // Show the results section
        document.getElementById('resultsHeader').style.display = 'block';
        resultsPre.style.display = 'block';
        // Re-enable Analyze button after analysis is complete
        analyzeButton.disabled = true;
      })
      .catch(error => {
        statusDiv.textContent = 'Error: ' + error.message;
        // Re-enable Analyze button in case of error
        analyzeButton.disabled = false;
      });
    } catch (err) {
      alert('Invalid JSON file. Please upload a valid TikTok JSON file.');
      // Re-enable Analyze button if JSON is invalid
      analyzeButton.disabled = false;
    }
  };

  reader.readAsText(file);
});

// Add click event to custom upload area to trigger file input
uploadArea.addEventListener('click', () => {
  fileInput.click();
});

// Optional: Change the text in the upload area after file selection
fileInput.addEventListener('change', () => {
  const fileName = fileInput.files.length > 0 ? fileInput.files[0].name : '';
  if (fileName) {
    document.getElementById('customUploadArea').innerHTML = `<p>Selected file: ${fileName}</p>`;
    // Set Analyze button to ON (enabled)
    analyzeButton.disabled = false;
  } else {
    document.getElementById('customUploadArea').innerHTML = `<p>Click here to upload your TikTok JSON file</p>`;
    // If no file, disable analyze button
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