#algoritmo de incriptacion 
import base64
import json
import hmac
import hashlib
import time
SecretKey = "clave"

def Base64UrlEncode(Data: bytes) -> str:
    return base64.urlsafe_b64encode(Data).decode().rstrip("=")

def Base64UrlDecode(Data: str) -> bytes:
    Padding = '=' * (4 - (len(Data) % 4))
    return base64.urlsafe_b64decode(Data + Padding)

def CrearTokenAcceso(Payload: dict, ExpMinutes=60) -> str:
    Header = {"alg": "HS256", "typ": "JWT"}
    Payload["exp"] = int(time.time()) + (ExpMinutes * 60)

    HeaderEnc = Base64UrlEncode(json.dumps(Header, separators=(',', ':')).encode())
    PayloadEnc = Base64UrlEncode(json.dumps(Payload, separators=(',', ':')).encode())

    SigningInput = f"{HeaderEnc}.{PayloadEnc}".encode()
    Signature = hmac.new(SecretKey.encode(), SigningInput, hashlib.sha256).digest()
    SignatureEnc = Base64UrlEncode(Signature)

    JwtToken = f"{HeaderEnc}.{PayloadEnc}.{SignatureEnc}"
    return JwtToken

def VerificarToken(Token: str) -> dict | None:
    try:
        HeaderEnc, PayloadEnc, SignatureEnc = Token.split(".")

        SigningInput = f"{HeaderEnc}.{PayloadEnc}".encode()
        SignatureCheck = hmac.new(SecretKey.encode(), SigningInput, hashlib.sha256).digest()
        if SignatureEnc != Base64UrlEncode(SignatureCheck):
            print("Firma inválida")
            return None

        Payload = json.loads(Base64UrlDecode(PayloadEnc))
        if "exp" in Payload and time.time() > Payload["exp"]:
            print("Token expirado")
            return None

        return Payload
    except Exception as Error:
        print(f"Error verificando token: {Error}")
        return None