<script lang="ts">
	import { goto, replaceState } from '$app/navigation';
	import { onMount, setContext } from 'svelte';
	import '../app.css';
	import { page } from '$app/state';

	let { data, children } = $props();
  let toast = $state<{message: string}>({
    message: ''
  })
  setContext('toast', toast)

  async function handleLogout(event: Event) {
    event.preventDefault()

    const response = await fetch('/api/logout', {
      method: 'post',
      credentials: 'include'
    })
    if (!response.ok) {
      toast.message = 'Logout failed, please try again later'
    }
    toast.message = 'Logout success'
    goto('/', {
      invalidateAll: true
    })
  }

  // wont work yet
  onMount(() => {
    const toastType = page.url.searchParams.get('toast')
    if (toastType === 'auth_success') {
      toast.message = 'Authentication success'
    }
  })
</script>

<header>
	<nav>
		<a href="/">Logo</a>
		{#if data.email}
			<div>
				<form onsubmit={handleLogout}>
          <button>Log Out</button>
        </form>
			</div>
			<p>{data.fullName}</p>
		{:else}
			<div>
				<a href="/register">Register</a>
			</div>
      <div>
				<a href="/login">Login</a>
			</div>
		{/if}
	</nav>
</header>

{@render children()}
{#if toast.message}
  <div aria-live="assertive">
    <p>{toast.message}</p>
    <button onclick={(e) => toast.message = ''}>Ok</button>
  </div>
{/if}