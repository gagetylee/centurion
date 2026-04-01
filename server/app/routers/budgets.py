from fastapi import APIRouter, Depends

from app.db.models.enums import BudgetType
from app.schemas.budget import BudgetCreate, BudgetRead, BudgetStatus, BudgetUpdate
from app.dependencies import get_budget_service
from app.services.budget import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.post("/", response_model=BudgetRead, status_code=201)
def create_budget(data: BudgetCreate, service: BudgetService = Depends(get_budget_service)):
    return service.create(data)


@router.get("/", response_model=list[BudgetRead])
def list_budgets(skip: int = 0, limit: int = 100, type: BudgetType | None = None, service: BudgetService = Depends(get_budget_service)):
    return service.get_all(skip, limit, type)


@router.get("/{budget_id}", response_model=BudgetRead)
def get_budget(budget_id: int, service: BudgetService = Depends(get_budget_service)):
    return service.get(budget_id)


@router.get("/{budget_id}/status", response_model=BudgetStatus)
def get_budget_status(budget_id: int, service: BudgetService = Depends(get_budget_service)):
    return service.get_status(budget_id)


@router.patch("/{budget_id}", response_model=BudgetRead)
def update_budget(budget_id: int, data: BudgetUpdate, service: BudgetService = Depends(get_budget_service)):
    return service.update(budget_id, data)


@router.delete("/{budget_id}", status_code=204)
def delete_budget(budget_id: int, service: BudgetService = Depends(get_budget_service)):
    service.delete(budget_id)
