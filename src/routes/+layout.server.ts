import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
  console.log('in layout: ', locals, cookies.get('userSession'));

  return locals.user as {email: string, fullName: string, id: number}
}