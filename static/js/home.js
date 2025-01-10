// Select all upload boxes
const uploadBox = document.querySelector(".upload-box");

let email = null;

const fileInput = uploadBox.querySelector('input[type="file"]');
const placeholder = uploadBox.querySelector(".placeholder");
const uploadCard = uploadBox.parentNode;

// Handle image click to open file dialog
uploadBox.addEventListener("click", () => {
	fileInput.click();
});

// Handle file selection
fileInput.addEventListener("change", (event) => {
	const file = event.target.files[0];
	if (file) {
		loadImage(file, uploadBox, placeholder);
	}
});

// Handle drag over
uploadBox.addEventListener("dragover", (event) => {
	event.preventDefault();
	if (!uploadCard.classList.contains("active")) {
		uploadCard.classList.add("active");
	}
	// uploadBox.style.borderColor = "#007bff";
});

// Handle drag leave
uploadBox.addEventListener("dragleave", (event) => {
	const relatedTarget = event.relatedTarget;
	if (!uploadBox.contains(relatedTarget)) {
		uploadBox.style.borderColor = "#888";
		uploadCard.classList.remove("active");
	}
});

// Handle drop
uploadBox.addEventListener("drop", (event) => {
	event.preventDefault();
	uploadCard.classList.remove("active");
	uploadCard.querySelector(".placeholder-text").classList.add("hidden");
	uploadBox.style.borderColor = "#888"; // Reset border color on drop
	const file = event.dataTransfer.files[0];
	if (file) {
		const dataTransfer = new DataTransfer();
		const fileInput = event.target
			.closest(".upload-card")
			.querySelector('input[type="file"]');
		event.target.closest(".upload-card").querySelector(".error").innerHTML =
			"";
		dataTransfer.items.add(file);
		fileInput.files = dataTransfer.files;

		loadImage(file, uploadBox, placeholder);
	}
});

// Function to load the image into the box
function loadImage(file, uploadBox, placeholder) {
	const uploadImage = uploadBox.querySelector(".uploaded-image");
	const reader = new FileReader();
	reader.onload = function (e) {
		const image = new Image();
		image.src = e.target.result;
		image.onload = function () {
			// Replace the placeholder with the uploaded image
			placeholder.style.display = "none";
			uploadImage.innerHTML = ""; // Clear the box content
			uploadImage.appendChild(image); // Add the uploaded image
		};
	};
	reader.readAsDataURL(file);
}

document.getElementById("submit-image").addEventListener("click", () => {
	const fileInput = document.getElementById("upload-face");
	const errorElement = document.querySelector(".image-details .error");

	// Check if the user has uploaded an image
	if (!fileInput.files.length) {
		errorElement.textContent = "Please upload an image.";
		errorElement.style.color = "red";
		return;
	}

	// Create FormData and append the file
	const bestMatchDiv = document.querySelector(".best-match");
	const possibleMatchDiv = document.querySelector(".possible-match");
	const formData = new FormData();
	formData.append("file", fileInput.files[0]);

	// Submit the image to the backend
	fetch("/process-image", {
		method: "POST",
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			document.querySelector(".results").classList.remove("hidden");
			// Display the response from the backend
			// errorElement.textContent = data.message;
			console.log(data);
			// data = data.data;
			if (data.best_match != "None") {
				errorElement.textContent = "Match Found.";
				errorElement.style.color = "green";
				bestMatchDiv.innerHTML = `
				<h3>Best Match</h3>
				<span><b>Name:&nbsp;</b>${data.best_match.name}</span>
				<span><b>Age:&nbsp;</b>${data.best_match.age}</span>
				<span><b>Email:&nbsp;</b>${data.best_match.email}</span>
					<span><b>Confidence:&nbsp;</b>${data.best_match.confidence}%</span>
					`;
				} else {
					errorElement.textContent = "Match Not Found";
					errorElement.style.color = "red";
				bestMatchDiv.innerHTML = "<h3>Best Match</h3><h4>No Best Match Found</h4>";
			}
			possibleMatchDiv.innerHTML = "<h3>Possible Match</h3><div></div>";
			let parentDiv = possibleMatchDiv.querySelector("div");
			if (data.possible_matches.length != 0) {
				data.possible_matches.forEach((match, i) => {
					let newDiv = document.createElement("div");
					newDiv.innerHTML = `
					    <h4>Person ${i+1}</h4>
						<span><b>Name:&nbsp;</b>${match.name}</span>
						<span><b>Age:&nbsp;</b>${match.age}</span>
						<span><b>Confidence:&nbsp;</b>${match.confidence}%</span>
					`;
					parentDiv.appendChild(newDiv);
				});
			} else {
				possibleMatchDiv.innerHTML = "<h3>Possible Match</h3><h4>No Possible Matches Found</h4>";
			}
		})
		.catch((error) => {
			console.error("Error:", error);
			errorElement.textContent =
				"Something went wrong. Please try again.";
			errorElement.style.color = "red";
		});
});


document.getElementById("analyse").addEventListener("click", function () {
    const fileInput = document.getElementById("upload-face");
    const errorElement = document.querySelector(".image-details .error");

    // Step 1: Check if the user has uploaded an image
    if (!fileInput.files.length) {
        errorElement.textContent = "Please upload an image.";
        errorElement.style.color = "red";
        return;
    }

    // Step 2: Prepare the image file for upload
	const analysisResultDiv = document.querySelector(".analysis-result");
    const imageFile = fileInput.files[0];
    const formData = new FormData();
    formData.append("file", imageFile);

    // Step 3: Send a POST request to the /analysis endpoint
    fetch("/analysis", {
        method: "POST",
        body: formData
    })
        .then((response) => {
            if (!response.ok) {
                return response.json().then((errorData) => {
                    throw new Error(errorData.message || "An error occurred during analysis.");
                });
            }
            return response.json();
        })
        .then((data) => {
			document.querySelector(".analysis").classList.remove("hidden");
			analysisResultDiv.innerHTML = "";
                // Loop over the faces data array
			data.data.forEach((faceData, i) => {
				let newDiv = document.createElement("div");
				newDiv.innerHTML = `
					<h4>Face ${i+1}</h4>
					<span><b>Age:&nbsp;</b>${faceData.age}</span>
					<span><b>Emotion:&nbsp;</b>${faceData.emotion}</span>
					<span><b>Gender:&nbsp;</b>${faceData.gender}</span>
				`;
				// console.log(`Face ${i + 1}:`);
				// console.log(`Age: ${faceData.age}`);
				// console.log(`Emotion: ${faceData.emotion}`);
				// console.log(`Gender: ${faceData.gender}`);
				analysisResultDiv.appendChild(newDiv);
			});
            errorElement.textContent = ""; // Clear any previous error messages
        })
        .catch((error) => {
            console.error("Error during analysis:", error);
            errorElement.textContent = error.message;
            errorElement.style.color = "red";
        });
});
