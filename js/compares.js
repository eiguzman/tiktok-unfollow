const apiUrl2 = 'https://392mghkgfd.execute-api.us-west-1.amazonaws.com/default/unfollowers2';

const uploadArea2 = document.getElementById('customUploadArea2');
const uploadArea3 = document.getElementById('customUploadArea3');
const fileInput2 = document.getElementById('jsonFile2');
const fileInput3 = document.getElementById('jsonFile3');
const compareButton = document.getElementById('compareButton');

const statusDiv2 = document.getElementById('status2');
const resultsHeader2 = document.getElementById('resultsHeader2');
const resultsPre2 = document.getElementById('results2');

compareButton.disabled = true;

let jsonData2 = null;
let jsonData3 = null;
let fileOneSelected = false;
let fileTwoSelected = false;

// Utility function to handle file selection and parse JSON/ZIP
function handleFileSelection(fileInput, uploadArea, setFileSelected, callback) {
    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];

        // Define size limits based on file type
        // 1m followers is ~90MB
        const maxJsonSize = 94 * 1024 * 1024; // 25MB
        const maxZipSize = 4 * 1024 * 1024;   // 4MB

        // Inside handleFileSelection, after 'const file = fileInput.files[0];'
        if (file.size > (file.name.toLowerCase().endsWith('.zip') ? maxZipSize : maxJsonSize)) {
            alert(`File size exceeds the limit for ${file.name.toLowerCase().endsWith('.zip') ? 'ZIP' : 'JSON'} files. Please upload a smaller file.`);
            uploadArea.innerHTML = `<p>Upload your TikTok file</p>`;
            setFileSelected(false);
            compareButtonVisibility();
            callback(null);
            return;
        }

        if (!file) {
            uploadArea.innerHTML = `<p>Upload your TikTok file</p>`;
            setFileSelected(false);
            compareButtonVisibility();
            callback(null);
            return;
        }

        uploadArea.innerHTML = `<p>Selected: ${file.name}</p>`;
        const reader = new FileReader();
        reader.onload = function(e) {
            let jsonData = null;
            if (file.name.toLowerCase().endsWith('.zip')) {
                // Read ZIP
                JSZip.loadAsync(e.target.result)
                .then(zip => {
                    const jsonFileName = Object.keys(zip.files).find(name => name.toLowerCase().endsWith('.json'));
                    if (!jsonFileName) {
                        alert('No JSON file found inside ZIP archive.');
                        setFileSelected(false);
                        compareButtonVisibility();
                        callback(null);
                        return;
                    }
                    return zip.file(jsonFileName).async('string');
                })
                .then(jsonString => {
                    if (jsonString) {
                        try {
                            const fullJson = JSON.parse(jsonString);
                            // Extract nested data
                            if (
                                fullJson["Profile And Settings"] &&
                                fullJson["Profile And Settings"]["Follower"] &&
                                fullJson["Profile And Settings"]["Follower"]["FansList"]
                            ) {
                                jsonData = fullJson["Profile And Settings"]["Follower"]["FansList"];
                                setFileSelected(true);
                                compareButtonVisibility();
                                callback(jsonData);
                            } else {
                                alert('Desired data path not found inside ZIP JSON.');
                                setFileSelected(false);
                                compareButtonVisibility();
                                callback(null);
                            }
                        } catch (err) {
                            alert('Invalid JSON inside ZIP.');
                            setFileSelected(false);
                            compareButtonVisibility();
                            callback(null);
                        }
                    } else {
                        setFileSelected(false);
                        compareButtonVisibility();
                        callback(null);
                    }
                })
                .catch(err => {
                    alert('Error reading ZIP: ' + err.message);
                    setFileSelected(false);
                    compareButtonVisibility();
                    callback(null);
                });
            } else if (file.name.toLowerCase().endsWith('.json')) {
                // Read plain JSON file
                try {
                    const decoder = new TextDecoder('utf-8');
                    const jsonString = decoder.decode(e.target.result);
                    const fullJson = JSON.parse(jsonString);
                    // Extract nested data
                    if (
                        fullJson["Profile And Settings"] &&
                        fullJson["Profile And Settings"]["Follower"] &&
                        fullJson["Profile And Settings"]["Follower"]["FansList"]
                    ) {
                        jsonData = fullJson["Profile And Settings"]["Follower"]["FansList"];
                        setFileSelected(true);
                        compareButtonVisibility();
                        callback(jsonData);
                    } else {
                        alert('Desired data path not found inside JSON.');
                        setFileSelected(false);
                        compareButtonVisibility();
                        callback(null);
                    }
                } catch (err) {
                    console.log(err);
                    alert('Invalid JSON file.');
                    setFileSelected(false);
                    compareButtonVisibility();
                    callback(null);
                }
            } else {
                alert('Unsupported file type.');
                setFileSelected(false);
                compareButtonVisibility();
                callback(null);
            }
        };
        reader.readAsArrayBuffer(file);
    });
}
// Function to toggle compare button based on flags
function compareButtonVisibility() {
    if (fileOneSelected && fileTwoSelected) {
        compareButton.disabled = false;
    } else {
        compareButton.disabled = true;
    }
}

// Set up file input handlers
handleFileSelection(fileInput2, uploadArea2, (isSelected) => {
    fileOneSelected = isSelected;
}, (data) => {
    jsonData2 = data;
});

handleFileSelection(fileInput3, uploadArea3, (isSelected) => {
    fileTwoSelected = isSelected;
}, (data) => {
    jsonData3 = data;
});

// Buttons to trigger file dialogs
uploadArea2.addEventListener('click', () => {
    fileInput2.click();
});
uploadArea3.addEventListener('click', () => {
    fileInput3.click();
});

// Compare button event
compareButton.addEventListener('click', () => {
    if (!jsonData2 || !jsonData3) {
        alert('Please upload both files.');
        return;
    }

    compareButton.disabled = true;
    statusDiv2.innerHTML = '<span class="loading">Comparing followers...</span>';
    const payload = {
        fileData1: jsonData2,
        fileData2: jsonData3
    };

    fetch(apiUrl2, {
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
        statusDiv2.textContent = 'Comparison complete!';
        resultsHeader2.style.display = 'block';
        resultsPre2.style.display = 'block';

        if (data.not_following_back && data.not_following_back.length > 0) {
            resultsPre2.textContent = 'Unfollowers:\n' + data.not_following_back.join(', ');
        } else {
            resultsPre2.textContent = 'No unfollows detected. Either everyone is still following you or there was an error in the way TikTok generated your data.';
        }
    })
    .catch(err => {
        statusDiv2.textContent = 'Error during comparison: ' + err.message;
    });
});