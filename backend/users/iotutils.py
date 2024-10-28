import os
import pickle
import cv2
import face_recognition
import imutils
from imutils.video import FPS
from django.conf import settings  
from .models import CustomUser

def create():
    if os.path.exists("encodings1.pickle"):
        print("loading encodings...")
        data = pickle.loads(open("encodings1.pickle", "rb").read())
    else:
        data = {"encodings": [], "names": []}
    print("Checking for new classes...")
    people = os.listdir('media')  # Ensure 'media' path is correct
    for i in people:
        # Skip files that are not directories
        if not os.path.isdir(os.path.join("media", i)):
            continue
        if i not in data['names']:
            for j in os.listdir(os.path.join("media", i)):
                print("processing image {}/{}".format(i, j))
                name = i
                image_path = os.path.join("media", i, j)
                image = cv2.imread(image_path)  # Load image with correct path
                if image is None:
                    print(f"Error loading image: {image_path}")  # Handle missing images
                    continue
                
                rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
                boxes = face_recognition.face_locations(rgb, model="HOG")
                encodings = face_recognition.face_encodings(rgb, boxes, num_jitters=10)
                for encoding in encodings:
                    data['encodings'].append(encoding)
                    data['names'].append(name)
    print("serializing encodings...")
    with open("encodings1.pickle", "wb") as f:  # Use context manager for file handling
        f.write(pickle.dumps(data))
    return data

#-------------------------------------------------------------------------------------------------------------------
def recog(data, camera):
    # Use an absolute path for faces.xml
    fa_path = os.path.join(settings.BASE_DIR, 'users', 'faces.xml') 
    fa = cv2.CascadeClassifier(fa_path)
    
    if fa.empty():
        print("Error loading face cascade. Check the path to faces.xml.")
        return "Error loading face cascade"
    
    process = 0
    flag = 0

    while True:
        global nothing
        nothing = None
        global user
        user = None
        
        ret, frame = camera.get_frame()
        if not ret:
            print("Failed to grab frame from camera")
            break
        
        frame = cv2.flip(frame, 1)
        frame = imutils.resize(frame, width=800)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        rects = fa.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=6, minSize=(30, 30))
        face_locations = [(y, x + w, y + h, x) for (x, y, w, h) in rects]

        if process % 10 == 0 and face_locations:  # Only proceed if face locations are found
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

            mean = {}
            for (top, right, bottom, left), face_encoding in zip(face_locations, face_encodings):
                face_distances = face_recognition.face_distance(data["encodings"], face_encoding)

                for i in range(len(face_distances)):
                    name = data['names'][i]
                    mean[name] = (mean.get(name, 0) + face_distances[i])

            for i in mean:
                mean[i] /= data['names'].count(i)
            if mean:
                if min(mean.values()) < 0.48:
                    name = min(mean, key=mean.get)
                    print(name)
                    user = name
                    return user
                else:
                    name = "No Match"
                
                nothing = "Yes"
                mean[name] = 0
                return nothing
            else:
                return "No Match"
        
        process += 1

        if not flag:
            fps = FPS().start()
            flag = 1

        if 0xFF == ord('q'):
            break

        fps.update()

    fps.stop()
    print("Elapsed time: {:.2f}".format(fps.elapsed()))
    print("Approx. FPS: {:.2f}".format(fps.fps()))

    return mean, face_distances

#-------------------------------------------------------------------------------------------------------------------

def set_user(recognized_user):
    print(f"set_user called with: {recognized_user}")
    if recognized_user:
        print("Attempting to retrieve user from database.")
        try:
            user = CustomUser.objects.get(username=recognized_user)
            print("User found.")
            return {"Registered": user.username}
        except CustomUser.DoesNotExist:
            print("User does not exist.")
            return {"Registered": None}
    print("No recognized user provided.")
    return {"Registered": None}
#-------------------------------------------------------------------------------------------------------------------