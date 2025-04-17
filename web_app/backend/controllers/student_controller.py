from typing import List, Optional
from models.domain_models import Student, GradeManager
from repositories.json_repository import JSONRepository

class StudentController:
    def __init__(self, repository: JSONRepository):
        self.repository = repository
        self.manager = repository.load() or GradeManager()
    
    def create_student(self, student_id: str, student_name: str) -> bool:
        """Creating a new student"""
        student = Student(student_id, student_name)
        success = self.manager.add_student(student)
        if success:
            self.repository.save(self.manager)
        return success
    
    def get_all_students(self) -> List[Student]:
        """Getting all students"""
        return self.manager.get_all_students()
    
    def get_student(self, student_id: str) -> Optional[Student]:
        """Getting a student by ID"""
        return self.manager.get_student(student_id)