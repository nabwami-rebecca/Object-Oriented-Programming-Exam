from typing import Dict, List, Optional, Union

class Course:
    """Represents a course entity in the grade management system."""
    
    def __init__(self, course_code: str, course_name: str):
        self._course_code = course_code
        self._course_name = course_name
    
    @property
    def course_code(self) -> str:
        """Get the course code."""
        return self._course_code
    
    @property
    def course_name(self) -> str:
        """Get the course name."""
        return self._course_name
    
    def __str__(self) -> str:
        """String representation of the Course."""
        return f"{self._course_code}: {self._course_name}"
    
    def to_dict(self) -> Dict:
        """Convert Course object to dictionary for JSON serialization."""
        return {
            "course_code": self._course_code,
            "course_name": self._course_name
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Course':
        """Create a Course object from a dictionary."""
        return cls(data["course_code"], data["course_name"])


class Student:
    """Represents a student entity in the grade management system."""
    
    def __init__(self, student_id: str, student_name: str):
        self._student_id = student_id
        self._student_name = student_name
        self._grades: Dict[str, float] = {}  # Maps course_code to grade
    
    @property
    def student_id(self) -> str:
        """Get the student ID."""
        return self._student_id
    
    @property
    def student_name(self) -> str:
        """Get the student name."""
        return self._student_name
    
    def add_grade(self, course: Union[Course, str], grade: float) -> None:
        course_code = course.course_code if isinstance(course, Course) else course
        self._grades[course_code] = grade
    
    def get_grade(self, course: Union[Course, str]) -> Optional[float]:
        course_code = course.course_code if isinstance(course, Course) else course
        return self._grades.get(course_code)
    
    def get_all_grades(self) -> Dict[str, float]:
        """Get all grades for the student."""
        return self._grades.copy()
    
    def __str__(self) -> str:
        """String representation of the Student."""
        return f"{self._student_id}: {self._student_name}"
    
    def to_dict(self) -> Dict:
        """Convert Student object to dictionary for JSON serialization."""
        return {
            "student_id": self._student_id,
            "student_name": self._student_name,
            "grades": self._grades
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Student':
        """Create a Student object from a dictionary."""
        student = cls(data["student_id"], data["student_name"])
        student._grades = data["grades"]
        return student


class GradeCategory:
    """Utility class for categorizing numeric grades into letter grades."""
    
    @staticmethod
    def get_letter_grade(numeric_grade: float) -> str:

        if numeric_grade >= 80:
            return "A"
        elif numeric_grade >= 75:
            return "B+"
        elif numeric_grade >= 70:
            return "B-"
        elif numeric_grade >= 60:
            return "C+"
        elif numeric_grade >= 50:
            return "C-"
        elif numeric_grade >= 40:
            return "E"
        else:
            return "F"
    
    @staticmethod
    def is_passing(numeric_grade: float) -> bool:
        return numeric_grade >= 40


class GradeManager:
    """
    Central manager for handling student and course data, 
    and orchestrating grade operations.
    """
    
    def __init__(self):
        """Initialize the GradeManager with empty collections."""
        self._students: Dict[str, Student] = {}  # Maps student_id to Student
        self._courses: Dict[str, Course] = {}    # Maps course_code to Course
        self._enrollments: Dict[str, List[str]] = {}  # Maps course_code to list of student_ids
    
    def add_student(self, student: Student) -> bool:
        if student.student_id in self._students:
            return False
        
        self._students[student.student_id] = student
        return True
    
    def add_course(self, course: Course) -> bool:
        if course.course_code in self._courses:
            return False
        
        self._courses[course.course_code] = course
        self._enrollments[course.course_code] = []
        return True
    
    def get_student(self, student_id: str) -> Optional[Student]:
        """Get a student by their ID."""
        return self._students.get(student_id)
    
    def get_course(self, course_code: str) -> Optional[Course]:
        """Get a course by its code."""
        return self._courses.get(course_code)
    
    def register_student_for_course(self, student_id: str, course_code: str) -> bool:
        if (student_id not in self._students or 
            course_code not in self._courses or
            student_id in self._enrollments.get(course_code, [])):
            return False
        
        self._enrollments[course_code].append(student_id)
        return True
    
    def assign_grade(self, student_id: str, course_code: str, grade: float) -> bool:
        if (student_id not in self._students or 
            course_code not in self._courses or
            student_id not in self._enrollments.get(course_code, [])):
            return False
        
        student = self._students[student_id]
        student.add_grade(course_code, grade)
        return True
    
    def get_student_grades(self, student_id: str) -> Optional[Dict[str, float]]:
        student = self._students.get(student_id)
        return student.get_all_grades() if student else None
    
    def calculate_course_average(self, course_code: str) -> Optional[float]:
        if course_code not in self._courses:
            return None
        
        grades = []
        for student_id in self._enrollments.get(course_code, []):
            student = self._students[student_id]
            grade = student.get_grade(course_code)
            if grade is not None:
                grades.append(grade)
        
        return sum(grades) / len(grades) if grades else None
    
    def get_all_students(self) -> List[Student]:
        """Get all students in the system."""
        return list(self._students.values())
    
    def get_all_courses(self) -> List[Course]:
        """Get all courses in the system."""
        return list(self._courses.values())
    
    def get_course_students(self, course_code: str) -> List[Student]:
        """Get all students enrolled in a specific course."""
        if course_code not in self._courses:
            return []
        
        student_ids = self._enrollments.get(course_code, [])
        return [self._students[sid] for sid in student_ids if sid in self._students]
    
    def generate_student_transcript(self, student_id: str) -> Optional[Dict]:
        student = self.get_student(student_id)
        if not student:
            return None
        
        transcript = {
            "student_id": student.student_id,
            "student_name": student.student_name,
            "courses": [],
            "gpa": 0.0,
            "total_courses": 0,
            "passed_courses": 0
        }
        
        total_grade_points = 0
        
        for course_code, numeric_grade in student.get_all_grades().items():
            course = self.get_course(course_code)
            if not course:
                continue
                
            letter_grade = GradeCategory.get_letter_grade(numeric_grade)
            passed = GradeCategory.is_passing(numeric_grade)
            
            course_info = {
                "course_code": course_code,
                "course_name": course.course_name,
                "numeric_grade": numeric_grade,
                "letter_grade": letter_grade,
                "status": "PASS" if passed else "FAIL"
            }
            
            transcript["courses"].append(course_info)
            transcript["total_courses"] += 1
            
            if passed:
                transcript["passed_courses"] += 1
                if letter_grade == "A":
                    total_grade_points += 5.0
                elif letter_grade == "B+":
                    total_grade_points += 4.5
                elif letter_grade == "B-":
                    total_grade_points += 4.0
                elif letter_grade == "C+":
                    total_grade_points += 3.5
                elif letter_grade == "C-":
                    total_grade_points += 3.0
                elif letter_grade == "E":
                    total_grade_points += 2.0
        
        if transcript["total_courses"] > 0:
            transcript["gpa"] = round(total_grade_points / transcript["total_courses"], 2)
        
        return transcript
    
    def to_dict(self) -> Dict:
        """Convert GradeManager object to dictionary for JSON serialization."""
        return {
            "students": {sid: student.to_dict() for sid, student in self._students.items()},
            "courses": {code: course.to_dict() for code, course in self._courses.items()},
            "enrollments": self._enrollments
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'GradeManager':
        """Create a GradeManager object from a dictionary."""
        manager = cls()
        
        for course_data in data.get("courses", {}).values():
            course = Course.from_dict(course_data)
            manager._courses[course.course_code] = course
        
        for student_data in data.get("students", {}).values():
            student = Student.from_dict(student_data)
            manager._students[student.student_id] = student
        
        manager._enrollments = data.get("enrollments", {})
        return manager