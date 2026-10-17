# Track single-use editor guest sessions
_used_editor_sessions = set()

def mark_session_used(session_id: str | None):
    if session_id:
        _used_editor_sessions.add(session_id)

def is_session_used(session_id: str | None) -> bool:
    if not session_id:
        return False
    return session_id in _used_editor_sessions
