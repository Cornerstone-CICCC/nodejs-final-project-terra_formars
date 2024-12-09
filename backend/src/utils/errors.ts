export class AppError extends Error {
  constructor(
    public statusCode: number,
    public status: string,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, "validation_error", message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(404, "not_found", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string) {
    super(401, "unauthorized", message);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(403, "forbidden", message);
  }
}
