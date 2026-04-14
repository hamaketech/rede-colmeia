export type ApiErrorCode =
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation_error"
  | "internal_error";

export type ApiError = {
  code: ApiErrorCode;
  message: string;
  requestId?: string;
  details?: Record<string, string[]>;
};

export type ApiSuccess<TData> = {
  ok: true;
  data: TData;
};

export type ApiFailure = {
  ok: false;
  error: ApiError;
};

export type ApiResponse<TData> = ApiSuccess<TData> | ApiFailure;
