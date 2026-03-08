import { Matrix } from './matrix.svelte';

/**
 * Solves the matrix completion problem using SDP convex relaxation:
 *
 * minimize    ||X||_* (nuclear norm = sum of singular values)
 * subject to  X[i,j] = M[i,j] for all observed entries (i,j) ∈ Ω
 *
 * Uses ADMM (Alternating Direction Method of Multipliers) to solve efficiently.
 * This is equivalent to the SDP but much faster in practice.
 */
export class SDPMatrixCompletion {
	private M: Matrix; // Original matrix with nulls for missing entries
	private rho: number; // ADMM penalty parameter
	private maxIter: number;
	private tolerance: number;

	constructor(
		observedMatrix: Matrix,
		options: {
			rho?: number;
			maxIter?: number;
			tolerance?: number;
		} = {}
	) {
		this.M = observedMatrix;
		this.rho = options.rho ?? 1.0;
		this.maxIter = options.maxIter ?? 100;
		this.tolerance = options.tolerance ?? 1e-4;
	}

	/**
	 * Soft thresholding operator for singular values (proximal operator of nuclear norm)
	 * Given SVD: A = U * Sigma * V^T, returns U * shrink(Sigma, tau) * V^T
	 */
	private softThresholdSVD(A: Matrix, tau: number): Matrix {
		const [U, Sigma, V] = A.svd();

		// Apply soft thresholding to singular values
		// const m = Sigma.data.length;
		// const n = Sigma.data[0].length;
		const SigmaThresholded = Sigma.map((v) => Math.max(0, (v as number) - tau));

		// Reconstruct: U * Sigma_thresholded * V^T
		return U.mul(SigmaThresholded).mul(V.transpose());
	}

	/**
	 * Project onto the constraint set (observed entries must match M)
	 */
	private projectOntoConstraints(X: Matrix): Matrix {
		const m = this.M.data.length;
		const n = this.M.data[0].length;

		return Matrix.fromFn(m, n, (i, j) => {
			const observed = this.M.data[i][j];
			if (observed !== null) {
				// Observed entry: must equal M[i,j]
				return observed;
			} else {
				// Missing entry: keep X's value
				return X.data[i][j];
			}
		});
	}

	/**
	 * Element-wise matrix addition
	 */
	private add(A: Matrix, B: Matrix): Matrix {
		const m = A.data.length;
		const n = A.data[0].length;
		return Matrix.fromFn(m, n, (i, j) => (A.data[i][j] as number) + (B.data[i][j] as number));
	}

	/**
	 * Element-wise matrix subtraction
	 */
	private subtract(A: Matrix, B: Matrix): Matrix {
		const m = A.data.length;
		const n = A.data[0].length;
		return Matrix.fromFn(m, n, (i, j) => (A.data[i][j] as number) - (B.data[i][j] as number));
	}

	/**
	 * Solve the matrix completion problem using ADMM
	 *
	 * ADMM formulation:
	 *   minimize    ||Z||_* + I_C(X)
	 *   subject to  X = Z
	 *
	 * where I_C is the indicator function of the constraint set C = {X : X[i,j] = M[i,j] for (i,j) ∈ Ω}
	 *
	 * Returns the completed matrix with all entries filled in
	 */
	solve(): {
		completed: Matrix;
		iterations: number;
		finalError: number;
		history: {
			iteration: number;
			primalResidual: number;
			dualResidual: number;
			nuclearNorm: number;
			rank: number;
		}[];
	} {
		const m = this.M.data.length;
		const n = this.M.data[0].length;

		// Initialize variables
		let X = this.M.clone(); // Primal variable (constrained)
		let Z = this.M.clone(); // Auxiliary variable (for nuclear norm)
		let Y = Matrix.fromFn(m, n, () => 0); // Dual variable (Lagrange multiplier)

		// Fill nulls with zeros for initial X and Z
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				if (X.data[i][j] === null) X.data[i][j] = 0;
				if (Z.data[i][j] === null) Z.data[i][j] = 0;
			}
		}

		const history: {
			iteration: number;
			primalResidual: number;
			dualResidual: number;
			nuclearNorm: number;
			rank: number;
		}[] = [];

		for (let iter = 0; iter < this.maxIter; iter++) {
			const Z_old = Z.clone();

			// X-update: project onto constraint set
			// X^{k+1} = P_C(Z^k - Y^k)
			const temp1 = this.subtract(Z, Y);
			X = this.projectOntoConstraints(temp1);

			// Z-update: soft threshold singular values
			// Z^{k+1} = soft_threshold_SVD(X^{k+1} + Y^k, 1/rho)
			const temp2 = this.add(X, Y);
			Z = this.softThresholdSVD(temp2, 1.0 / this.rho);

			// Y-update: dual variable update
			// Y^{k+1} = Y^k + X^{k+1} - Z^{k+1}
			const residual = this.subtract(X, Z);
			Y = this.add(Y, residual);

			// Compute residuals for convergence check
			const primalResidual = residual.frobenius();
			const Z_diff = this.subtract(Z, Z_old);
			const dualResidual = this.rho * Z_diff.frobenius();

			history.push({
				iteration: iter + 1,
				primalResidual,
				dualResidual,
				nuclearNorm: SDPMatrixCompletion.nuclearNorm(Z),
				rank: SDPMatrixCompletion.rank(Z)
			});

			// Check convergence
			if (primalResidual < this.tolerance && dualResidual < this.tolerance) {
				return {
					completed: Z,
					iterations: iter + 1,
					finalError: primalResidual,
					history
				};
			}
		}

		// Return best result even if not fully converged
		return {
			completed: Z,
			iterations: this.maxIter,
			finalError: history[history.length - 1].primalResidual,
			history
		};
	}

	/**
	 * Compute the nuclear norm (sum of singular values) of a matrix
	 */
	static nuclearNorm(A: Matrix): number {
		const [, Sigma] = A.svd();
		let sum = 0;
		const minDim = Math.min(Sigma.data.length, Sigma.data[0].length);
		for (let i = 0; i < minDim; i++) {
			sum += Sigma.data[i][i] as number;
		}
		return sum;
	}

	/**
	 * Compute the rank of a matrix (number of non-zero singular values)
	 * @param A - Matrix to compute rank of
	 * @param tolerance - Singular values below this are considered zero (default 1e-10)
	 */
	static rank(A: Matrix, tolerance: number = 1e-6): number {
		const [, Sigma] = A.svd();
		let rank = 0;
		const minDim = Math.min(Sigma.data.length, Sigma.data[0].length);
		for (let i = 0; i < minDim; i++) {
			if (Math.abs(Sigma.data[i][i] as number) > tolerance) {
				rank++;
			}
		}
		return rank;
	}

	/**
	 * Get all singular values of a matrix in descending order
	 */
	static singularValues(A: Matrix): number[] {
		const [, Sigma] = A.svd();
		const values: number[] = [];
		const minDim = Math.min(Sigma.data.length, Sigma.data[0].length);
		for (let i = 0; i < minDim; i++) {
			values.push(Sigma.data[i][i] as number);
		}
		return values;
	}

	/**
	 * Validate the solution by checking observed entries match
	 */
	validateSolution(completed: Matrix): {
		valid: boolean;
		maxError: number;
		averageError: number;
	} {
		let maxError = 0;
		let sumError = 0;
		let count = 0;

		for (let i = 0; i < this.M.data.length; i++) {
			for (let j = 0; j < this.M.data[i].length; j++) {
				const observed = this.M.data[i][j];
				if (observed !== null) {
					const predicted = completed.data[i][j] as number;
					const error = Math.abs(observed - predicted);
					maxError = Math.max(maxError, error);
					sumError += error;
					count++;
				}
			}
		}

		return {
			valid: maxError < 1e-3,
			maxError,
			averageError: count > 0 ? sumError / count : 0
		};
	}
}
