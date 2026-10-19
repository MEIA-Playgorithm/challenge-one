"""Erros da API. O corpo é sempre {"error": mensagem}, que é o que o front e os motores esperam."""
from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException


class ApiError(Exception):
    def __init__(self, status, message):
        self.status = status
        self.message = message


def register_errors(app: FastAPI):
    def reply(status, message):
        return JSONResponse({"error": message}, status_code=status)

    @app.exception_handler(ApiError)
    def api_error(request: Request, error: ApiError):
        return reply(error.status, error.message)

    @app.exception_handler(RequestValidationError)
    def invalid_body(request: Request, error: RequestValidationError):
        return reply(400, "O corpo tem de ser um objeto JSON")

    @app.exception_handler(HTTPException)
    def http_error(request: Request, error: HTTPException):
        return reply(error.status_code, "Não encontrado" if error.status_code == 404 else error.detail)
