from typing import List, Optional
from models.domain_models import Course, GradeManager
from repositories.json_repository import JSONRepository
from models.domain_models import Student

class CourseController:
    def __init__(self, repository: JSONRepository):
        self.repository = repository
        self.manager = repository.load() or GradeManager()
    
    def create_course(self, course_code: str, course_name: str) -> bool:
        """Create a new course"""
        course = Course(course_code, course_name)
        success = self.manager.add_course(course)
        if success:
            self.repository.save(self.manager)
        return success
    
    def get_all_courses(self) -> List[Course]:
        """Get all courses"""
        return self.manager.get_all_courses()
    
    def get_course(self, course_code: str) -> Optional[Course]:
        """Get a course by code"""
        return self.manager.get_course(course_code)
    
    def get_course_students(self, course_code: str) -> List[Student]:
        """Get all students enrolled in a course"""
        return self.manager.get_course_students(course_code)
    
    def calculate_course_average(self, course_code: str) -> Optional[float]:
        """Calculate the average grade for a course"""
        return self.manager.calculate_course_average(course_code)