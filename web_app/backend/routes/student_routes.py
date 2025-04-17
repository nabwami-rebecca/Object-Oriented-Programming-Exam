from fastapi import APIRouter, HTTPException, Depends
from typing import List
from controllers.student_controller import StudentController
from models.pydantic_models import StudentCreate, StudentResponse, StudentDetailResponse
from repositories.json_repository import JSONRepository

router = APIRouter(
    prefix="/students",
    tags=["students"],
    responses={404: {"description": "Not found"}},
)

def get_student_controller():
    repository = JSONRepository()
    return StudentController(repository)

@router.post("/", response_model=StudentResponse, status_code=201)
def create_student(student: StudentCreate, controller: StudentController = Depends(get_student_controller)):
    """Creating a new student"""
    if controller.get_student(student.student_id):
        raise HTTPException(status_code=400, detail="Student ID already exists")
    
    success = controller.create_student(student.student_id, student.student_name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create student")
    
    return student

@router.get("/", response_model=List[StudentResponse])
def get_all_students(controller: StudentController = Depends(get_student_controller)):
    """Getting all students"""
    students = controller.get_all_students()
    return [{"student_id": s.student_id, "student_name": s.student_name} for s in students]

@router.get("/{student_id}", response_model=StudentDetailResponse)
def get_student(student_id: str, controller: StudentController = Depends(get_student_controller)):
    """Getting a student by ID"""
    student = controller.get_student(student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return {
        "student_id": student.student_id,
        "student_name": student.student_name,
        "grades": student.get_all_grades()
    }