from fastapi import Request
from fastapi.responses import JSONResponse

class NotFoundException(Exception):
    def __init__(self, message: str):
        self.message = message

class ForbiddenException(Exception):
    def __init__(self, message: str):
        self.message = message

class BadRequestException(Exception):
    def __init__(self, message: str):
        self.message = message

def not_found_exception_handler(request: Request, exc: NotFoundException):
    return JSONResponse(status_code=404, content={"message": exc.message})

def forbidden_exception_handler(request: Request, exc: ForbiddenException):
    return JSONResponse(status_code=403, content={"message": exc.message})

def bad_request_exception_handler(request: Request, exc: BadRequestException):
    return JSONResponse(status_code=400, content={"message": exc.message})
