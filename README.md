<h1 align="center">🧠 Facial Recognition System – Built by Logical Hammad</h1>

<p align="center">
Created with ❤️ by <strong>Logical Hammad</strong> — this AI-powered web app uses face recognition, emotion detection, and user registration to deliver an accurate, secure, and intelligent experience.
<br>
It’s a full-stack system built using <strong>Python, Flask, face_recognition, and DeepFace</strong> — with a sleek, responsive frontend to make everything feel simple and smooth.
</p>

---

# 🧠 Introduction

This is a smart AI-powered **Facial Recognition System** built using **Python**, **Flask**, and cutting-edge libraries like **face_recognition** and **DeepFace**.  
Created with love by **Logical Hammad**, this project aims to bring powerful recognition and classification capabilities into a sleek, intuitive web interface.

---

## 🚀 Technologies Used

- **Frontend**: HTML, CSS, JavaScript  
- **Backend**: Flask (Python)  
- **AI Libraries**:  
  - `face_recognition` – for face encoding and matching  
  - `deepface` – for emotion, gender, and age detection  
- **Database**: File-based using `.npy` (NumPy arrays)

---

## 🧑‍💼 Registration System

The system has a user-friendly **registration** flow that ensures **high-quality data collection** for reliable face recognition.

### 📸 Image Upload Requirements

Each user must upload **six images from different angles**:
1. Front - Straight
2. Front - Straight (Smiling)
3. Left - 30°
4. Left - 45°
5. Tilt Up
6. Tilt Down

> These ensure robust encoding by capturing facial features from multiple viewpoints.

✅ **Drag-and-drop or click-to-upload** supported  
✅ **Preview** of uploaded images with placeholders  
✅ Real-time **error display under each card** for:
- Image resolution and file type
- Face visibility and detection
- Multiple faces or no face
- Blurriness or bad lighting

Once passed, **face encodings** are generated via `face_recognition` and stored using NumPy `.npy` format, along with the user's metadata.

---

## 🕵️ Recognition Flow

To **recognize a person**, simply upload an image.  
The system performs:

- Frontend & backend validation
- Face encoding generation
- Matching using **Euler distance**  
- If match found below the threshold → ✅ Identity confirmed  
- If no perfect match → 🤔 Shows **top possible matches**

Additionally, using `deepface`, the system guesses:
- 🧠 **Mood**
- 🎂 **Age**
- 🚻 **Gender**

---

## 🎨 User Interface

This web app features a **clean, modern, and responsive UI** built to enhance usability while looking professional.  
Everything from drag-and-drop uploads, animated cards, to dynamic error messages is thoughtfully designed for the end user.

---

## 📂 Folder Structure
facial-recognition/
├── database
    └── username
       └── Their encodings in .npy file
├── static
    ├── CSS
    ├── JS
    └── Images
├── templates
    └── common
└── uploads


---

## 💡 Future Improvements

- Admin panel to manage users
- Live camera-based detection
- Database shift to MongoDB or Firebase
- API-based integration into other platforms
- Upload via mobile camera

---

## 🧪 Try It Yourself

Clone the repo, set up a virtual environment, and install dependencies:

```bash
git clone https://github.com/logicalhammad/Facial-Recognition
```

---

## 🎥 Related YouTube Video
📺 [Coming Soon] Watch how this system works — a full walkthrough on the Logical Hammad YouTube channel

🔗 About the Creator
I'm Hammad Mustafa, also known as Logical Hammad — a software engineer, AI enthusiast, and co-founder of Nelston Technologies. I build smart tech with purpose — from IoT to AI and everything in between.

This was Logical Hammad. I think you’ll love this project.
🔗 [An Awesome Project](#)



<br><br><br><br><br><br><br>








