from fastapi import APIRouter, HTTPException, Depends
from controllers.report_controller import ReportController
from models.pydantic_models import TranscriptResponse, CoursePerformance
from repositories.json_repository import JSONRepository

router = APIRouter(
    prefix="/reports",
    tags=["reports"],
    responses={404: {"description": "Not found"}},
)

def get_report_controller():
    repository = JSONRepository()
    return ReportController(repository)

@router.get("/transcript/{student_id}", response_model=TranscriptResponse)
def get_student_transcript(student_id: str, controller: ReportController = Depends(get_report_controller)):
    """Generating a transcript for a student"""
    transcript = controller.generate_student_transcript(student_id)
    if not transcript:
        raise HTTPException(status_code=404, detail="Student not found")
    
    return transcript

@router.get("/course-performance/{course_code}", response_model=CoursePerformance)
def get_course_performance(course_code: str, controller: ReportController = Depends(get_report_controller)):
    """Generating a performance report for a course"""
    performance = controller.generate_course_performance(course_code)
    if not performance:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return performance