from iotutils import recog, create, set_user
import cv2


class Camera:
    def __init__(self):
        self.video = cv2.VideoCapture(0)  # Use 0 for default camera

    def __del__(self):
        self.video.release()

    def get_frame(self):
        ret, frame = self.video.read()
        return ret, frame


# create()
data = create()
recog(data, camera=Camera())
auth = set_user()
value = auth.get("Registered")
    
if value is not None:
    Auth = {"Registered" : "YES", "CharakID" : value}
else:
    print("Not Registered")
    Auth = {"Registered" : "NO"}
    print(Auth)