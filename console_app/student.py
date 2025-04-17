from typing import  TYPE_CHECKING, Dict, Optional, Union
from course import Course
if TYPE_CHECKING:
    from grade import GradeManager

class Student:
    """Represents a student entity in the grade management system."""

    def __init__(self, student_id: str, student_name: str):
        self._student_id = student_id
        self._student_name = student_name
        self._grades: Dict[str, float] = {}  ### mapping course_code to grade

    @property
    def student_id(self) -> str:
        """Get the student ID."""
        return self._student_id

    @property
    def student_name(self) -> str:
        """Get the student name."""
        return self._student_name

    def add_grade(self, course: Union[Course, str], grade: float) -> None:
        """
        Adding or updating a grade for a specific course.
        """
        course_code = course.course_code if isinstance(course, Course) else course
        self._grades[course_code] = grade

    def get_grade(self, course: Union[Course, str]) -> Optional[float]:
        """
        Getting the grade for a specific course.
        """
        course_code = course.course_code if isinstance(course, Course) else course
        return self._grades.get(course_code)

    def get_all_grades(self) -> Dict[str, float]:
        """Getting all grades for the student."""
        return self._grades.copy()

    def __str__(self) -> str:
        """String representation of the Student."""
        return f"{self._student_id}: {self._student_name}"

    def to_dict(self) -> Dict:
        """Converting student object to dictionary for JSON serialization."""
        return {
            "student_id": self._student_id,
            "student_name": self._student_name,
            "grades": self._grades
        }

    @classmethod
    def from_dict(cls, data: Dict) -> 'Student':
        """Creating a student object from a dictionary"""
        student = cls(data["student_id"], data["student_name"])
        student._grades = data["grades"]
        return student

    def get_transcript(self, grade_manager: 'GradeManager') -> Dict:
        from grade import GradeCategory
        """
        Generating a transcript for the student with detailed course information
        and letter grades.
        """
        transcript = {
            "student_id": self._student_id,
            "student_name": self._student_name,
            "courses": [],
            "gpa": 0.0,
            "total_courses": 0,
            "passed_courses": 0
        }

        total_grade_points = 0

        for course_code, numeric_grade in self._grades.items():
            course = grade_manager.get_course(course_code)
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
                # Simple GPA calculation (can be refined with proper credit hours)
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