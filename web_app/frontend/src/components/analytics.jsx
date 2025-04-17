"use client"

import { useState } from "react"
import { useGradeManager } from "./grade-manager-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Label } from "./ui/label"
import { getLetterGrade } from "../lib/grade-utils"
import { Bar, Pie } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement)

export function Analytics() {
  const { getAllCourses, getAllStudents, getCourseStudents, generateCourseSummary } = useGradeManager()

  const [selectedCourseCode, setSelectedCourseCode] = useState("")
  const [selectedChartType, setSelectedChartType] = useState("distribution")

  const courses = getAllCourses()
  const students = getAllStudents()

  const courseSummary = selectedCourseCode ? generateCourseSummary(selectedCourseCode) : null

  const gradeDistributionData = {
    labels: ["A", "B+", "B-", "C+", "C-", "E", "F"],
    datasets: [
      {
        label: "Number of Students",
        data: courseSummary ? Object.values(courseSummary.grade_distribution) : [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(20, 184, 166, 0.8)",
          "rgba(56, 189, 248, 0.8)",
          "rgba(99, 102, 241, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(249, 115, 22, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(20, 184, 166, 1)",
          "rgba(56, 189, 248, 1)",
          "rgba(99, 102, 241, 1)",
          "rgba(168, 85, 247, 1)",
          "rgba(236, 72, 153, 1)",
          "rgba(249, 115, 22, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const courseComparisonData = {
    labels: courses.map((course) => course.course_code),
    datasets: [
      {
        label: "Average Grade",
        data: courses.map((course) => {
          const summary = generateCourseSummary(course.course_code)
          return summary ? summary.average_grade : 0
        }),
        backgroundColor: "rgba(20, 184, 166, 0.5)",
        borderColor: "rgba(20, 184, 166, 1)",
        borderWidth: 1,
      },
      {
        label: "Pass Rate (%)",
        data: courses.map((course) => {
          const summary = generateCourseSummary(course.course_code)
          return summary ? summary.pass_rate : 0
        }),
        backgroundColor: "rgba(56, 189, 248, 0.5)",
        borderColor: "rgba(56, 189, 248, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Prepare data for student performance chart (if a course is selected)
  const studentPerformanceData = {
    labels: selectedCourseCode
      ? getCourseStudents(selectedCourseCode)
          .filter((student) => student.grades[selectedCourseCode] !== undefined)
          .map((student) => student.student_name)
      : [],
    datasets: [
      {
        label: "Student Grades",
        data: selectedCourseCode
          ? getCourseStudents(selectedCourseCode)
              .filter((student) => student.grades[selectedCourseCode] !== undefined)
              .map((student) => student.grades[selectedCourseCode])
          : [],
        backgroundColor: "rgba(20, 184, 166, 0.5)",
        borderColor: "rgba(20, 184, 166, 1)",
        borderWidth: 1,
      },
    ],
  }


  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text:
          selectedChartType === "distribution"
            ? "Grade Distribution"
            : selectedChartType === "comparison"
              ? "Course Comparison"
              : "Student Performance",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  // Options for pie chart
  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "right",
      },
      title: {
        display: true,
        text: "Grade Distribution",
        font: {
          size: 16,
        },
      },
    },
  }

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-slate-50 border-b border-slate-200">
          <CardTitle className="text-slate-800">Grade Analytics</CardTitle>
          <CardDescription>Visualize grade distributions and performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="distribution" onValueChange={(value) => setSelectedChartType(value)}>
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 mb-6">
              <TabsTrigger
                value="distribution"
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Grade Distribution
              </TabsTrigger>
              <TabsTrigger
                value="comparison"
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Course Comparison
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="data-[state=active]:bg-teal-600 data-[state=active]:text-white"
              >
                Student Performance
              </TabsTrigger>
            </TabsList>

            <TabsContent value="distribution">
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="course-select" className="text-slate-700">
                      Select Course
                    </Label>
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
                </div>

                {selectedCourseCode && courseSummary ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-slate-800 text-center">Grade Distribution Chart</h3>
                      <Bar data={gradeDistributionData} options={barOptions} />
                    </div>
                    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                      <h3 className="text-lg font-medium mb-4 text-slate-800 text-center">
                        Grade Distribution Pie Chart
                      </h3>
                      <Pie data={gradeDistributionData} options={pieOptions} />
                    </div>

                    <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm md:col-span-2">
                      <h3 className="text-lg font-medium mb-2 text-slate-800">Course Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                          <p className="text-sm text-slate-500">Average Grade</p>
                          <p className="text-xl font-bold text-slate-800">
                            {courseSummary.average_grade.toFixed(2)}
                            <span className="text-sm ml-1 text-slate-600">
                              ({getLetterGrade(courseSummary.average_grade)})
                            </span>
                          </p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                          <p className="text-sm text-slate-500">Highest Grade</p>
                          <p className="text-xl font-bold text-slate-800">{courseSummary.highest_grade.toFixed(1)}</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                          <p className="text-sm text-slate-500">Lowest Grade</p>
                          <p className="text-xl font-bold text-slate-800">{courseSummary.lowest_grade.toFixed(1)}</p>
                        </div>
                        <div className="border border-slate-200 rounded-lg p-3 text-center bg-slate-50">
                          <p className="text-sm text-slate-500">Pass Rate</p>
                          <p className="text-xl font-bold text-slate-800">{courseSummary.pass_rate}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">
                    Select a course to view grade distribution analytics
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="comparison">
              <div className="grid gap-6">
                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-4 text-slate-800 text-center">Course Comparison</h3>
                  {courses.length > 0 ? (
                    <Bar data={courseComparisonData} options={barOptions} />
                  ) : (
                    <div className="text-center py-12 text-slate-500">No courses available for comparison</div>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  <h3 className="text-lg font-medium mb-2 text-slate-800">Course Performance Overview</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-100">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            Course Code
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            Course Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            Students
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            Average Grade
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider"
                          >
                            Pass Rate
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {courses.map((course) => {
                          const summary = generateCourseSummary(course.course_code)
                          return (
                            <tr key={course.course_code}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">
                                {course.course_code}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {course.course_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {summary?.total_students || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {summary ? (
                                  <>
                                    {summary.average_grade.toFixed(2)} ({getLetterGrade(summary.average_grade)})
                                  </>
                                ) : (
                                  "N/A"
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                                {summary ? `${summary.pass_rate}%` : "N/A"}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance">
              <div className="grid gap-6">
                <div className="flex gap-4">
                  <div className="grid gap-2 flex-1">
                    <Label htmlFor="course-select" className="text-slate-700">
                      Select Course
                    </Label>
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
                </div>

                {selectedCourseCode ? (
                  <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <h3 className="text-lg font-medium mb-4 text-slate-800 text-center">Student Performance</h3>
                    {studentPerformanceData.labels.length > 0 ? (
                      <Bar data={studentPerformanceData} options={barOptions} />
                    ) : (
                      <div className="text-center py-12 text-slate-500">No graded students in this course</div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-500">Select a course to view student performance</div>
                )}

                {selectedCourseCode && (
                  <div className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <h3 className="text-lg font-medium mb-2 text-slate-800">Performance Distribution</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-md font-medium mb-2 text-slate-700">Grade Range Analysis</h4>
                        <div className="space-y-2">
                          {[
                            { range: "90-100", label: "Excellent" },
                            { range: "80-89", label: "Very Good" },
                            { range: "70-79", label: "Good" },
                            { range: "60-69", label: "Satisfactory" },
                            { range: "50-59", label: "Adequate" },
                            { range: "40-49", label: "Pass" },
                            { range: "0-39", label: "Fail" },
                          ].map((item) => {
                            const students = getCourseStudents(selectedCourseCode).filter((student) => {
                              const grade = student.grades[selectedCourseCode]
                              if (grade === undefined) return false
                              const [min, max] = item.range.split("-").map(Number)
                              return grade >= min && grade <= max
                            })

                            const percentage =
                              students.length > 0
                                ? ((students.length / getCourseStudents(selectedCourseCode).length) * 100).toFixed(1)
                                : "0.0"

                            return (
                              <div key={item.range} className="flex items-center">
                                <div className="w-24 text-sm text-slate-700">
                                  {item.range} ({item.label})
                                </div>
                                <div className="flex-1 mx-2">
                                  <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-teal-600" style={{ width: `${percentage}%` }}></div>
                                  </div>
                                </div>
                                <div className="w-16 text-sm text-slate-700">{percentage}%</div>
                                <div className="w-8 text-sm text-slate-700">{students.length}</div>
                              </div>
                            )
                          })}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-md font-medium mb-2 text-slate-700">Performance Metrics</h4>
                        <div className="space-y-4">
                          {courseSummary && (
                            <>
                              <div>
                                <p className="text-sm text-slate-500">Class Average vs. Passing Grade</p>
                                <div className="h-4 bg-slate-100 rounded-full overflow-hidden mt-1">
                                  <div
                                    className="h-full bg-teal-600"
                                    style={{ width: `${(courseSummary.average_grade / 100) * 100}%` }}
                                  ></div>
                                  <div
                                    className="h-full bg-red-400 absolute top-0"
                                    style={{ width: "2px", left: "40%" }}
                                  ></div>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-1">
                                  <span>0</span>
                                  <span>40 (Pass)</span>
                                  <span>100</span>
                                </div>
                              </div>

                              <div>
                                <p className="text-sm text-slate-500">Grade Deviation</p>
                                <div className="flex items-center mt-1">
                                  <span className="text-xs text-slate-500 w-8">Low</span>
                                  <div className="flex-1 mx-2 h-2 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"></div>
                                  <span className="text-xs text-slate-500 w-8">High</span>
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                  Range: {courseSummary.lowest_grade.toFixed(1)} -{" "}
                                  {courseSummary.highest_grade.toFixed(1)}
                                  (Spread: {(courseSummary.highest_grade - courseSummary.lowest_grade).toFixed(1)})
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
