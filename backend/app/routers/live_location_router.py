#this is to to define the endpoints for live location updates
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect
from ..schemas.live_location_schema import LiveLocation
from ..firebase import rtdb
import asyncio
from typing import Dict, Set

router = APIRouter(prefix="/locations", tags=["locations"])

# in-memory subscribers per uid
subscribers: Dict[str, Set[WebSocket]] = {}

async def broadcast(uid: str, payload: dict):
    conns = list(subscribers.get(uid, set()))
    for ws in conns:
        try:
            await ws.send_json(payload)
        except Exception:
            # drop broken connections
            try:
                await ws.close()
            except: ...
            subscribers[uid].discard(ws)

@router.post("", status_code=204)
async def upsert_location(loc: LiveLocation):
    try:
        payload = loc.with_server_time()
        rtdb().reference(f"liveLocations/{loc.uid}").set(payload)
        # notify connected browsers
        await broadcast(loc.uid, payload)
        return
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{uid}")
def get_latest(uid: str):
    try:
        snap = rtdb().reference(f"liveLocations/{uid}").get()
        if not snap:
            raise HTTPException(status_code=404, detail="Not found")
        return snap
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.websocket("/ws/{uid}")
async def ws_location(ws: WebSocket, uid: str):
    await ws.accept()
    subscribers.setdefault(uid, set()).add(ws)
    try:
        while True:
            # keep-alive; we don't expect client messages
            await asyncio.sleep(60)
    except WebSocketDisconnect:
        pass
    finally:
        subscribers.get(uid, set()).discard(ws)
