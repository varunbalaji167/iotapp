from iotutils import recog, create, set_user
import cv2


# create()
data = create()
recog(data, uid = "profile_picture")
auth = set_user()
value = auth.get("Registered")
    
if value is not None:
    Auth = {"Registered" : "YES", "CharakID" : value}
else:
    print("Not Registered")
    Auth = {"Registered" : "NO"}
    print(Auth)