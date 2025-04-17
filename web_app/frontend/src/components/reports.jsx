"use client"

import { useState, useRef } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { getLetterGrade } from "../lib/grade-utils"
import { FileDown, Printer } from "lucide-react"
import html2pdf from "html2pdf.js"

export function Reports() {
  const { getAllStudents, getAllCourses, generateStudentTranscript, generateCourseSummary } = useGradeManager()

  const [selectedStudentId, setSelectedStudentId] = useState("")
  const [transcript, setTranscript] = useState(null)
  const [selectedCourseCode, setSelectedCourseCode] = useState("")
  const [courseSummary, setCourseSummary] = useState(null)

  const transcriptRef = useRef(null)

  const students = getAllStudents()
  const courses = getAllCourses()

  const handleGenerateTranscript = () => {
    const generatedTranscript = generateStudentTranscript(selectedStudentId)
    setTranscript(generatedTranscript)
  }

  const handleGenerateCourseSummary = () => {
    const summary = generateCourseSummary(selectedCourseCode)
    setCourseSummary(summary)
  }

  const exportToPDF = () => {
    if (!transcriptRef.current || !transcript) return

    const element = transcriptRef.current
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `transcript_${transcript.student_id}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    }

    html2pdf().set(opt).from(element).save()
  }

  return (
    <Tabs defaultValue="transcript">
      <TabsList className="grid w-full grid-cols-2 bg-slate-100">
        <TabsTrigger value="transcript" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Student Transcript
        </TabsTrigger>
        <TabsTrigger value="summary" className="data-[state=active]:bg-teal-600 data-[state=active]:text-white">
          Course Performance Summary
        </TabsTrigger>
      </TabsList>

      <TabsContent value="transcript">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Generate Student Transcript</CardTitle>
            <CardDescription>View a complete transcript for a specific student</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
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
                <Button onClick={handleGenerateTranscript} className="bg-teal-600 hover:bg-teal-700">
                  Generate Transcript
                </Button>
              </div>

              {transcript && (
                <>
                  <div className="flex justify-end gap-2 mb-2">
                    <Button
                      onClick={exportToPDF}
                      variant="outline"
                      className="flex items-center gap-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as PDF
                    </Button>
                    <Button
                      onClick={() => window.print()}
                      variant="outline"
                      className="flex items-center gap-2 border-slate-600 text-slate-600 hover:bg-slate-50"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </Button>
                  </div>

                  <div
                    ref={transcriptRef}
                    className="border rounded-lg p-6 bg-white shadow-sm"
                    id="transcript-container"
                  >
                    <div className="text-center border-b border-slate-200 pb-4 mb-6">
                      <h2 className="text-2xl font-bold text-slate-800">OFFICIAL TRANSCRIPT</h2>
                      <p className="text-lg font-medium mt-2 text-slate-700">
                        {transcript.student_name} (ID: {transcript.student_id})
                      </p>
                      <p className="text-sm text-slate-500 mt-1">Generated on {new Date().toLocaleDateString()}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-500">GPA</p>
                        <p className="text-2xl font-bold text-slate-800">{transcript.gpa.toFixed(2)}</p>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-500">Courses Taken</p>
                        <p className="text-2xl font-bold text-slate-800">{transcript.total_courses}</p>
                      </div>
                      <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                        <p className="text-sm text-slate-500">Courses Passed</p>
                        <p className="text-2xl font-bold text-slate-800">{transcript.passed_courses}</p>
                      </div>
                    </div>

                    <h3 className="text-lg font-medium mb-3 text-slate-800">Course Details</h3>
                    <Table>
                      <TableHeader className="bg-slate-100">
                        <TableRow>
                          <TableHead className="text-slate-700">Course Code</TableHead>
                          <TableHead className="text-slate-700">Course Name</TableHead>
                          <TableHead className="text-slate-700">Grade</TableHead>
                          <TableHead className="text-slate-700">Letter Grade</TableHead>
                          <TableHead className="text-slate-700">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transcript.courses.map((course) => (
                          <TableRow key={course.course_code} className="border-b border-slate-200">
                            <TableCell className="font-medium">{course.course_code}</TableCell>
                            <TableCell>{course.course_name}</TableCell>
                            <TableCell>{course.numeric_grade.toFixed(1)}</TableCell>
                            <TableCell className="font-medium">{course.letter_grade}</TableCell>
                            <TableCell>
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  course.status === "PASS" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                }`}
                              >
                                {course.status}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <div className="mt-8 pt-4 border-t border-slate-200 text-center text-sm text-slate-500">
                      <p>This is an official academic transcript from the university.</p>
                      <p>For verification, please contact the registrar's office.</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="summary">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-slate-50 border-b border-slate-200">
            <CardTitle className="text-slate-800">Course Performance Summary</CardTitle>
            <CardDescription>View performance statistics for a specific course</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-6">
              <div className="flex gap-4">
                <div className="grid gap-2 flex-1">
                  <Select value={selectedCourseCode} onValueChange={setSelectedCourseCode}>
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
                <Button onClick={handleGenerateCourseSummary} className="bg-teal-600 hover:bg-teal-700">
                  Generate Summary
                </Button>
              </div>

              {courseSummary && (
                <div className="border border-slate-200 rounded-lg p-6 bg-white shadow-sm">
                  <div className="text-center border-b border-slate-200 pb-4 mb-6">
                    <h2 className="text-xl font-bold text-slate-800">PERFORMANCE SUMMARY</h2>
                    <p className="text-lg font-medium mt-2 text-slate-700">
                      {courseSummary.course_name} ({courseSummary.course_code})
                    </p>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                      <p className="text-sm text-slate-500">Students</p>
                      <p className="text-xl font-bold text-slate-800">{courseSummary.total_students}</p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                      <p className="text-sm text-slate-500">Average Grade</p>
                      <p className="text-xl font-bold text-slate-800">
                        {courseSummary.average_grade.toFixed(2)}
                        <span className="text-sm ml-1 text-slate-600">
                          ({getLetterGrade(courseSummary.average_grade)})
                        </span>
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                      <p className="text-sm text-slate-500">Highest Grade</p>
                      <p className="text-xl font-bold text-slate-800">
                        {courseSummary.highest_grade.toFixed(1)}
                        <span className="text-sm ml-1 text-slate-600">
                          ({getLetterGrade(courseSummary.highest_grade)})
                        </span>
                      </p>
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                      <p className="text-sm text-slate-500">Pass Rate</p>
                      <p className="text-xl font-bold text-slate-800">{courseSummary.pass_rate}%</p>
                    </div>
                  </div>

                  <h3 className="text-lg font-medium mb-3 text-slate-800">Grade Distribution</h3>
                  <div className="grid grid-cols-7 gap-2 mb-4">
                    {Object.entries(courseSummary.grade_distribution).map(([grade, count]) => (
                      <div key={grade} className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                        <p className="font-bold text-slate-800">{grade}</p>
                        <p className="text-slate-600">{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
