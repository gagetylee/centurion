from fastapi import APIRouter, Depends

from app.schemas.category import CategoryCreate, CategoryRead, CategoryTreeRead, CategoryUpdate
from app.dependencies import get_category_service
from app.services.category import CategoryService

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=CategoryRead, status_code=201)
def create_category(data: CategoryCreate, service: CategoryService = Depends(get_category_service)):
    return service.create(data)


@router.get("/", response_model=list[CategoryRead] | list[CategoryTreeRead])
def list_categories(
    skip: int = 0,
    limit: int = 100,
    parent_id: int | None = None,
    nested: bool = False,
    service: CategoryService = Depends(get_category_service),
):
    if nested:
        return service.get_tree()
    return service.get_all(skip, limit, parent_id)


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    return service.get(category_id)


@router.patch("/{category_id}", response_model=CategoryRead)
def update_category(category_id: int, data: CategoryUpdate, service: CategoryService = Depends(get_category_service)):
    return service.update(category_id, data)


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: int, service: CategoryService = Depends(get_category_service)):
    service.delete(category_id)
