"use client"

import { useState, useEffect } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { getLetterGrade } from "../lib/grade-utils"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"

export function StudentManagement() {
  const { 
    addStudent, 
    getAllStudents, 
    getStudent, 
    getAllCourses, 
    getCourseStudents, 
    registerStudentForCourse,
    loading,
    enrollments
  } = useGradeManager()

  const [newStudentId, setNewStudentId] = useState("")
  const [newStudentName, setNewStudentName] = useState("")
  const [addError, setAddError] = useState("")
  const [addSuccess, setAddSuccess] = useState("")
  const [viewStudentId, setViewStudentId] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [registerStudentId, setRegisterStudentId] = useState("")
  const [registerCourseCode, setRegisterCourseCode] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const students = getAllStudents()
  const courses = getAllCourses()

  const handleAddStudent = async () => {
    if (!newStudentId || !newStudentName) {
      setAddError("Student ID and Name are required")
      setAddSuccess("")
      return
    }

    setIsSubmitting(true)
    const success = await addStudent({
      student_id: newStudentId,
      student_name: newStudentName,
      grades: {},
    })
    setIsSubmitting(false)

    if (success) {
      setAddSuccess(`Student ${newStudentName} added successfully`)
      setNewStudentId("")
      setNewStudentName("")
      setAddError("")
    } else {
      setAddError(`Student with ID ${newStudentId} already exists`)
      setAddSuccess("")
    }
  }

  const handleViewStudent = () => {
    const student = getStudent(viewStudentId)
    setSelectedStudent(student)
  }

  const handleRegisterStudent = async () => {
    if (!registerStudentId || !registerCourseCode) {
      setRegisterError("Student ID and Course Code are required")
      setRegisterSuccess("")
      return
    }

    setIsSubmitting(true)
    const success = await registerStudentForCourse(registerStudentId, registerCourseCode)
    setIsSubmitting(false)

    if (success) {
      setRegisterSuccess(`Student registered for course ${registerCourseCode} successfully`)
      setRegisterError("")
    } else {
      setRegisterError(
        "Failed to register student for course. The student may already be registered or student/course doesn't exist."
      )
      setRegisterSuccess("")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <span className="ml-2 text-lg text-slate-700">Loading...</span>
      </div>
    )
  }

  const isStudentEnrolledInCourse = (studentId, courseCode) => {
    return enrollments[courseCode]?.includes(studentId) || false
  }

  return (
    <Tabs defaultValue="add">
      <TabsList className="grid w-full grid-cols-3 bg-slate-100">
        <TabsTrigger value="add" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Add Student
        </TabsTrigger>
        <TabsTrigger value="view" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          View Students
        </TabsTrigger>
        <TabsTrigger value="register" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Register for Course
        </TabsTrigger>
      </TabsList>

      <TabsContent value="add">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Add New Student</CardTitle>
            <CardDescription>Enter the details of the new student</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {addError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}

            {addSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{addSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="student-id" className="text-slate-700">
                  Student ID
                </Label>
                <Input
                  id="student-id"
                  value={newStudentId}
                  onChange={(e) => setNewStudentId(e.target.value)}
                  placeholder="e.g., S1001"
                  className="border-slate-300"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="student-name" className="text-slate-700">
                  Student Name
                </Label>
                <Input
                  id="student-name"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  placeholder="e.g., John Doe"
                  className="border-slate-300"
                />
              </div>

              <Button 
                onClick={handleAddStudent} 
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Student"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="view">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">View Students</CardTitle>
            <CardDescription>View all students or search for a specific student</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Label htmlFor="view-student-id" className="text-slate-700">
                    Student ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="view-student-id"
                      value={viewStudentId}
                      onChange={(e) => setViewStudentId(e.target.value)}
                      placeholder="e.g., S1001"
                      className="border-slate-300"
                    />
                    <Button onClick={handleViewStudent} className="bg-teal-600 hover:bg-teal-700">
                      View
                    </Button>
                  </div>
                </div>
              </div>

              {selectedStudent && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2 text-slate-800">Student Details</h3>
                  <p className="text-slate-700">
                    <strong>ID:</strong> {selectedStudent.student_id}
                  </p>
                  <p className="text-slate-700">
                    <strong>Name:</strong> {selectedStudent.student_name}
                  </p>

                  <h4 className="text-md font-medium mt-4 mb-2 text-slate-800">Grades</h4>
                  {selectedStudent.grades && Object.keys(selectedStudent.grades).length > 0 ? (
                    <Table>
                      <TableHeader className="bg-slate-100">
                        <TableRow>
                          <TableHead className="text-slate-700">Course Code</TableHead>
                          <TableHead className="text-slate-700">Course Name</TableHead>
                          <TableHead className="text-slate-700">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(selectedStudent.grades).map(([courseCode, grade]) => {
                          const course = courses.find((c) => c.course_code === courseCode)
                          return (
                            <TableRow key={courseCode} className="border-b border-slate-200">
                              <TableCell className="font-medium">{courseCode}</TableCell>
                              <TableCell>{course?.course_name || "Unknown Course"}</TableCell>
                              <TableCell>
                                {grade} ({getLetterGrade(grade)})
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-slate-500">No grades recorded</p>
                  )}
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium mb-2 text-slate-800">All Students</h3>
                {students.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-slate-100">
                      <TableRow>
                        <TableHead className="text-slate-700">ID</TableHead>
                        <TableHead className="text-slate-700">Name</TableHead>
                        <TableHead className="text-slate-700">Courses Enrolled</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const enrolledCoursesCount = courses.filter(course => 
                          isStudentEnrolledInCourse(student.student_id, course.course_code)
                        ).length

                        return (
                          <TableRow key={student.student_id} className="border-b border-slate-200">
                            <TableCell className="font-medium">{student.student_id}</TableCell>
                            <TableCell>{student.student_name}</TableCell>
                            <TableCell>{enrolledCoursesCount}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-slate-500">No students found</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="register">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Register Student for Course</CardTitle>
            <CardDescription>Enroll a student in a course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {registerError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{registerError}</AlertDescription>
              </Alert>
            )}

            {registerSuccess && (
              <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>{registerSuccess}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="register-student" className="text-slate-700">
                  Student
                </Label>
                <Select value={registerStudentId} onValueChange={setRegisterStudentId}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.student_id} value={student.student_id}>
                        {student.student_id}: {student.student_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="register-course" className="text-slate-700">
                  Course
                </Label>
                <Select value={registerCourseCode} onValueChange={setRegisterCourseCode}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.course_code} value={course.course_code}>
                        {course.course_code}: {course.course_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleRegisterStudent} 
                className="bg-teal-600 hover:bg-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register Student"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}