import { handler } from "../../functions/handler.ts";

export default async function app(request: Request): Promise<Response> {
  return handler(request);
}

export const config = {
  path: "/functions/v1/app",
};
