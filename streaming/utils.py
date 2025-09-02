import hmac, hashlib, time
from django.conf import settings

def sign_download(asset_id: int, exp_ts: int) -> str:
    msg = f"{asset_id}:{exp_ts}".encode()
    key = settings.SECRET_KEY.encode()
    return hmac.new(key, msg, hashlib.sha256).hexdigest()

def verify_download(asset_id: int, exp_ts: int, token: str) -> bool:
    if int(exp_ts) < int(time.time()):
        return False
    expected = sign_download(asset_id, int(exp_ts))
    return hmac.compare_digest(expected, token)
