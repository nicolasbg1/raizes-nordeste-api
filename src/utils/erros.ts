// padrao de erro usado em todos os endpoints

export interface DetalheErro {
  field: string;
  issue: string;
}

export function criarErro(
  error: string,
  message: string,
  path: string,
  details: DetalheErro[] = []
) {
  return {
    error,
    message,
    details,
    timestamp: new Date().toISOString(),
    path
  };
}

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details: DetalheErro[];

  constructor(
    statusCode: number,
    errorCode: string,
    message: string,
    details: DetalheErro[] = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.name = 'AppError';
  }
}
