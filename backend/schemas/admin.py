

from pydantic import BaseModel


class AdminLogin(BaseModel):
    email: str
    password: str

class AdminResponse(BaseModel):
    id: int
    email: str

    model_config = {
        "from_attributes": True
    }

class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str

class AdminPasswordChange(BaseModel):
    old_password: str
    new_password: str
    confirm_new_password: str