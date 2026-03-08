<script lang="ts">
	import { Matrix } from './matrix.svelte.ts';

	type Movie = {
		name: string;
		posterUrl: string;
	};

	let {
		names,
		movies,
		matrix = $bindable(Matrix.empty(names.length, movies.length))
	}: { matrix: Matrix; names: string[]; movies: Movie[] } = $props();

	$effect(() => {
		matrix = Matrix.empty(names.length, movies.length);
	});
</script>

<div class=" grid grid-cols-3 place-items-center gap-4">
	<div></div>
	{#each movies as { name, posterUrl } (name)}
		<div>
			<img src={posterUrl} alt="{name}'s poster" class="h-80 w-60 object-cover" />
		</div>
	{/each}

	{#each names as name, i (name)}
		<div>{name}</div>
		{#each movies as { name }, j (name)}
			<div class="flex w-full justify-around">
				<button
					class="rounded {matrix.get(i, j) !== 1
						? 'hover:bg-gray-900'
						: 'bg-gray-600'} p-2 transition"
					onclick={() => (matrix.data[i][j] = matrix.data[i][j] === 1 ? null : 1)}
				>
					👍</button
				>

				<button
					class="rounded {matrix.get(i, j) !== -1
						? 'hover:bg-gray-900'
						: 'bg-gray-600'} p-2 transition"
					onclick={() => (matrix.data[i][j] = matrix.data[i][j] === -1 ? null : -1)}
				>
					👎</button
				>
			</div>
		{/each}
	{/each}
</div>
