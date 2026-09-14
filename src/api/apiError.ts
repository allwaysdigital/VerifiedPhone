// Its own module so both client.ts and auth/session.ts can import it without
// a circular dependency between the two (client.ts needs the session's
// getToken(), session.ts needs to recognize ApiError in its error mapping).
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
