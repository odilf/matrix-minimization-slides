<script lang="ts">
	import type { Snippet } from 'svelte';

	type Slide = Snippet<[number]>;
	type Props = { [key: string]: Slide | number | boolean } & {
		slideIndex?: number;
		printing?: boolean;
	};
	let { slideIndex = $bindable(0), printing = false, ...slidesObject }: Props = $props();

	const slides = $derived(
		Object.entries(slidesObject)
			.filter((x) => typeof x[1] === 'function')
			.map(([name, content]) => ({ name, content: content as Slide }))
	);

	const nextSlide = () => (slideIndex = Math.min(slideIndex + 1, slides.length - 1));
	const prevSlide = () => (slideIndex = Math.max(slideIndex - 1, 0));

	let partIndices = $state(slides.map(() => 0));
</script>

<svelte:window
	onkeydown={(e) => {
		if (e.key === 'ArrowRight' || e.key === 'l') {
			nextSlide();
		} else if (e.key === 'ArrowLeft' || e.key === 'h') {
			prevSlide();
		} else if (e.key === 'ArrowUp' || e.key === 'k') {
			partIndices[slideIndex] += 1;
		} else if (e.key === 'ArrowDown' || e.key === 'j') {
			partIndices[slideIndex] = Math.max(partIndices[slideIndex] - 1, 0);
		}
	}}
/>

<main class="block h-screen text-center">
	{#each slides as slide, i (slide.name)}
		{@const offset = slideIndex - i}
		<section
			class={[
				'absolute flex h-screen w-screen flex-col items-center justify-center  p-8',
				'print:visible print:relative',

				offset !== 0 && !printing && 'pointer-events-none opacity-0',
				Math.abs(offset) > 1 && !printing && 'hidden'
			]}
			style:transition-delay={offset === 0 ? '0ms, 150ms' : '0ms, 0ms'}
			// style:transition-delay="1000ms"
			style:transform="translateX({-Math.sign(offset) * 0.05 * 100 * (printing ? 0 : 1)}%)"
		>
			{@render slide.content(printing ? Infinity : partIndices[i])}
		</section>
	{/each}

	<div
		class="absolute bottom-0 left-0 h-2 bg-purple-900 transition-all"
		style:width="{(slideIndex / (slides.length - 1)) * 100}vw"
	></div>
</main>

<style lang="postcss">
	main :global(aside) {
		display: none;
	}

	section {
		transition:
			transform 800ms var(--ease-out-expo),
			opacity 300ms ease-out;
	}
</style>
