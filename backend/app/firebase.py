#connecting to firebase
import os
import json
from pathlib import Path
import firebase_admin
from dotenv import load_dotenv
from firebase_admin import credentials, db


def init_firebase():
    load_dotenv()
    svc = os.getenv("FIREBASE_SERVICE_ACCOUNT")
    if not svc:
        raise RuntimeError("FIREBASE_SERVICE_ACCOUNT not set. Provide path or full JSON in env.")

    # decide if env value is JSON text or a file path
    cred_input = None
    if svc.strip().startswith("{"):
        # parse JSON from environment variable
        try:
            cred_input = json.loads(svc)
        except json.JSONDecodeError as e:
            raise RuntimeError("FIREBASE_SERVICE_ACCOUNT contains invalid JSON") from e

        # fix private_key newlines when stored as single-line string
        if "private_key" in cred_input and isinstance(cred_input["private_key"], str):
            cred_input["private_key"] = cred_input["private_key"].replace("\\n", "\n")
    else:
        # treat as file path
        p = Path(svc)
        if not p.exists():
            raise FileNotFoundError(f"Firebase service account file not found: {svc}")
        cred_input = str(p)

    db_url = os.getenv("FIREBASE_DATABASE_URL")

    cred = credentials.Certificate(cred_input)
    firebase_admin.initialize_app(cred, {"databaseURL": db_url})

def rtdb():
    return db
