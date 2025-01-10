from flask import Flask, request, render_template, redirect, session, url_for, flash, jsonify
from PIL import Image
import io
import os
import numpy as np
from deepface import DeepFace
import face_recognition as nelston
# import dlib
# from face_registration import register_user
# from face_recognition import recognize_user


app = Flask(__name__)
app.secret_key = 'lol1234'  # For secure sessions

ADMIN_USERNAME = "admyn"
ADMIN_PASSWORD = "admyn101"

UPLOAD_FOLDER = 'uploads/'
DATABASE_FOLDER = 'database/'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

# Configure upload folder
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['DATABASE_FOLDER'] = DATABASE_FOLDER

# Ensure upload and database directories exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs('database', exist_ok=True)

def allowed_file(filename):
    """Check if the uploaded file is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file):
    try:
        # Read image
        image = Image.open(io.BytesIO(file.read()))
        
        # Check if image meets minimum resolution
        if image.width < 300 or image.height < 500:
            return None, 'Image resolution too low. Minimum is 500x500.'
        
        # Check if image is in PNG format, if not, convert to PNG
        if image.format != 'PNG':
            image = image.convert('RGB')  # Convert to RGB if not PNG
            png_image = io.BytesIO()
            image.save(png_image, format='PNG')
            png_image.seek(0)  # Reset pointer to the beginning
            image = Image.open(png_image)
        
        # Check if the image contains a face and if the face is large enough
        image_np = np.array(image)
        face_locations = nelston.face_locations(image_np)
        
        if len(face_locations) == 0:
            return None, 'No face detected in the image.'
        
        # Check if the face is large enough (e.g., area of face should be > 10000 pixels)
        for top, right, bottom, left in face_locations:
            face_area = (right - left) * (bottom - top)
            if face_area < 10000:  # Example threshold for face size
                return None, 'Face detected is too small for good encoding extraction.'
        
        # Free memory from original image format (if applicable)
        del png_image
        
        return image, None
    except Exception as e:
        return None, f'Error processing image: {str(e)}'


def createUserDirectory(email):
    # Create user directory and initialize metadata with email.
    user_id = email.split('@')[0].lower()
    user_folder = os.path.join(app.config['DATABASE_FOLDER'], user_id)
    
    if not os.path.exists(user_folder):
        os.makedirs(user_folder)
    else:
        return True # already exists, that means other data was also saved earlier.

    # Initialize metadata with email
    data = {
        "metadata": {"email": email},
        "encodings": {}
    }
    np.save(os.path.join(user_folder, 'encodings.npy'), data)
    
    return False

def updateUserData(email, name, age):
    # Update metadata with name and age for an existing user.
    user_id = email.split('@')[0].lower()
    user_folder = os.path.join(DATABASE_FOLDER, user_id)
    encodings_file = os.path.join(user_folder, 'encodings.npy')
    
    if not os.path.exists(encodings_file):
        return False, "User encodings file not found. Please create an email first."
    
    # Load existing encodings.npy
    data = np.load(encodings_file, allow_pickle=True).item()
    metadata = data.get("metadata", {})
    metadata.update({"name": name, "age": age})
    data["metadata"] = metadata
    
    # Save updated encodings.npy
    np.save(encodings_file, data)
    
    return True, "Metadata updated successfully."
    

def extract_face_encodings(image):
    """Extract face encodings from the image using face_recognition."""
    try:
        # Convert the image to a NumPy array (if it's not already)
        if not isinstance(image, np.ndarray):
            image = np.array(image)
        
        # Detect face locations in the image
        face_locations = nelston.face_locations(image, model="hog")  # You can use 'cnn' for higher accuracy
        
        if not face_locations:
            return "No faces detected in the image."

        # Extract face encodings for the detected faces
        encodings = nelston.face_encodings(image, face_locations)
        
        if not encodings:
            return "No face encodings could be extracted."

        # Return the list of face encodings
        return encodings
    except Exception as e:
        return f"Error extracting face encodings: {str(e)}"

def load_database_encodings():
    print("Loading database encodings...")
    database_path = "database"
    encodings_data = {}

    if os.path.exists(database_path):
        print(f"Found database path: {database_path}")
        for user_folder in os.listdir(database_path):
            encodings_file = os.path.join(database_path, user_folder, 'encodings.npy')
            if os.path.exists(encodings_file):
                print(f"Loading encodings for user: {user_folder}")
                user_data = np.load(encodings_file, allow_pickle=True).item()
                encodings_data[user_folder] = user_data
    else:
        print("Database path not found!")
    return encodings_data
    

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    print("First line")
    if session.get('logged_in'):
        return render_template('register.html')
    if request.method == "POST":
        username = request.form['username']
        password = request.form['password']
        if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
            session['logged_in'] = True
            return redirect(url_for('register'))
        else:
            print("Incorrect credentials")
            return render_template('login.html', error="Invalid credentials. Please try again.")
    print("Last line")
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)  # Remove the logged_in flag from the session
    return redirect(url_for('register'))


@app.route('/saveimages', methods=['POST'])
def save_images():
    response = {
        'errors': {},  # To hold errors for each field
        'status': 'failure',  # Overall status: 'success' or 'failure'
        'message': ''  # General message
    }
    required_fields = ['front-face', 'face-with-smile', 'face-left-20', 'face-left-45', 'face-node-up', 'face-node-down']
    
    # Get email from request
    email = request.form.get('email')
    if not email:
        response['message'] = "Email is required."
        return jsonify(response), 400

    # Extract user folder from email
    user_id = email.split('@')[0].strip().lower()
    user_folder = os.path.join('database', user_id)
    encodings_file = os.path.join(user_folder, 'encodings.npy')

    # Ensure user's folder exists
    if not os.path.exists(user_folder):
        response['message'] = "User folder does not exist. Register first."
        return jsonify(response), 404

    # Validate images
    validated_images = {}
    for field in required_fields:
        file = request.files.get(field)
        if not file:
            response['errors'][field] = 'No image uploaded.'
            continue

        # Validate the image
        validated_image, error = validate_image(file)
        if error:
            response['errors'][field] = error
        else:
            validated_images[field] = validated_image
    
    # If any image failed validation, return the response
    if validated_images.keys() != set(required_fields):
        response['message'] = "Some images failed validation."
        return jsonify(response), 400

    print("All images validated!")
    # Process and save encodings
    try:
        if os.path.exists(encodings_file):
            encodings_data = np.load(encodings_file, allow_pickle=True).item()
        else:
            encodings_data = {'metadata': {}, 'encodings': {}}

        # Extract face encodings
        print("Getting embeddings...")
        for field, image in validated_images.items():
            encoding = extract_face_encodings(image)
            if isinstance(encoding, str):  # If the function returned an error message
                print(f"Error extracting encoding for {field}: {encoding}")
                response['errors'][field] = encoding
                continue

            if not encoding:
                print(f"No encoding found for {field}.")
                response['errors'][field] = 'Error extracting face encodings.'
                continue

            encodings_data['encodings'][field] = encoding
            print(f"Successfully extracted encoding for {field}.")

        print("Encodings extracted and saved.")
        # Update metadata
        encodings_data['metadata']['email'] = email
        np.save(encodings_file, encodings_data)

        response['status'] = 'success'
        response['message'] = 'All images processed successfully and encodings saved.'
    except Exception as e:
        print(f"Exception occurred: {e}")
        response['message'] = f"An error occurred while processing images: {str(e)}"
        return jsonify(response), 500

    return jsonify(response)



@app.route('/new-email', methods=['POST'])
def new_email():
    email = request.json.get('email')
    print(email)
    if not email:
        return jsonify({"error": "Email is required", "error" : "None", "status" : "no email"})
    
    email = email.strip().lower()
    status = createUserDirectory(email)
    if status:
        return jsonify({"message": f"User already Exists for {email}", "error": "no error", "status": status}), 201

    else:
        return jsonify({"message": f"Directory created and email saved for {email}", "error": "no error",  "status": status}), 201

@app.route('/new-user', methods=['POST'])
def new_user():
    email = request.json.get('email')
    name = request.json.get('name')
    age = request.json.get('age')
    
    if not email or not name or not age:
        return jsonify({"error": "Email, name, and age are required"}), 400
    
    success, message = updateUserData(email.strip().lower(), name.strip(), age.strip())
    if not success:
        return jsonify({"error": message}), 404
    
    return jsonify({"message": message}), 200



@app.route('/process-image', methods=['POST'])
def process_image():
    print("Received a request to process an image.")

    file = request.files.get('file')
    if not file:
        print("No image file uploaded.")
        return jsonify({"message": "No image file uploaded."}), 400

    validated_image, error = validate_image(file)
    if error:
        print(f"Validation Error: {error}")
        return jsonify({"message": error}), 400

    try:
        print("Extracting face encoding from the uploaded image...")
        face_encoding = extract_face_encodings(validated_image)
        if isinstance(face_encoding, str):
            print(f"Error extracting face encoding: {face_encoding}")
            return jsonify({"message": face_encoding}), 400

        if not face_encoding:
            print("No face encoding extracted.")
            return jsonify({"message": "No face encoding could be extracted from the image."}), 400

        print("Face encoding extracted successfully.")

        database_encodings = load_database_encodings()

        # Step 1: Shortlist possible matches using a low threshold
        low_threshold = 0.6
        shortlisted_users = []
        print("Comparing with front-face encodings in the database (low threshold)...")
        for user_id, user_data in database_encodings.items():
            front_face_encoding = user_data['encodings'].get('front-face')
            if front_face_encoding:
                distance = np.linalg.norm(np.array(face_encoding) - np.array(front_face_encoding))
                if distance < low_threshold:
                    confidence = round((1 - distance + 0.1) * 100, 2)
                    shortlisted_users.append({"uid": user_id, "confidence": confidence})

        print(f"Shortlisted Users: {shortlisted_users}")

        # Step 2: Compare all encodings of shortlisted users with a high threshold
        high_threshold = 0.4
        best_match = None
        best_dist = 100000
        print("Comparing all encodings of shortlisted users (high threshold)...")
        for user in shortlisted_users:
            user_id = user["uid"]
            user_encodings = database_encodings[user_id]['encodings']
            for encoding_type, encoding in user_encodings.items():
                distance = np.linalg.norm(np.array(face_encoding) - np.array(encoding))
                print(f"Distance from {user_id}'s {encoding_type} encoding: {distance}")
                if distance < high_threshold and distance < best_dist:
                    print(f"Exact match found with user {user_id}.")
                    best_match = user_id
                    best_dist = distance

        # Step 3: Create JSON response
        possible_matches_json = []
        for user in shortlisted_users:
            uid = user["uid"]
            if uid == best_match:
                continue  # Exclude the best match from possible matches
            user_data = database_encodings[uid]
            possible_matches_json.append({
                "name": user_data["metadata"]["name"],
                "age": user_data["metadata"]["age"],
                "confidence": user["confidence"]
            })

        if best_match:
            best_match_data = database_encodings[best_match]
            best_match_json = {
                "name": best_match_data["metadata"]["name"],
                "age": best_match_data["metadata"]["age"],
                "email": best_match_data["metadata"]["email"],
                "confidence": round((1 - best_dist + 0.1) * 100, 2)
            }
        else:
            print("No exact match found.")
            best_match_json = "None"

        return jsonify({
            "best_match": best_match_json,
            "possible_matches": possible_matches_json
        })

    except Exception as e:
        print(f"An error occurred during processing: {str(e)}")
        return jsonify({"message": f"An error occurred: {str(e)}"}), 500
    


@app.route('/analysis', methods=['POST'])
def analyze_image():
    print("Received a request to process an image.")

    # Step 1: Verify the image
    file = request.files.get('file')
    if not file:
        print("No image file uploaded.")
        return jsonify({"message": "No image file uploaded."}), 400

    validated_image, error = validate_image(file)  # Replace with your validation logic
    if error:
        print(f"Validation Error: {error}")
        return jsonify({"message": error}), 400

    max_size = (640, 640)  # Resize to 640x640 pixels, or any suitable size
    validated_image = validated_image.resize(max_size)
    validated_image = np.array(validated_image)

    # try:
        # Step 2: Analyze the image using DeepFace
    print("Analyzing the image using DeepFace...")
    analysis_result = DeepFace.analyze(
        img_path=validated_image,  # Use the numpy array directly
        actions=['age', 'emotion', 'gender']
    )

    print("Analysis successful.")

    # Step 3: Extract and format the data for all detected faces
    all_faces_data = []
    for face_analysis in analysis_result:
        gender_data = face_analysis.get("gender", {})
        gender = max(gender_data, key=gender_data.get) if gender_data else "Unknown"
        face_data = {
            "age": float(face_analysis.get("age", "N/A")),  
            "emotion": face_analysis.get("dominant_emotion", "N/A"),
            "gender": gender
        }
        all_faces_data.append(face_data)
        print(all_faces_data)

    # Return the JSON response with data for all faces
    return jsonify({"data": all_faces_data})





if __name__ == '__main__':
    app.run(debug=True)
