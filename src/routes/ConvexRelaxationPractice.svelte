<script lang="ts">
	import Katex from './Katex.svelte';
	import { Matrix } from './matrix.svelte';
	import { SDPMatrixCompletion } from './sdp_matrix_completion';
	// @ts-expect-error No types for this library
	import Plotly from 'plotly.js-dist';

	let {
		matrix,
		slidePart
	}: {
		matrix: Matrix;
		slidePart: number;
	} = $props();

	let useArtifical = $state(true);
	let targetRank = $state(3);
	let n = $state(4);
	let m = $state(9);
	const U = $derived.by(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-expressions
		slidePart;
		return Matrix.fromFn(n, targetRank, () => Math.random());
	});
	const V = $derived(Matrix.fromFn(m, targetRank, () => Math.random()));
	const artificialSolved = $derived(U.mul(V.transpose()));
	const artificialExample = $derived(artificialSolved.map((x) => (Math.random() > 0.2 ? x : null)));

	const activeMatrix = $derived(useArtifical ? artificialExample : matrix);

	$effect(() => {
		if (SDPMatrixCompletion.rank(artificialSolved) !== targetRank) {
			console.warn('ARTIFICIAL MATRIX DOES NOT HAVE TARGET RANK!!');
		}
	});

	const solver = $derived(
		new SDPMatrixCompletion(activeMatrix, {
			rho: 3.0,
			maxIter: 10,
			tolerance: 1e-4
		})
	);
</script>

<div class="grid grid-cols-[auto_auto_auto_auto_1fr] items-center gap-x-2">
	<div>Use artifical example</div>

	<input bind:checked={useArtifical} class="ml-4 h-[1ch] w-[1ch]" type="checkbox" />
	{#if useArtifical}
		<div class="text-right">n:</div>
		<input class="w-[5ch] border-none bg-black/0 text-[1em]" bind:value={n} type="number" />
		<div class="row-span-2 text-[0.3em] opacity-40">
			<Katex expr={artificialSolved.tex('', (v) => v?.toFixed(1) ?? null)} />
			<Katex expr={artificialExample.tex('', (v) => v?.toFixed(1) ?? null)} />
		</div>
		<div class="text-right">true rank:</div>
		<input
			class="w-[5ch] border-none bg-black/0 text-[1em]"
			bind:value={targetRank}
			type="number"
		/>
		<div class="text-right">m:</div>
		<input class="w-[5ch] border-none bg-black/0 text-[1em]" bind:value={m} type="number" />
	{/if}
</div>

{#if slidePart > 0}
	{@const { completed, history, finalError } = solver.solve()}
	{@const nuclearNorm = SDPMatrixCompletion.nuclearNorm(completed)}
	{@const rank = SDPMatrixCompletion.rank(completed)}
	<Katex
		class="text-[0.8em] opacity-80"
		expr={`X = ${completed.tex('?', (x) => x?.toFixed(2) ?? null)}`}
	/>

	<div class="flex">
		<div>
			<div>Error: {finalError.toExponential(2)}</div>
			<div>Nuclear norm: {nuclearNorm.toFixed(2)}</div>
			<div>Rank: {rank}</div>
		</div>

		<div
			class="h-[8em]"
			{@attach (el) => {
				Plotly.newPlot(
					el,
					[
						{
							x: history.map((_, i) => i),
							y: history.map((h) => h.nuclearNorm),
							name: 'Nuclear norm'
						},

						{
							x: history.map((_, i) => i),
							y: history.map((h) => h.rank),
							name: 'Rank'
						}
					],
					{
						margin: { t: 0, l: 20, r: 0, b: 40 },
						paper_bgcolor: '#00000000',
						plot_bgcolor: '#00000000',
						template: 'plotly_dark',
						font: { family: 'KaTeX_Main' }
					}
				);
			}}
		></div>
	</div>
{/if}

<style>
	:global(.plotly) {
		filter: invert(90%) hue-rotate(180deg);
	}
</style>
