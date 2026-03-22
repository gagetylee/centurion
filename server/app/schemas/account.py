from pydantic import BaseModel, ConfigDict

from app.models.enums import AccountType


class AccountCreate(BaseModel):
    name: str
    type: AccountType


class AccountUpdate(BaseModel):
    name: str | None = None
    type: AccountType | None = None


class AccountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: AccountType
