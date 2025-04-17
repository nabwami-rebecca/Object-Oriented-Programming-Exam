from typing import Dict, List, Optional, Tuple
from models.domain_models import GradeManager, GradeCategory
from repositories.json_repository import JSONRepository

class GradeController:
    def __init__(self, repository: JSONRepository):
        self.repository = repository
        self.manager = repository.load() or GradeManager()
    
    def register_for_course(self, student_id: str, course_code: str) -> bool:
        """Register a student for a course"""
        success = self.manager.register_student_for_course(student_id, course_code)
        if success:
            self.repository.save(self.manager)
        return success
    
    def assign_grade(self, student_id: str, course_code: str, grade: float) -> Tuple[bool, Optional[str]]:
        """Assign a grade to a student for a course"""
        success = self.manager.assign_grade(student_id, course_code, grade)
        if success:
            self.repository.save(self.manager)
            letter_grade = GradeCategory.get_letter_grade(grade)
            return True, letter_grade
        return False, None
    
    def get_student_grades(self, student_id: str) -> Optional[Dict]:
        """Get all grades for a student with formatted information"""
        student = self.manager.get_student(student_id)
        if not student:
            return None
        
        grades = student.get_all_grades()
        formatted_grades = []
        
        for course_code, grade in grades.items():
            course = self.manager.get_course(course_code)
            if course:
                formatted_grades.append({
                    "course_code": course_code,
                    "course_name": course.course_name,
                    "grade": grade,
                    "letter_grade": GradeCategory.get_letter_grade(grade)
                })
        
        return {
            "student_id": student.student_id,
            "student_name": student.student_name,
            "grades": formatted_grades
        }
    
    def get_course_grades(self, course_code: str) -> Optional[Dict]:
        """Get all grades for a course with formatted information"""
        course = self.manager.get_course(course_code)
        if not course:
            return None
        
        students = self.manager.get_course_students(course_code)
        grades = []
        
        for student in students:
            grade = student.get_grade(course_code)
            if grade is not None:
                grades.append({
                    "student_id": student.student_id,
                    "student_name": student.student_name,
                    "grade": grade,
                    "letter_grade": GradeCategory.get_letter_grade(grade)
                })
        
        return {
            "course_code": course.course_code,
            "course_name": course.course_name,
            "grades": grades
        }