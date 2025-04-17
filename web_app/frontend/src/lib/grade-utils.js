export const getLetterGrade = (numericGrade) => {
  if (numericGrade >= 80) {
    return "A"
  } else if (numericGrade >= 75) {
    return "B+"
  } else if (numericGrade >= 70) {
    return "B-"
  } else if (numericGrade >= 60) {
    return "C+"
  } else if (numericGrade >= 50) {
    return "C-"
  } else if (numericGrade >= 40) {
    return "E"
  } else {
    return "F"
  }
}

export const isPassing = (numericGrade) => {
  return numericGrade >= 40
}

export const calculateGPA = (grades) => {
  if (grades.length === 0) return 0

  let totalPoints = 0

  for (const grade of grades) {
    const letterGrade = getLetterGrade(grade)

    if (letterGrade === "A") {
      totalPoints += 5.0
    } else if (letterGrade === "B+") {
      totalPoints += 4.5
    } else if (letterGrade === "B-") {
      totalPoints += 4.0
    } else if (letterGrade === "C+") {
      totalPoints += 3.5
    } else if (letterGrade === "C-") {
      totalPoints += 3.0
    } else if (letterGrade === "E") {
      totalPoints += 2.0
    }
  }

  return Number((totalPoints / grades.length).toFixed(2))
}
