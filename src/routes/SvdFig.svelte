<script>
	import Katex from './Katex.svelte';
</script>

<div class="flex flex-col items-center gap-2 p-8 font-serif text-[1.7em]">
	<div class="flex items-center gap-3">
		<!-- A matrix -->
		<div class="flex flex-col items-center gap-1">
			<span class="text-[0.6em]">#movies</span>
			<div class="flex h-[6em] w-[4em] items-center justify-center border border-slate-200">
				<Katex expr={`\\mathbf{A}`} />
			</div>
			<span class="absolute -translate-x-[170%] translate-y-[380%] rotate-270 text-[0.6em]"
				>#users</span
			>
		</div>

		<div class="flex flex-col items-center gap-1">
			<span class="text-[0.6em]">&nbsp;</span>
			<span class="pb-4"><Katex expr="=" /></span>
		</div>

		<!-- U matrix -->
		<div class="flex flex-col items-center gap-1 pl-10">
			<span class="text-[0.6em] text-yellow-200">#factors</span>
			<div class="flex h-[6em] w-[2em] items-center justify-center border border-slate-200">
				<Katex expr={`\\mathbf{U}`} />
			</div>
			<span class="absolute -translate-x-[95%] translate-y-[380%] rotate-270 text-[0.6em]"
				>#users</span
			>
		</div>

		<!-- Sigma matrix -->
		<div class="flex flex-col items-center gap-1 text-yellow-200">
			<span class="text-[0.6em]">&nbsp;</span>
			<div class="flex h-[2em] w-[2em] items-center justify-center border border-yellow-200">
				<Katex expr="\Sigma" />
			</div>
		</div>

		<!-- V^T matrix -->
		<div class="flex flex-col items-center gap-1">
			<span class="text-[0.6em]">#movies</span>
			<div class="flex h-[2em] w-[4em] items-center justify-center border border-slate-200">
				<Katex expr={`\\mathbf{V}^T`} />
			</div>
			<span
				class="absolute translate-x-[125%] translate-y-[168%] rotate-90 text-[0.6em] text-yellow-200"
				>#factors</span
			>
		</div>
	</div>
</div>
