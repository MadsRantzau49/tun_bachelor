from fastapi import APIRouter, HTTPException
router = APIRouter()
from get_data import get_data, get_range

@router.get("/")
def start_test_endpoint(column_name: str, filename: str, number: float):
    try:
        return get_data(column_name, filename, number)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_range")
def start_test_endpoint():
    try:
        return get_range()
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))
