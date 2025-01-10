// Select all upload boxes
const uploadBoxes = document.querySelectorAll('.upload-box');

let email = null;

// Iterate through each upload box
uploadBoxes.forEach((uploadBox) => {
    const fileInput = uploadBox.querySelector('input[type="file"]');
    const placeholder = uploadBox.querySelector('.placeholder');
    const uploadCard = uploadBox.parentNode;

    // Handle image click to open file dialog
    uploadBox.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            loadImage(file, uploadBox, placeholder);
        }
    });

    // Handle drag over
    uploadBox.addEventListener('dragover', (event) => {
        event.preventDefault();
        if (!uploadCard.classList.contains("active")) {
            uploadCard.classList.add("active");
        }
        uploadBox.style.borderColor = '#007bff';
    });

    // Handle drag leave
    uploadBox.addEventListener('dragleave', (event) => {
        const relatedTarget = event.relatedTarget;
        if (!uploadBox.contains(relatedTarget)) {
            uploadBox.style.borderColor = '#888';
            uploadCard.classList.remove("active");
        }
    });

    // Handle drop
    uploadBox.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadCard.classList.remove("active");
        uploadCard.querySelector(".placeholder-text").classList.add("hidden");
        // uploadBox.style.borderColor = '#888'; // Reset border color on drop
        const file = event.dataTransfer.files[0];
        if (file) {
            const dataTransfer = new DataTransfer();
            const fileInput = event.target.closest('.upload-card').querySelector('input[type="file"]');
            event.target.closest('.upload-card').querySelector('.error').innerHTML = "";
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            loadImage(file, uploadBox, placeholder);
        }
    });
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
            placeholder.style.display = 'none';
            uploadImage.innerHTML = "";  // Clear the box content
            uploadImage.appendChild(image);  // Add the uploaded image
        };
    };
    reader.readAsDataURL(file);
}



/////////////////////////////////////


document.getElementById('submit-images').addEventListener('click', () => {
    const inputs = document.querySelectorAll('.upload-card input[type="file"]');
    const formData = new FormData();
    let allImagesUploaded = true;

    formData.append('email', email);

    inputs.forEach(input => {
        const errorElem = input.closest('.upload-card').querySelector('.error');
        if (input.files.length === 0) {
            allImagesUploaded = false;
            errorElem.textContent = 'Please upload an image.';
        } else {
            errorElem.textContent = ''; // Clear previous errors
            formData.append(input.id, input.files[0]);
        }
    });

    if (allImagesUploaded) {
        fetch('/saveimages', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'failure') {
                // Display general message
                // document.getElementById('general-error').textContent = data.message;
                console.log(data.message);

                // Display specific errors for fields
                Object.keys(data.errors).forEach(field => {
                    const errorElem = document.querySelector(`#${field}`).closest('.upload-card').querySelector('.error');
                    errorElem.textContent = data.errors[field];
                    errorElem.style.color = 'red';
                });
            } else {
                // Success: Clear errors and show success message
                // document.getElementById('general-error').textContent = '';
                Object.keys(data.errors).forEach(field => {
                    const errorElem = document.querySelector(`#${field}`).closest('.upload-card').querySelector('.error');
                    errorElem.textContent = '';
                });
                alert(data.message); // Show success feedback
            }
        })
        .catch(error => {
            console.error('Error: LOL', error);
            // document.getElementById('general-error').textContent = 'An unexpected error occurred. Please try again.';
        });
    }
});



///////////////////////////////////////////


document.getElementById('register-email').addEventListener('click', async (e) => {
    e.preventDefault();

    email = document.getElementById('email').value;

    if (!email) {
        alert("Email is required.");
        return;
    }

    try {
        const response = await fetch('/new-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email}),
        });

        const data = await response.json();
        alert(data.message, data.error);
        console.log(data);
        if (data.status == true) {
            // Data Exists, skip name collection. 
            document.querySelector(".email-form").classList.add("hidden");
            document.querySelector(".main-form").classList.add("hidden");
            document.querySelector(".containerrr").classList.remove("hidden");
            document.querySelector(".submit-button").classList.remove("hidden");
            document.querySelector(".enter-mail").classList.remove("active");
            document.querySelector(".submit-form").classList.remove("active");
            document.querySelector(".upload-images").classList.add("active");
        }
        else if (data.status == false){
            // Collect name as well. 
            document.querySelector(".email-form").classList.add("hidden");
            document.querySelector(".main-form").classList.remove("hidden");
            document.querySelector(".containerrr").classList.add("hidden");
            document.querySelector(".submit-button").classList.add("hidden");
            document.querySelector(".enter-mail").classList.remove("active");
            document.querySelector(".submit-form").classList.add("active");
            document.querySelector(".upload-images").classList.remove("active");
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});

document.getElementById('register-user').addEventListener('click', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;

    if (!name || !email) {
        alert("Name and email are required.");
        return;
    }

    try {
        const response = await fetch('/new-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, age }),
        });

        const data = await response.json();
        alert(data.message);
        document.querySelector(".main-form").classList.add("hidden");
        document.querySelector(".upload-images").classList.add("active");
        document.querySelector(".containerrr").classList.remove("hidden");
        document.querySelector(".submit-button").classList.remove("hidden");
        document.querySelector(".submit-form").classList.remove("active");
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred.');
    }
});
