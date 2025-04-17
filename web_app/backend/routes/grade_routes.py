from fastapi import APIRouter, HTTPException, Depends
from controllers.grade_controller import GradeController
from models.pydantic_models import EnrollmentCreate, GradeAssign, MessageResponse
from repositories.json_repository import JSONRepository

router = APIRouter(
    prefix="/grades",
    tags=["grades"],
    responses={404: {"description": "Not found"}},
)

def get_grade_controller():
    repository = JSONRepository()
    return GradeController(repository)

@router.post("/enroll", response_model=MessageResponse, status_code=201)
def create_enrollment(enrollment: EnrollmentCreate, controller: GradeController = Depends(get_grade_controller)):
    """Register a student for a course"""
    success = controller.register_for_course(enrollment.student_id, enrollment.course_code)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to register student for course")
    
    return {"status": "success", "message": "Student enrolled successfully"}

@router.post("/assign", response_model=MessageResponse, status_code=201)
def assign_grade(grade: GradeAssign, controller: GradeController = Depends(get_grade_controller)):
    """Assign a grade to a student for a course"""
    if grade.grade < 0 or grade.grade > 100:
        raise HTTPException(status_code=400, detail="Grade must be between 0 and 100")
    
    success, letter_grade = controller.assign_grade(grade.student_id, grade.course_code, grade.grade)
    if not success:
        raise HTTPException(status_code=400, detail="Failed to assign grade")
    
    return {
        "status": "success", 
        "message": f"Grade {grade.grade} ({letter_grade}) assigned successfully"
    }

@router.get("/student/{student_id}")
def get_student_grades(student_id: str, controller: GradeController = Depends(get_grade_controller)):
    """Getting all grades for a student"""
    grades = controller.get_student_grades(student_id)
    if not grades:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return grades

@router.get("/course/{course_code}")
def get_course_grades(course_code: str, controller: GradeController = Depends(get_grade_controller)):
    """Getting all grades for a course"""
    grades = controller.get_course_grades(course_code)
    if not grades:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return grades