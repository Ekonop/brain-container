"""WebRTC signaling server for P2P connections."""

import json
import asyncio
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

# Active signaling sessions: session_id -> {offer, answer, ice_candidates}
sessions: dict[str, dict] = {}


@router.get("/webrtc/config")
async def webrtc_config():
    """Return STUN/TURN server configuration for clients."""
    return {
        "iceServers": [
            {"urls": "stun:stun.l.google.com:19302"},
            {"urls": "stun:stun1.l.google.com:19302"},
            {"urls": "stun:stun2.l.google.com:19302"},
        ],
        "fallback": "cloudflare_tunnel",
    }


@router.websocket("/webrtc/signal/{session_id}")
async def webrtc_signal(ws: WebSocket, session_id: str):
    """WebRTC signaling endpoint. Exchanges SDP offers/answers and ICE candidates."""
    await ws.accept()
    if session_id not in sessions:
        sessions[session_id] = {"offer": None, "answer": None, "ice": []}

    session = sessions[session_id]
    role = None

    try:
        # First message determines role
        first = await ws.receive_text()
        msg = json.loads(first)
        role = msg.get("role", "caller")

        if role == "caller":
            # Caller sends offer
            session["offer"] = msg.get("offer")
            session["caller_ws"] = ws
            # Wait for answer from callee
            while session["answer"] is None:
                await asyncio.sleep(0.1)
            await ws.send_text(json.dumps({"type": "answer", "sdp": session["answer"]}))
            # Exchange ICE candidates
            await _exchange_ice(ws, session, "caller")
        else:
            # Callee waits for offer
            while session["offer"] is None:
                await asyncio.sleep(0.1)
            await ws.send_text(json.dumps({"type": "offer", "sdp": session["offer"]}))
            # Callee sends answer
            answer_msg = await ws.receive_text()
            answer_data = json.loads(answer_msg)
            session["answer"] = answer_data.get("answer")
            await _exchange_ice(ws, session, "callee")

    except WebSocketDisconnect:
        sessions.pop(session_id, None)


async def _exchange_ice(ws: WebSocket, session: dict, role: str):
    """Exchange ICE candidates between peers."""
    import asyncio
    timeout = 30  # seconds
    start = asyncio.get_event_loop().time()
    while asyncio.get_event_loop().time() - start < timeout:
        try:
            msg = await asyncio.wait_for(ws.receive_text(), timeout=1.0)
            data = json.loads(msg)
            if data.get("type") == "ice":
                session["ice"].append({"role": role, "candidate": data["candidate"]})
                # Forward to other peer
                other = "callee" if role == "caller" else "caller"
                other_ws = session.get(f"{other}_ws")
                if other_ws:
                    await other_ws.send_text(json.dumps({"type": "ice", "candidate": data["candidate"]}))
            elif data.get("type") == "done":
                break
        except asyncio.TimeoutError:
            # Check if other peer sent ICE candidates
            for ice in session["ice"]:
                if ice["role"] != role:
                    await ws.send_text(json.dumps({"type": "ice", "candidate": ice["candidate"]}))
            continue
        except WebSocketDisconnect:
            break


@router.get("/webrtc/status")
async def webrtc_status():
    return {"active_sessions": len(sessions), "sessions": list(sessions.keys())}
