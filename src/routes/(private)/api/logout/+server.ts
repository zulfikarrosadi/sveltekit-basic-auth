import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const POST: RequestHandler = async ({cookies, locals}) => {
  cookies.set('userSession', '', {path: '/', maxAge: 0})
  locals.user = {
    email: '',
    fullName: '',
    id: 0
  }
  return json({
    status: 'success',
  })
}