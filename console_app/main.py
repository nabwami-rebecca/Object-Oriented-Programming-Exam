import os
from grade import GradeManager, GradeCategory
from student import Student
from course import Course

def clear_screen():
    """Clearing the terminal screen."""
    os.system('cls' if os.name == 'nt' else 'clear')

def get_input(prompt, validators=None):
    """
    Gets and validates user input.
    """
    while True:
        value = input(prompt)
        if not validators:
            return value

        valid = True
        for validator in validators:
            if not validator(value):
                valid = False
                break

        if valid:
            return value

def main_menu():
    """Displaying the main menu and get user selection."""
    clear_screen()
    print("\n===== GRADE MANAGEMENT SYSTEM =====")
    print("1. Student Management")
    print("2. Course Management")
    print("3. Grade Management")
    print("4. Reports")
    print("5. Save/Load Data")
    print("0. Exit")

    return get_input("\nSelect an option (0-5): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 5])

def student_menu():
    """Displaying the student management menu and get user selection."""
    clear_screen()
    print("\n===== STUDENT MANAGEMENT =====")
    print("1. Add New Student")
    print("2. View All Students")
    print("3. View Student Details")
    print("4. Register Student for Course")
    print("0. Back to Main Menu")

    return get_input("\nSelect an option (0-4): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 4])

def course_menu():
    """Displaying the course management menu and get user selection."""
    clear_screen()
    print("\n===== COURSE MANAGEMENT =====")
    print("1. Add New Course")
    print("2. View All Courses")
    print("3. View Course Details")
    print("0. Back to Main Menu")

    return get_input("\nSelect an option (0-3): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 3])

def grade_menu():
    """Displaying the grade management menu and get user selection."""
    clear_screen()
    print("\n===== GRADE MANAGEMENT =====")
    print("1. Assign Grade")
    print("2. View Student Grades")
    print("3. Calculate Course Average")
    print("0. Back to Main Menu")

    return get_input("\nSelect an option (0-3): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 3])

def report_menu():
    """Displaying the reports menu and get user selection."""
    clear_screen()
    print("\n===== REPORTS =====")
    print("1. Generate Student Transcript")
    print("2. Course Performance Summary")
    print("0. Back to Main Menu")

    return get_input("\nSelect an option (0-2): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 2])

def data_menu():
    """Displaying the data management menu and get user selection."""
    clear_screen()
    print("\n===== DATA MANAGEMENT =====")
    print("1. Save Data to File")
    print("2. Load Data from File")
    print("0. Back to Main Menu")

    return get_input("\nSelect an option (0-2): ",
                    [lambda x: x.isdigit() and 0 <= int(x) <= 2])

def run_grade_management_system():
    """Runing the interactive grade management system."""
    manager = GradeManager()

    while True:
        choice = main_menu()

        if choice == "0":
            print("\nExiting Grade Management System. Goodbye!")
            break

        elif choice == "1":  # for student management
            handle_student_menu(manager)

        elif choice == "2":  # for course management
            handle_course_menu(manager)

        elif choice == "3":  # for grade mnanagement
            handle_grade_menu(manager)

        elif choice == "4":  # for reports
            handle_report_menu(manager)

        elif choice == "5":  # for saving/load Data
            handle_data_menu(manager)

def handle_student_menu(manager):
    """Handling the student management menu operations."""
    while True:
        choice = student_menu()

        if choice == "0":
            break

        elif choice == "1":  #addin new Student
            student_id = get_input("Enter Student ID: ")
            if manager.get_student(student_id):
                print(f"\nStudent with ID {student_id} already exists!")
            else:
                student_name = get_input("Enter Student Name: ")
                student = Student(student_id, student_name)
                manager.add_student(student)
                print(f"\nStudent {student_name} added successfully!")

        elif choice == "2":  ## viewing All Students
            students = manager.get_all_students()
            if not students:
                print("\nNo students found in the system.")
            else:
                print("\n===== ALL STUDENTS =====")
                for student in students:
                    print(f"ID: {student.student_id}, Name: {student.student_name}")

        elif choice == "3":  ## viewing Student Details
            student_id = get_input("Enter Student ID: ")
            student = manager.get_student(student_id)
            if not student:
                print(f"\nStudent with ID {student_id} not found!")
            else:
                print(f"\n===== STUDENT DETAILS =====")
                print(f"ID: {student.student_id}")
                print(f"Name: {student.student_name}")

                enrolled_courses = []
                for course in manager.get_all_courses():
                    course_students = manager.get_course_students(course.course_code)
                    if student in course_students:
                        enrolled_courses.append(course)

                if enrolled_courses:
                    print("\nEnrolled Courses:")
                    for course in enrolled_courses:
                        grade = student.get_grade(course.course_code)
                        grade_str = f"{grade} ({GradeCategory.get_letter_grade(grade)})" if grade is not None else "Not graded"
                        print(f"  {course.course_code}: {course.course_name} - {grade_str}")
                else:
                    print("\nNot enrolled in any courses.")

        elif choice == "4":  # registering Student for Course
            student_id = get_input("Enter Student ID: ")
            student = manager.get_student(student_id)
            if not student:
                print(f"\nStudent with ID {student_id} not found!")
            else:
                courses = manager.get_all_courses()
                if not courses:
                    print("\nNo courses found in the system.")
                else:
                    print("\nAvailable Courses:")
                    for i, course in enumerate(courses, 1):
                        print(f"{i}. {course.course_code}: {course.course_name}")

                    course_index = int(get_input("\nSelect a course (number): ",
                                               [lambda x: x.isdigit() and 1 <= int(x) <= len(courses)])) - 1
                    course = courses[course_index]

                    if manager.register_student_for_course(student_id, course.course_code):
                        print(f"\nStudent registered for {course.course_name} successfully!")
                    else:
                        print(f"\nFailed to register student for the course. The student may already be registered.")

        input("\nPress Enter to continue...")

def handle_course_menu(manager):
    """Handle the course management menu operations."""
    while True:
        choice = course_menu()

        if choice == "0":
            break

        elif choice == "1":  # adding New Course
            course_code = get_input("Enter Course Code: ")
            if manager.get_course(course_code):
                print(f"\nCourse with code {course_code} already exists!")
            else:
                course_name = get_input("Enter Course Name: ")
                course = Course(course_code, course_name)
                manager.add_course(course)
                print(f"\nCourse {course_name} added successfully!")

        elif choice == "2":  # viewing All Courses
            courses = manager.get_all_courses()
            if not courses:
                print("\nNo courses found in the system.")
            else:
                print("\n===== ALL COURSES =====")
                for course in courses:
                    print(f"Code: {course.course_code}, Name: {course.course_name}")

        elif choice == "3":  ## viewing Course Details
            course_code = get_input("Enter Course Code: ")
            course = manager.get_course(course_code)
            if not course:
                print(f"\nCourse with code {course_code} not found!")
            else:
                print(f"\n===== COURSE DETAILS =====")
                print(f"Code: {course.course_code}")
                print(f"Name: {course.course_name}")

                students = manager.get_course_students(course_code)
                if students:
                    print("\nEnrolled Students:")
                    for student in students:
                        grade = student.get_grade(course_code)
                        grade_str = f"{grade} ({GradeCategory.get_letter_grade(grade)})" if grade is not None else "Not graded"
                        print(f"  {student.student_id}: {student.student_name} - {grade_str}")
                else:
                    print("\nNo students enrolled in this course.")

                avg = manager.calculate_course_average(course_code)
                if avg is not None:
                    print(f"\nCourse Average: {avg:.2f} ({GradeCategory.get_letter_grade(avg)})")
                else:
                    print("\nNo grades available to calculate average.")

        input("\nPress Enter to continue...")

def handle_grade_menu(manager):
    """Handle the grade management menu operations."""
    while True:
        choice = grade_menu()

        if choice == "0":
            break

        elif choice == "1":  # Assigning a grade
            student_id = get_input("Enter Student ID: ")
            student = manager.get_student(student_id)
            if not student:
                print(f"\nStudent with ID {student_id} not found!")
            else:
                # finding courses the student is enrolled in
                enrolled_courses = []
                for course in manager.get_all_courses():
                    course_students = manager.get_course_students(course.course_code)
                    if student in course_students:
                        enrolled_courses.append(course)

                if not enrolled_courses:
                    print(f"\nStudent {student.student_name} is not enrolled in any courses.")
                else:
                    print(f"\nCourses for {student.student_name}:")
                    for i, course in enumerate(enrolled_courses, 1):
                        grade = student.get_grade(course.course_code)
                        grade_str = f"{grade}" if grade is not None else "Not graded"
                        print(f"{i}. {course.course_code}: {course.course_name} - Current Grade: {grade_str}")

                    course_index = int(get_input("\nSelect a course (number): ",
                                               [lambda x: x.isdigit() and 1 <= int(x) <= len(enrolled_courses)])) - 1
                    course = enrolled_courses[course_index]

                    grade = float(get_input(f"Enter grade for {course.course_name} (0-100): ",
                                          [lambda x: x.replace('.', '', 1).isdigit() and 0 <= float(x) <= 100]))

                    if manager.assign_grade(student_id, course.course_code, grade):
                        print(f"\nGrade {grade} ({GradeCategory.get_letter_grade(grade)}) assigned successfully!")
                    else:
                        print("\nFailed to assign grade.")

        elif choice == "2":  ## viewing the student Grades
            student_id = get_input("Enter Student ID: ")
            student = manager.get_student(student_id)
            if not student:
                print(f"\nStudent with ID {student_id} not found!")
            else:
                grades = student.get_all_grades()
                if not grades:
                    print(f"\n{student.student_name} has no grades recorded.")
                else:
                    print(f"\n===== GRADES FOR {student.student_name} =====")
                    for course_code, grade in grades.items():
                        course = manager.get_course(course_code)
                        if course:
                            letter_grade = GradeCategory.get_letter_grade(grade)
                            print(f"{course.course_code}: {course.course_name} - {grade} ({letter_grade})")

        elif choice == "3":  ## calculating Course Average
            course_code = get_input("Enter Course Code: ")
            course = manager.get_course(course_code)
            if not course:
                print(f"\nCourse with code {course_code} not found!")
            else:
                avg = manager.calculate_course_average(course_code)
                if avg is not None:
                    letter_grade = GradeCategory.get_letter_grade(avg)
                    print(f"\nAverage grade for {course.course_name}: {avg:.2f} ({letter_grade})")
                else:
                    print(f"\nNo grades available to calculate average for {course.course_name}.")

        input("\nPress Enter to continue...")

def handle_report_menu(manager):
    """Handle the reports menu operations."""
    while True:
        choice = report_menu()

        if choice == "0":
            break

        elif choice == "1":  #generating the student transcript
            student_id = get_input("Enter Student ID: ")
            if manager.print_student_transcript(student_id):
                pass  ##transcript was printed successfully
            else:
                print(f"\nStudent with ID {student_id} not found!")

        elif choice == "2":  ##the course performsnce Summary
            course_code = get_input("Enter Course Code: ")
            course = manager.get_course(course_code)
            if not course:
                print(f"\nCourse with code {course_code} not found!")
            else:
                students = manager.get_course_students(course_code)
                if not students:
                    print(f"\nNo students enrolled in {course.course_name}.")
                else:
                    print(f"\n===== PERFORMANCE SUMMARY FOR {course.course_name} =====")

                    ## getting grades for reporting
                    grades = []
                    grade_distribution = {"A": 0, "B+": 0, "B-": 0, "C+": 0, "C-": 0, "E": 0, "F": 0}

                    for student in students:
                        grade = student.get_grade(course_code)
                        if grade is not None:
                            grades.append(grade)
                            letter_grade = GradeCategory.get_letter_grade(grade)
                            grade_distribution[letter_grade] += 1

                    ## printing summary statistics
                    if grades:
                        avg = sum(grades) / len(grades)
                        max_grade = max(grades)
                        min_grade = min(grades)
                        passing = sum(1 for g in grades if GradeCategory.is_passing(g))

                        print(f"Number of Students: {len(students)}")
                        print(f"Number Graded: {len(grades)}")
                        print(f"Average Grade: {avg:.2f} ({GradeCategory.get_letter_grade(avg)})")
                        print(f"Highest Grade: {max_grade:.2f} ({GradeCategory.get_letter_grade(max_grade)})")
                        print(f"Lowest Grade: {min_grade:.2f} ({GradeCategory.get_letter_grade(min_grade)})")
                        print(f"Pass Rate: {(passing / len(grades) * 100):.2f}%")

                        print("\nGrade Distribution:")
                        for grade, count in grade_distribution.items():
                            if count > 0:
                                print(f"  {grade}: {count} student(s)")
                    else:
                        print("No grades recorded for this course.")

        ## waiting for user to press Enter before returning to the menu
        input("\nPress Enter to continue...")

def handle_data_menu(manager):
    """Handles the data management menu operations."""
    while True:
        choice = data_menu()

        if choice == "0":
            break

        elif choice == "1":  ##saving the data to file
            filename = get_input("Enter filename (default: grade_data.json): ") or "grade_data.json"
            if manager.save_to_json(filename):
                print(f"\nData saved successfully to {filename}!")
            else:
                print("\nFailed to save data.")

        elif choice == "2":  #loading the data data from file
            filename = get_input("Enter filename to load (default: grade_data.json): ") or "grade_data.json"
            loaded_manager = GradeManager.load_from_json(filename)
            if loaded_manager:
                #replacing the current manager with the loaded one
                for attr_name in dir(loaded_manager):
                    if attr_name.startswith('_') and not attr_name.startswith('__'):
                        setattr(manager, attr_name, getattr(loaded_manager, attr_name))
                print(f"\nData loaded successfully from {filename}!")
            else:
                print(f"\nFailed to load data from {filename}.")

        ##waiting for user to press Enter before returning to the menu
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    run_grade_management_system()