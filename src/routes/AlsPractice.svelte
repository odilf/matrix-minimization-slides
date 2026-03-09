<script lang="ts">
	import Katex from './Katex.svelte';
	import { Matrix } from './matrix.svelte';

	let {
		matrix,
		slideStep,
		rank = 2
	}: {
		matrix: Matrix;
		slideStep: number;
		rank?: number;
	} = $props();

	const m = $derived(matrix.data.length);
	const n = $derived(matrix.data[0].length);

	const initial = $derived.by(() => {
		const U = Matrix.fromFn(m, rank, () => Math.random());
		const V = Matrix.fromFn(n, rank, () => Math.random());
		const error = matrix.reconstructionError(U, V);
		return {
			U,
			V,
			error
		};
	});

	const getStep = $derived.by(() => {
		const cache: { U: Matrix; V: Matrix; error: number }[] = [];
		function getStep(step: number): { U: Matrix; V: Matrix; error: number } {
			if (cache[step]) {
				return cache[step];
			}
			if (step === 0) {
				return initial;
			} else {
				let { U, V } = getStep(step - 1);
				U = U.clone();
				V = V.clone();
				if (step % 2 != 0) {
					// Update U (fix V, optimize each row of U)
					for (let i = 0; i < m; i++) {
						const newRow = matrix.updateRowALS(i, V);
						U.setRow(i, newRow);
					}

					const errorAfterU = matrix.reconstructionError(U, V);
					const out = { error: errorAfterU, U, V };
					cache[step] = out;
					return out;
				} else {
					// Update V (fix U, optimize each column of V)
					for (let j = 0; j < n; j++) {
						const newRow = matrix.updateColumnALS(j, U);
						V.setRow(j, newRow);
					}

					const errorAfterV = matrix.reconstructionError(U, V);
					const out = { error: errorAfterV, U, V };
					cache[step] = out;
					return out;
				}
			}
		}

		return getStep;
	});

	// const steps = $derived.by(() => {
	// 	// Random initialization
	// 	const out = [{ error: initialError, U: U.clone(), V: V.clone() }];

	// 	for (let iter = 0; iter < iterations; iter++) {
	// 		out.push({ error: errorAfterV, U: U.clone(), V: V.clone() });

	// 		// Check for convergence
	// 		if (iter > 0 && Math.abs(errorAfterV - initialError) < 1e-6) {
	// 			break;
	// 		}
	// 	}
	// 	return out;
	// });

	const validation = $derived(matrix.validateForALS(rank));
	$effect(() => {
		if (!validation.valid) {
			console.warn(validation.warnings);
		}
	});

	const { error, U, V } = $derived(getStep(slideStep === Infinity ? 40 : slideStep));
	const X = $derived(U.mul(V.transpose()));
</script>

<div>
	rank: <input
		bind:value={rank}
		class="w-[5ch] border-none bg-black/0 text-[1em]"
		type="number"
		step={1}
		min={1}
		max={m}
	/>, iteration: {slideStep}
</div>
{#if !validation.valid}
	Not valid!
	<ul class="text-left">
		{#each validation.warnings as warning (warning)}
			<li>{warning}</li>
		{/each}
	</ul>
{:else}
	<div class="flex items-center gap-8 text-[0.7em] opacity-50">
		<Katex expr={`V = ${V.tex('?', (x) => x?.toFixed(2) ?? null)}`} />
		<Katex expr={`U = ${U.tex('?', (x) => x?.toFixed(2) ?? null)}`} />
	</div>
	<div class="flex items-center gap-8">
		<Katex expr={`X = ${X.tex('?', (x) => x?.toFixed(2) ?? null)}`} />
		Error: {error.toExponential(3)}
	</div>
{/if}
