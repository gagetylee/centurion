from fastapi import APIRouter, Depends

from app.dependencies import get_bank_service
from app.services.bank import BankService

router = APIRouter(prefix="/plaid", tags=["plaid"])


@router.post("/{plaid_item_id}/sync")
def sync(plaid_item_id: int, service: BankService = Depends(get_bank_service)):
    count = service.sync(plaid_item_id)
    return {"synced": count}


@router.post("/sync-all")
def sync_all(service: BankService = Depends(get_bank_service)):
    count = service.sync_all()
    return {"synced": count}
