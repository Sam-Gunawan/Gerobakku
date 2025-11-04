#connecting to firebase
import firebase_admin
from firebase_admin import credentials, db
import os

# Load once at startup
def init_firebase():
    cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "serviceAccountKey.json"))
    firebase_admin.initialize_app(cred, {
        "databaseURL": os.getenv("FIREBASE_DB_URL")  # e.g. https://yourid.firebaseio.com
    })

def rtdb():
    return db