import 'dotenv/config'
import { fail, isRedirect, redirect, type Actions } from '@sveltejs/kit';
import db from '$lib/db/index';
import { usersTable } from '$lib/db/schema';
import jwt from 'jsonwebtoken'
import pg from 'pg'

const JWT_SECRET = process.env.JWT_SECRET as string
const COOKIE_MAX_AGE = 604800000 // 7 days in ms

export const actions = {
	default: async (event) => {
		const data = await event.request.formData();
		const fullName = data.get('fullName')?.toString().trim();
		const email = data.get('email')?.toString().trim();
		const password = data.get('password')?.toString().trim();
		const passwordConfirmation = data.get('password_confirmation')?.toString().trim();

		if (!fullName || !email || !password || !passwordConfirmation) {
			return fail(400, {
        data: {
          fullName,
          email,
          password,
          passwordConfirmation,
        },
				error: {
					message: 'validation error',
					details: {
						fullName: 'Fullname is required',
						email: 'Email is required',
						password: 'Password is required',
						passwordConfirmation: 'Password Confirmation is required'
					}
				}
			});
		}

		if (password !== passwordConfirmation) {
			return fail(400, {
				data: {
          fullName,
          email,
          password,
          passwordConfirmation,
        },
				error: {
					message: 'validation error',
					details: {
						password: 'Password and password confirmation is not match',
						passwordConfirmation: 'Password and password confirmation is not match'
					}
				}
			});
		}

		try {
			const newUser = await db.insert(usersTable).values({ email, password, fullName }).returning();
      const token = jwt.sign({
        email, fullName, id: newUser[0].id
      }, JWT_SECRET, {expiresIn: '7d'})

      event.cookies.set('userSession', token, { path: '/', maxAge: COOKIE_MAX_AGE, sameSite: 'none', secure: true})
      event.locals.user = {
        email, fullName, id: newUser[0].id
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
            fullName,
            email,
            password,
            passwordConfirmation,
          },
          error: {
            message: 'Email already exist, try to login instead',
            details: null
          }
        })
      }

			return fail(400, {
        data: {
          fullName,
          email,
          password,
          passwordConfirmation,
        },
				error: {
					message: 'Register user fail, please try again later',
          details: null
				}
			});
		}
	}
} satisfies Actions;
