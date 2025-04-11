import 'dotenv/config'
import type { Handle } from "@sveltejs/kit";
import jwt, { type JwtPayload } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET as string

export const handle: Handle = async ({event, resolve}) => {
  const user = event.cookies.get('userSession')
  if (!user) {
    return await resolve(event)
  }
  try {
    const payload = jwt.verify(user, JWT_SECRET) as JwtPayload & {email: string, fullName: string, id: number}
    event.locals.user = payload
    return await resolve(event)
  } catch (error) {
    console.log('invalid jwt signature: ', error);

    return await resolve(event)
  }
}