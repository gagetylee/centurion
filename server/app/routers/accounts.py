from fastapi import APIRouter, Depends

from app.schemas.account import AccountCreate, AccountRead, AccountUpdate
from app.dependencies import get_account_service
from app.services.account import AccountService

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("/", response_model=AccountRead, status_code=201)
def create_account(data: AccountCreate, service: AccountService = Depends(get_account_service)):
    return service.create(data)


@router.get("/", response_model=list[AccountRead])
def list_accounts(skip: int = 0, limit: int = 100, service: AccountService = Depends(get_account_service)):
    return service.get_all(skip, limit)


@router.get("/{account_id}", response_model=AccountRead)
def get_account(account_id: int, service: AccountService = Depends(get_account_service)):
    return service.get(account_id)


@router.patch("/{account_id}", response_model=AccountRead)
def update_account(account_id: int, data: AccountUpdate, service: AccountService = Depends(get_account_service)):
    return service.update(account_id, data)


@router.delete("/{account_id}", status_code=204)
def delete_account(account_id: int, service: AccountService = Depends(get_account_service)):
    service.delete(account_id)
