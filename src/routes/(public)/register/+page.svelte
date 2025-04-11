<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	let { form } = $props();
</script>

<form method="post" use:enhance={(event) => {
  return async ({ result }) => {
    if (result.type === 'redirect') {
      goto(result.location, {invalidateAll: true});
    } else {
      await applyAction(result);
    }
  };
}}>
	<div>
		{#if form?.error.message}
			<p>{form.error.message}</p>
		{/if}
	</div>
	<div>
		<label for="fullName">Full Name</label>
		<input type="text" name="fullName" id="fullName" value={form?.data.fullName || ''} />
		{#if form?.error?.details?.fullName}
			<p>{form.error.details.fullName}</p>
		{/if}
	</div>
	<div>
		<label for="email">Email</label>
		<input type="email" name="email" id="email" value={form?.data?.email || ''} />
		{#if form?.error?.details?.email}
			<p>{form.error.details.email}</p>
		{/if}
	</div>
	<div>
		<label for="password">Password</label>
		<input type="password" name="password" id="password" value={form?.data?.password || ''} />
		{#if form?.error?.details?.password}
			<p>{form.error.details.password}</p>
		{/if}
	</div>
	<div>
		<label for="password_confirmation">Password Confirmation</label>
		<input
			type="password"
			name="password_confirmation"
			id="password_confirmation"
			value={form?.data?.passwordConfirmation || ''}
		/>
		{#if form?.error?.details?.passwordConfirmation}
			<p>{form.error.details.passwordConfirmation}</p>
		{/if}
	</div>
	<button>Register</button>
</form>
