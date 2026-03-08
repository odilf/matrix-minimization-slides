<script lang="ts">
	import type { KatexOptions } from 'katex';
	import 'katex/dist/katex.min.css';
	import katex from 'katex';
	import type { ClassValue } from 'svelte/elements';

	const { expr, displayMode = true, class: className = '' as ClassValue } = $props();
	const options: KatexOptions = $derived({
		displayMode: displayMode,
		throwOnError: false,
		trust: true
	});

	let katexString = $derived(katex.renderToString(expr, options));
</script>

<span class={className}>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -->
	{@html katexString}
</span>
