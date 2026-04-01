from fastapi import APIRouter, Depends, Query

from app.schemas.transaction import TransactionCreate, TransactionFilter, TransactionRead, TransactionUpdate
from app.dependencies import get_transaction_service
from app.services.transaction import TransactionService

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionRead, status_code=201)
def create_transaction(data: TransactionCreate, service: TransactionService = Depends(get_transaction_service)):
    return service.create(data)


@router.get("/", response_model=list[TransactionRead])
def list_transactions(
    filters: TransactionFilter = Depends(),
    service: TransactionService = Depends(get_transaction_service),
):
    return service.get_all(filters)


@router.get("/{transaction_id}", response_model=TransactionRead)
def get_transaction(transaction_id: int, service: TransactionService = Depends(get_transaction_service)):
    return service.get(transaction_id)


@router.patch("/{transaction_id}", response_model=TransactionRead)
def update_transaction(transaction_id: int, data: TransactionUpdate, service: TransactionService = Depends(get_transaction_service)):
    return service.update(transaction_id, data)


@router.delete("/{transaction_id}", status_code=204)
def delete_transaction(transaction_id: int, service: TransactionService = Depends(get_transaction_service)):
    service.delete(transaction_id)
