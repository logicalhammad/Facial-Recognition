import numpy as np

file_name = "thelogicalhammadmustafa/encodings.npy"
# Load the .npy file
loaded_data = np.load(file_name, allow_pickle=True).item()  # Use allow_pickle=True for dictionaries

print(loaded_data)
# print("Metadata:", loaded_data["metadata"])
# print("Face Encoding:", loaded_data["encodings"])

