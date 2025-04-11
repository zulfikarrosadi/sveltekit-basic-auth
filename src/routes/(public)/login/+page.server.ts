import 'dotenv/config'
import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import db from '$lib/db/index';
import { usersTable } from '$lib/db/schema';
import jwt from 'jsonwebtoken'
import pg from 'pg'
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET as string
const COOKIE_MAX_AGE = 604800000 // 7 days in ms

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const email = data.get('email')?.toString().trim();
		const password = data.get('password')?.toString().trim();

		if ( !email || !password) {
			return fail(400, {
        data: {
          email,
          password,
        },
				error: {
					message: 'validation error',
					details: {
						email: 'Email is required',
						password: 'Password is required',
					}
				}
			});
		}

		try {
			const user = await db.select({
        id: usersTable.id,
        fullName: usersTable.fullName,
        email: usersTable.email,
        password: usersTable.password,
      }).from(usersTable).where(eq(usersTable.email, email))

      if (!user.length) {
        return fail(400, {
          data: null,
          error: {
            message: 'Email or password is incorrect',
            details: {
              email: '',
              password: '',
            }
          }
        })
      }

      const token = jwt.sign({
        email, fullName: user[0].fullName, id: user[0].id
      }, JWT_SECRET, {expiresIn: '7d'})

      event.cookies.set('userSession', token, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'none', secure: true})
      event.locals.user = {
        email, fullName: user[0].fullName, id: user[0].id
      }
      return redirect(303, '/?toast=auth_success')
		} catch (error: unknown) {
      if (isRedirect(error)){
        console.log('is redirect');
        throw error
      }
			console.log('fail: ', error);
      // unique constraint violation
      if (error instanceof pg.DatabaseError && error.code === '23505') {
        return fail(400, {
          data: {
            email,
            password,
          },
          error: {
            message: 'Email already exist, try to login instead',
            details: null
          }
        })
      }

			return fail(400, {
        data: {
          email,
          password,
        },
				error: {
					message: 'Register user fail, please try again later',
          details: null
				}
			});
		}
	}
} satisfies Actions;
