<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import Katex from './Katex.svelte';

	let props: ComponentProps<typeof Katex> = $props();
</script>

<Katex {...props} displayMode={false} />
