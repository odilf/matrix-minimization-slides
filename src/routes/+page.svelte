<script lang="ts">
	import Katex from './Katex.svelte';
	import { Matrix } from './matrix.svelte.ts';
	import Slides from './Slides.svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import SvdFig from './SvdFig.svelte';
	import K from './K.svelte';
	import AlsPractice from './AlsPractice.svelte';
	import ConvexRelaxationPractice from './ConvexRelaxationPractice.svelte';

	const genRandomMatrix = (hidden = 0.0) =>
		Matrix.fromFn(6, 8, (i, j) =>
			Math.random() > hidden
				? Math.round((((Math.sin(i + j + Math.random() / 2) + 1) / 2) * 10) / 2)
				: null
		);

	let randomMatrix = $state(genRandomMatrix());
	const variableIndices = randomMatrix.map(() => (Math.random() > 0.6 ? null : 0));

	let slideIndex = $state(parseInt(page.url.searchParams.get('slide') || '0'));
	let printing: boolean = $state(JSON.parse(page.url.searchParams.get('print') ?? 'false'));

	$effect(() => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(`/?slide=${slideIndex}&print=${printing}`);
	});

	const randomMatrixInterval = setInterval(
		() =>
			(randomMatrix = new Matrix(
				randomMatrix.data.map((row, i) =>
					row.map((elem, j) =>
						variableIndices.data[i][j] === null ? parseInt((Math.random() * 5).toFixed(0)) : elem
					)
				)
			)),
		50
	);

	onDestroy(() => {
		clearInterval(randomMatrixInterval);
	});

	const names = ['Student 1', 'Student 2', 'Student 3', 'Student 4'];
	const movies = [
		{
			name: 'Inception',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fimage.tmdb.org%2Ft%2Fp%2Foriginal%2FxlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg&f=1&nofb=1&ipt=a42c80f76bb0b0f2d5c42c5f0c4c35009bc1f8116d0f1eac9d6f58a8a7120e88'
		},
		{
			name: 'The Notebook',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.etsystatic.com%2F55209953%2Fr%2Fil%2Fca4013%2F6401823337%2Fil_1140xN.6401823337_8pch.jpg&f=1&nofb=1&ipt=c7e0539ef4026d95054317b2bea89aad47276707f91e60d48c3a361fcdbf3493'
		},
		{
			name: 'Matrix',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc8.alamy.com%2Fcomp%2FE5MJ15%2Fthe-matrix-l-r-joe-pantoliano-laurence-fishburne-keanu-reeves-carrie-E5MJ15.jpg&f=1&nofb=1&ipt=f78092cbccdf5599ba37880a53ca6957ad35b1f96ca1d4361df7bda22d49135c'
		},
		{
			name: 'Titanic',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fc8.alamy.com%2Fcomp%2FPXNB80%2Ftitanic-original-movie-poster-PXNB80.jpg&f=1&nofb=1&ipt=4e8bb5589b5b51a34ed85a7f4ec60e388615865386023bf78cd737184933ab55'
		},
		{
			name: 'Interstellar',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fm.media-amazon.com%2Fimages%2FM%2FMV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU%40._V1_.jpg&f=1&nofb=1&ipt=632a4e6f59cf1522f90a944e9e88b02e185b4143364ee3f534fe56ab4a57df4a'
		},
		{
			name: 'La La Land',
			posterUrl:
				'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi5.walmartimages.com%2Fseo%2FLa-La-Land-Movie-Poster-Poster-Print-24-x-36_20f02811-01b4-4aea-9bb2-a79942bd2642_1.856c035d66f8fd216f6d933259bc3dfb.jpeg&f=1&nofb=1&ipt=83c5514a7601246d265d4301bee1660fd939af12a022c29f63e7fadc16152ea0'
		}
	];

	const stored = sessionStorage.getItem('mainExampleMatrix');
	let mainExampleMatrix = $state(
		stored
			? new Matrix(JSON.parse(stored))
			: Matrix.fromFn(names.length, movies.length, () =>
					!printing ? null : Math.random() > 0.6 ? 1 : Math.random() > 0.2 ? -1 : null
				)
	);

	$effect(() => {
		sessionStorage.setItem('mainExampleMatrix', JSON.stringify(mainExampleMatrix.data));
	});

	function show(partIndex: number, i: number): Attachment<HTMLElement> {
		return (element) => {
			element.style.opacity = partIndex < i ? '0' : '1';
			element.style.transform = partIndex < i ? '' : 'translateY(-5%)';
			element.style.transitionDuration = '500ms';
			element.style.transitionProperty = 'opacity transform';
		};
	}
</script>

<Slides bind:slideIndex {printing}>
	{#snippet title()}
		<h1>Netflix problem</h1>
		<h2 class="opacity-50">i.e., matrix completion problem</h2>
		<p class="mt-16 text-purple-300">By Paula, Bruno and Odysseas</p>

		<aside class="notes">Hello, blah blah blah</aside>
	{/snippet}

	{#snippet contents()}
		<div class="p-4 text-left">
			<h2 class="mb-8">Today:</h2>
			<ol>
				<li>Motivation <span class="text-[0.9em] opacity-20">(Netflix problem)</span></li>
				<li>
					Theory <span class="text-[0.9em] opacity-20">(min rank and min rank with noise)</span>
				</li>
				<li>
					Algorithms <span class="text-[0.9em] opacity-20"
						>(convex relaxation and uncontrained equivalents)</span
					>
				</li>
			</ol>
		</div>
	{/snippet}

	{#snippet motivation1(k: number)}
		{@const randomMatrix = genRandomMatrix(0.2)}
		<aside>We are Netflix. We have users, movies, and reviews.</aside>
		<div class="grid" style:grid-template-columns="repeat({movies.length + 1}, 1fr)">
			<div></div>
			{#each movies as { name, posterUrl } (name)}
				<img
					src={posterUrl}
					alt="{name}'s poster"
					class="h-80 object-contain"
					{@attach show(k, 2)}
				/>
			{/each}

			{#each names as name, i (name)}
				<div {@attach show(k, 1)}>
					{name}:
				</div>
				{#each movies as { name }, j (name)}
					{@const rating = randomMatrix.get(i, j)}
					<div {@attach show(k, 3)} class="text-[0.6em]">
						{'⭐'.repeat(rating ?? 0)}
					</div>
				{/each}
			{/each}
		</div>

		<p {@attach show(k, 4)} class="mt-8 font-bold">Can we predict if a user will like a movie?</p>
	{/snippet}

	{#snippet motivation2()}
		<p>Generally: we are given an incomplete matrix</p>
		<Katex
			expr={'\\begin{bmatrix}' +
				randomMatrix.data
					.map((row, i) =>
						row
							.map((elem, j) =>
								variableIndices.data[i][j] === null ? `\\htmlClass{text-purple-300}{${elem}}` : elem
							)
							.join('&')
					)
					.join('\\\\') +
				'\\end{bmatrix}'}
		/>
		<b>How can we fill it in?</b>
	{/snippet}

	{#snippet motivation3(i: number)}
		<div class="text-left">
			<h3 class="text-balance">
				Problem is <span class="text-purple-300"> underdetermined</span>, <br /> so we impose some condition:
			</h3>
			<ul class="mt-8">
				<li {@attach show(i, 1)}>
					<span class={['transition-opacity', i >= 5 && 'opacity-60']}> Arbitrarily</span>
				</li>
				<li
					{@attach show(i, 2)}
					class={['w-fit rounded', i >= 5 ? 'bg-purple-500/20 pr-4 pl-4' : 'pr-8']}
				>
					Rank minimization
				</li>
				<li {@attach show(i, 3)}>
					<span class={['transition-opacity', i >= 5 && 'opacity-60']}> Positive-definiteness</span>
				</li>
				<li {@attach show(i, 4)}>
					<span class={['transition-opacity', i >= 5 && 'opacity-60']}> Maximal determinant</span>
				</li>
			</ul>
		</div>
	{/snippet}

	{#snippet motivation4()}
		<div class="flex h-full flex-col text-left">
			<h3 class="font-bold">Why rank minimization?</h3>
			<div class="flex h-full flex-col justify-center">
				<SvdFig />
			</div>
		</div>
	{/snippet}

	{#snippet theory1()}
		<div class="flex h-full flex-col">
			<h3>II. Theory:</h3>
			<h2>Low rank minimization</h2>
			<div class="flex h-full flex-col justify-center text-left text-[0.8em]">
				<p>There are a lot of matrices that can't be completed if given little data</p>
				<Katex
					expr={`A=e_1e_n^T=\\begin{bmatrix}
                        0&\\dots&1\\\\
                        \\vdots& \\ddots &\\vdots\\\\
                        0&\\dots &0
                    \\end{bmatrix}`}
				/>

				<p class="w-[70ch]">
					<b>The problem:</b> we want to complete <Katex
						expr={`A\\in \\mathbb R^{m\\times n}`}
						displayMode={false}
					/> and we have a set <Katex expr="\Omega" displayMode={false} />
					of known entries of it. We assume the known entries are sampled uniformly at random. Therefore
					our completion will be given by
				</p>
				<Katex
					expr={`\\begin{align*}
				    	\\min_{X \\in \\mathbb{R}^{n \\times m}} \\quad & \\text{rank}(X) \\\\
					    \\text{s.t.} \\quad & X_{ij} = M_{ij}, \\, \\forall (i,j) \\in \\Omega
					\\end{align*}`}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet lowRankProperties(i: number)}
		<div class="text-left">
			<h2>Properties:</h2>
			<div class="w-[90ch] text-[0.7em] opacity-90">
				<ul class="mb-8 space-y-4">
					<li {@attach show(i, 1)}>
						For completing the matrix, we need at least one entry of every row and column.
					</li>

					<li {@attach show(i, 2)}>
						If <K expr="m<n" /> then we need at least <K expr="4nr-4r^2" /> observed entries for finding
						a solution of the matrix completion problem. The solution is unique if <K
							expr="r\leq n/2"
						/>.
					</li>

					<li {@attach show(i, 3)}>
						If <K expr={`\\operatorname{rank}(A)=r`} /> and <K expr={`N=\\max{(m, n)}`} />. If <K
							expr="|\Omega|=M"
						/>, then there are constants <K expr="C,c" /> such that if <K
							expr={`M\\geq CN^{6 / 5}r\\log N`}
						/>. Then the low rank minimization problem has a unique solution equal to the real
						matrix <K expr="A" /> with probability greater or equal to <K expr={`1-cN^{-3}`} />.
					</li>
				</ul>

				<p {@attach show(i, 4)}>
					Solving the optimization problem is usually complicated (NP-hard), so it is usually
					relaxed to
					<Katex
						expr={`\\begin{align*}
					\\min_{X\\in \\mathbb{R}^{m\\times n}} \\quad & ||X||_*=\\sum_{k=1}^r\\sigma_k(X)\\\\
					 \\text{s.t. } \\quad & X_{i,j}=A_{i,j}\\quad \\forall (i,j)\\in \\Omega
                    \\end{align*}`}
					/>
				</p>
			</div>
		</div>
	{/snippet}

	{#snippet lowRankClasswork(part: number)}
		{@const examples = [
			[
				new Matrix([
					[1, 1, 2, 1],
					[1, 1, 2, 1],
					[1, 1, 2, 1],
					[1, 1, 2, 1]
				]),
				new Matrix([
					[null, null, 2, null],
					[null, null, null, 1],
					[1, 1, 2, 1],
					[1, null, null, null]
				])
			],
			[
				new Matrix([
					[1, null, null, null],
					[null, 2, null, null],
					[null, null, null, 5],
					[null, null, null, 3]
				])
			],
			[
				new Matrix([
					[4, 1, 2, 5],
					[1, 2, 3, 5],
					[4, 1, 2, 5],
					[2, 4, 6, 10]
				]),
				new Matrix([
					[4, null, 2, 5],
					[null, 2, 3, 5],
					[null, 1, 2, null],
					[1, 4, null, null]
				])
			]
		]}
		<div class="text-left">
			<h2>Classwork</h2>
			<p class="text-[0.8em]">
				Is completing the following matrices possible? If so, what would be the completed matrix?
			</p>

			<div class="flex flex-wrap justify-center gap-20 text-[1em]">
				<!-- eslint-disable-next-line svelte/require-each-key -->
				{#each examples as [solved, unsolved], i}
					{@const hide = (j: number, k: number) => unsolved?.get(j, k) === null}
					{@const entries = solved.data.map((row, j) =>
						row.map((elem, k) =>
							hide(j, k)
								? `\\htmlClass{transition text-purple-300 ${i >= part ? 'opacity-0' : ''}}{${elem}}`
								: elem
						)
					)}
					<div class={[unsolved === undefined && i < part && 'cross']}>
						<Katex
							expr={`\\begin{bmatrix}
     					  ${entries.map((row) => row.join('&')).join('\\\\')}
						\\end{bmatrix}`}
						/>
					</div>
				{/each}
			</div>

			<p><b>Hint:</b> None of the matrices has rank higher than 2.</p>
		</div>
	{/snippet}

	{#snippet lowRankNoise()}
		<div class="text-left">
			<h2>Low rank with noise</h2>
			<div class="flex h-full w-[70ch] flex-col justify-center text-left text-[0.8em]">
				<p class="opacity-90">
					In real world applications, it is very usual to assume that the given data has some noise.
					If <Katex expr={`Z\\in\\mathbb R^{m\\times n}`} displayMode={false} /> is the noise matrix (either
					deterministic or stochastic), we can think of the entries of our desired matrix as
				</p>
				<Katex expr={`Y_{i,j}=A_{i,j}+Z_{i,j}\\quad \\forall (i,j)\\in\\Omega`} />

				<p class="opacity-90">
					We define <K expr={`P_{\\Omega}(M)`} /> as the matrix with entries in
					<K expr="\Omega" /> to be the same as in <K expr="M" /> and the rest are zero. Therefore, for
					a given <K expr="\delta>0" /> and assuming <K expr={`||P_{\\Omega}(Z)||\\leq\\delta`} />,
					the problem now is
				</p>
				<Katex
					expr={`\\begin{aligned}
						&\\min_{X\\in \\mathbb{R}^{m\\times n}} \\operatorname{rank}(X)\\\\
						& \\text{s.t. } ||P_{\\Omega}(X-Y)||_{F}\\leq\\delta
					\\end{aligned}`}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet lowRankNoiseProperties(i: number)}
		<div class="text-left">
			<h2>Properties:</h2>
			<div class="text-[0.7em] opacity-90">
				<ul class="space-y-4">
					<li {@attach show(i, 1)}>
						When perfect noiseless recovery occurs, then matrix completion is stable vis a vis
						perturbations.
					</li>

					<li {@attach show(i, 2)}>
						Matrix <Katex expr="X" displayMode={false} /> which solves the problem does not obey the restricted
						isometry property (RIP).
						<Katex
							expr={`(1-\\delta)||X||_{F}^2\\leq \\frac{1}{p}||P_{\\Omega}(X)||_{F}^2\\leq (1+\\delta)||X||_{F}^2,\\quad p=\\frac{M}{mn}`}
						/>
					</li>

					<li {@attach show(i, 3)}>
						<p class="w-[70ch]">
							In the case that <K expr="m=n" /> and that the noise is deterministic, we can estimate the
							best accuracy that one can achieve. If <K expr={`A^\\text{Oracle}`} /> is the solution to
							the least squares problem
						</p>
						<Katex
							expr={`\\begin{align*}
								\\min  &\\quad||P_{\\Omega}(X)-P_\\Omega(Y)||_{F}\\\\
								\\text{s.t. }& \\quad X\\in T							\\end{align*}`}
						/>
						<p class="w-[70ch]">Then we can expect an accuracy of</p>
						<Katex expr={`||A^\\text{Oracle}-A||_F\\approx \\delta p^{-1/2}`} />
					</li>
				</ul>
			</div>
		</div>
	{/snippet}

	{#snippet algorithmsIntro()}
		<div class="flex h-full flex-col">
			<h3>III. Algorithms</h3>
			<div class="flex h-full flex-col justify-center">
				<ol class="text-left text-[1.2em] leading-[0.9em] font-bold">
					<li class="mt-4">
						Convex relaxation <br />
						<span class="text-[0.6em] font-thin opacity-50"> (like with max-cut) </span>
					</li>
					<li class="mt-8">
						Unconstrained equivalents <br />
						<span class="text-[0.6em] font-thin opacity-50">
							(like with non-linear problems with linear constraints)
						</span>
					</li>
				</ol>
			</div>
		</div>
	{/snippet}

	{#snippet convex1(i: number)}
		<h2 class="mb-8">i) Convex relaxation</h2>
		<div class="text-left">
			<p class="opacity-80">
				Problem: rank is a <span class="text-purple-300"> non-convex </span> function
			</p>
			<p {@attach show(i, 1)}>
				Relaxation: minimize the <i> nuclear norm </i>
			</p>

			<div {@attach show(i, 1)} class="mt-8">
				<!-- <Katex expr="\|X\|_* = \sum_k \sigma_k(X)" /> -->
				<Katex
					expr={`\\begin{align*}
				\\min_{X\\in \\mathbb{R}^{m\\times n}} \\quad & ||X||_*=\\sum_{k=1}^r\\sigma_k(X)\\\\
				 \\text{s.t. } \\quad & X_{i,j}=A_{i,j}\\quad \\forall (i,j)\\in \\Omega
                    \\end{align*}`}
				/>
			</div>
			<div {@attach show(i, 2)} class="mt-8">
				<Katex
					expr={`\\begin{align*}
                		 \\operatorname{rank} & \\sim \\ell_0 \\\\
               			 \\|X\\|_*            & \\sim \\ell_1
         			\\end{align*}`}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet convex2(i: number)}
		<p class="font-bold">Formulate as SDP problem</p>
		<Katex
			expr={`\\begin{align*}
              \\min \\quad & \\operatorname{trace}(X) \\\\
              \\text{s.t.} \\quad &
              X_{ij} = M_{ij}, \\, (i,j) \\in \\Omega, \\\\
              &
              X\\succeq 0 .
            \\end{align*}`}
		/>

		<ul class="max-w-[40ch] text-left font-[0.7em] opacity-90">
			<li {@attach show(i, 1)}>Heuristically sensible</li>
			<li {@attach show(i, 2)}>
				Time complexity <K expr={`\\mathcal{O}(\\max(n, m)^4)`} />, SOTA breaks down after <K
					expr="100\times100"
				/>
			</li>
		</ul>
	{/snippet}

	{#snippet als1(i: number)}
		<h2>ii) Unconstrained equivalents</h2>
		<p class="mb-32">(we again have two variations)</p>
		<div {@attach show(i, 1)}>
			<h3 class="mb-12 text-purple-300">Alternating Least Squares</h3>
			<div>
				Let <K expr="X = U V^T" />,
				<Katex
					expr={`U, V \\in \\mathbb{R}^{n \\times r} \\Rightarrow \\operatorname{rank}(X)
				\\leq r`}
				/>
			</div>
		</div>
	{/snippet}

	<!-- {#snippet als2()}{/snippet} -->

	{#snippet als3(i: number)}
		{@const classesU = ['transition', 'text-purple-400', 'text-gray-600', 'text-gray-600']}
		{@const classesV = ['transition', 'text-gray-600', 'text-purple-400', 'text-purple-400']}
		<h3 class="mb-12 text-purple-300">Alternating Least Squares</h3>
		<div>
			<b>New objective:</b>

			<div class="relative transition">
				<Katex
					expr={`\\min_{\\htmlClass{${classesU[i]}}{U}, \\htmlClass{${classesV[i]}}{V}} \\left\\| P_\\Omega (\\htmlClass{${classesU[i]}}{U} \\htmlClass{${classesV[i]}}{V^T}) - P_\\Omega(M)\\right\\|_F^2`}
				/>
			</div>

			<p>Convex? No, but...</p>
			<p {@attach show(i, 1)}>
				... it is convex over <K expr="U" /> or <K expr="V" />
				<span class="text-purple-300"> independently </span>
			</p>

			<div {@attach show(i, 3)}>
				<p class="mt-8 font-bold">Convergence</p>
				<p>
					Shown to be <K expr="O(|\Omega| r^2 \log(1/\varepsilon))" />, <br /> feasible for big problems
					in practice (e.g., Netflix)
				</p>
			</div>
		</div>
	{/snippet}

	{#snippet gnmc1(i: number)}
		<h3 class="text-purple-300">Gauss-Newton Matrix Completion</h3>
		<p>Linearizing...</p>
		<Katex
			class="my-16"
			expr={`\\min_{\\Delta U,\\Delta V} \\|P_\\Omega  \\left(U_0 V_0^T+U_0 \\Delta V^T+\\Delta U V_0^T\\right)-P_{\\Omega }(M)\\|_{F}^{2}`}
		/>
		<p {@attach show(i, 1)}>Increments can be solved with ALS!</p>
		<p {@attach show(i, 2)}>
			But also vectorizing (i.e., stacking <K expr="\Delta U" /> and
			<K expr="\Delta V^T" />)
		</p>
	{/snippet}
	{#snippet classExample(i)}
		{@const matrix = mainExampleMatrix}
		<p class="mb-8 w-full text-left opacity-80">Let's see them in practice! But first...</p>
		<div
			class="grid"
			style:grid-template-columns="repeat({movies.length + 1}, 1fr)"
			{@attach show(i, 1)}
		>
			<div class="text-[0.6em]">
				<Katex expr={matrix.tex('\\quad \\quad')} />
			</div>
			{#each movies as { name, posterUrl } (name)}
				<img src={posterUrl} alt="{name}'s poster" class="mx-auto h-80 object-contain" />
			{/each}

			{#each names as name, i (name)}
				<div class=" text-right">
					<input
						bind:value={names[i]}
						class="w-[calc(100%-1em)] border-none bg-black/0 text-right text-[1em]"
						onkeydown={(e) => e.stopPropagation()}
					/>:
				</div>
				{#each movies as { name }, j (name)}
					<div class="flex w-full items-center justify-center gap-5 text-[0.6em]">
						{#each [1, -1] as value (value)}
							<button
								class="h-fit rounded {matrix.get(i, j) !== value
									? 'opacity-50 hover:opacity-90 active:opacity-100'
									: 'bg-gray-600/30'} p-1 transition"
								onclick={() => (matrix.data[i][j] = matrix.data[i][j] === value ? null : value)}
							>
								{value === 1 ? '👍' : '👎'}
							</button>
						{/each}
					</div>
				{/each}
			{/each}
		</div>
	{/snippet}
	{#snippet algsPractice1(i: number)}
		<p class="absolute top-[1ch] left-[1ch] text-left opacity-50">
			Convex <br /> Relaxation <br /> Practice
		</p>

		<ConvexRelaxationPractice matrix={mainExampleMatrix} slidePart={i} />
	{/snippet}
	{#snippet algsPractice2(i: number)}
		<div class="flex h-full flex-col">
			<p>
				Putting it in practice! <span class="text-[0.5em] opacity-50">
					Remember, we're working with <K expr={mainExampleMatrix.tex()} />
				</span>
			</p>

			<div class="flex-1"></div>
			<div class="flex flex-col items-center">
				<AlsPractice matrix={mainExampleMatrix} slideStep={i} />
			</div>
			<div class="flex-1"></div>
		</div>
	{/snippet}

	{#snippet summary(i: number)}
		<div class="p-4 text-left">
			<h2>Summary</h2>
			<ol class="text-[1em]">
				<li {@attach show(i, 1)}>
					<span class="text-purple-300 underline">Motivation:</span> Low rank to exploit
					<q>hidden factors</q>
				</li>
				<li {@attach show(i, 2)}>
					<span class="text-purple-300 underline">Theory:</span>
					<ul>
						<li>Low rank: fundamental formulation</li>
						<li>Low rank with noise: more realistic</li>
					</ul>
				</li>
				<li {@attach show(i, 3)}>
					<span class="text-purple-300 underline">Algorithms:</span>
					<ul>
						<li>Convex relaxation: <K expr="\ell_0 \to \ell_1" /> via nuclear norm</li>
						<li>
							Unconstrained equivalents:
							<ol>
								<li>Alternating Least Squares</li>
								<li>Gauss-Newton Matrix Completion</li>
							</ol>
						</li>
					</ul>
				</li>
			</ol>

			<div class="opacity-50">
				<p class="mt-8" {@attach show(i, 4)}>Thanks for listening!</p>
			</div>
		</div>
	{/snippet}
	{#snippet empty()}{/snippet}
</Slides>

<style>
	.cross {
		position: relative;
		overflow: hidden; /* hide overflow of pseudo elements */
	}

	.cross:before,
	.cross:after {
		position: absolute;
		content: '';
		background: var(--color-red-800);
		display: block;
		width: 100%;
		height: 30px;
		transform: rotate(-45deg); /* center the X vertically and horizontally: */
		inset: 0;
		margin: auto;
		z-index: -1;
	}

	.cross:after {
		transform: rotate(45deg);
	}
</style>
