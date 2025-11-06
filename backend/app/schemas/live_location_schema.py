#defining all the data types needed for live location
from pydantic import BaseModel, Field, confloat
from typing import Optional
import time

class LiveLocation(BaseModel):
    uid: str = Field(..., min_length=1)
    lat: confloat(ge=-90, le=90)
    lng: confloat(ge=-180, le=180)
    accuracy: Optional[confloat(ge=0)] = None
    speed: Optional[confloat(ge=0)] = None
    heading: Optional[confloat(ge=0, le=360)] = None
    updatedAt: Optional[int] = None

    def with_server_time(self):
        d = self.model_dump()
        d["updatedAt"] = int(time.time() * 1000)
        return d
