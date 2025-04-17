from pydantic import BaseModel, Field
from typing import Dict, List, Optional

### Request Models
class StudentCreate(BaseModel):
    student_id: str
    student_name: str

class CourseCreate(BaseModel):
    course_code: str
    course_name: str

class EnrollmentCreate(BaseModel):
    student_id: str
    course_code: str

class GradeAssign(BaseModel):
    student_id: str
    course_code: str
    grade: float

### Response Models
class StudentResponse(BaseModel):
    student_id: str
    student_name: str

class StudentDetailResponse(StudentResponse):
    grades: Dict[str, float] = Field(default_factory=dict)

class CourseResponse(BaseModel):
    course_code: str
    course_name: str

class CourseDetailResponse(CourseResponse):
    students: List[str] = Field(default_factory=list)
    average_grade: Optional[float] = None

class GradeInfo(BaseModel):
    course_code: str
    course_name: str
    numeric_grade: float
    letter_grade: str
    status: str

class TranscriptResponse(BaseModel):
    student_id: str
    student_name: str
    courses: List[GradeInfo] = Field(default_factory=list)
    gpa: float
    total_courses: int
    passed_courses: int

class CoursePerformance(BaseModel):
    course_code: str
    course_name: str
    num_students: int
    num_graded: int
    average_grade: Optional[float] = None
    highest_grade: Optional[float] = None
    lowest_grade: Optional[float] = None
    pass_rate: Optional[float] = None
    grade_distribution: Dict[str, int] = Field(default_factory=dict)

class MessageResponse(BaseModel):
    status: str
    message: str