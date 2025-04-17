# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import student_routes, course_routes, grade_routes, report_routes

# Create FastAPI app
app = FastAPI(
    title="Grade Management System API",
    description="API for managing students, courses, and grades",
    version="1.0.0"
)

# Add CORS middleware to allow frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include routers
app.include_router(student_routes.router)
app.include_router(course_routes.router)
app.include_router(grade_routes.router)
app.include_router(report_routes.router)

@app.get("/")
def read_root():
    return {
        "message": "Welcome to the Grade Management System API",
        "documentation": "/docs",
        "endpoints": {
            "students": "/students",
            "courses": "/courses",
            "grades": "/grades",
            "reports": "/reports"
        }
    }

