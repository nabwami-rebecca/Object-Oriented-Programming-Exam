from typing import Dict, Optional
from models.domain_models import GradeManager, GradeCategory
from repositories.json_repository import JSONRepository

class ReportController:
    def __init__(self, repository: JSONRepository):
        self.repository = repository
        self.manager = repository.load() or GradeManager()
    
    def generate_student_transcript(self, student_id: str) -> Optional[Dict]:
        """Generate a transcript for a student"""
        return self.manager.generate_student_transcript(student_id)
    
    def generate_course_performance(self, course_code: str) -> Optional[Dict]:
        """Generate a performance report for a course"""
        course = self.manager.get_course(course_code)
        if not course:
            return None
        
        students = self.manager.get_course_students(course_code)
        if not students:
            return {
                "course_code": course_code,
                "course_name": course.course_name,
                "num_students": 0,
                "num_graded": 0,
                "grade_distribution": {}
            }
        
        # Get grades for reporting
        grades = []
        grade_distribution = {"A": 0, "B+": 0, "B-": 0, "C+": 0, "C-": 0, "E": 0, "F": 0}
        
        for student in students:
            grade = student.get_grade(course_code)
            if grade is not None:
                grades.append(grade)
                letter_grade = GradeCategory.get_letter_grade(grade)
                grade_distribution[letter_grade] += 1
        
        if not grades:
            return {
                "course_code": course_code,
                "course_name": course.course_name,
                "num_students": len(students),
                "num_graded": 0,
                "grade_distribution": {}
            }
        
        avg = sum(grades) / len(grades)
        max_grade = max(grades)
        min_grade = min(grades)
        passing = sum(1 for g in grades if GradeCategory.is_passing(g))
        pass_rate = (passing / len(grades)) * 100
        
        return {
            "course_code": course_code,
            "course_name": course.course_name,
            "num_students": len(students),
            "num_graded": len(grades),
            "average_grade": avg,
            "highest_grade": max_grade,
            "lowest_grade": min_grade,
            "pass_rate": pass_rate,
            "grade_distribution": {k: v for k, v in grade_distribution.items() if v > 0}
        }