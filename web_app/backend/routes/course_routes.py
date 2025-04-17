from fastapi import APIRouter, HTTPException, Depends
from typing import List
from controllers.course_controller import CourseController
from models.pydantic_models import CourseCreate, CourseResponse, CourseDetailResponse
from repositories.json_repository import JSONRepository

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)

def get_course_controller():
    repository = JSONRepository()
    return CourseController(repository)

@router.post("/", response_model=CourseResponse, status_code=201)
def create_course(course: CourseCreate, controller: CourseController = Depends(get_course_controller)):
    """Create a new course"""
    if controller.get_course(course.course_code):
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    success = controller.create_course(course.course_code, course.course_name)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to create course")
    
    return course

@router.get("/", response_model=List[CourseResponse])
def get_all_courses(controller: CourseController = Depends(get_course_controller)):
    """Getting all courses"""
    courses = controller.get_all_courses()
    return [{"course_code": c.course_code, "course_name": c.course_name} for c in courses]

@router.get("/{course_code}", response_model=CourseDetailResponse)
def get_course(course_code: str, controller: CourseController = Depends(get_course_controller)):
    """Getting a course by code"""
    course = controller.get_course(course_code)
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    students = controller.get_course_students(course_code)
    student_ids = [s.student_id for s in students]
    
    avg = controller.calculate_course_average(course_code)
    
    return {
        "course_code": course.course_code,
        "course_name": course.course_name,
        "students": student_ids,
        "average_grade": avg
    }