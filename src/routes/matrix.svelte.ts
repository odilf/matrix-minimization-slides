import { EigenvalueDecomposition, Matrix as MLMatrix, solve } from 'ml-matrix';
import { SingularValueDecomposition } from 'ml-matrix';

export class Matrix {
	data: (number | null)[][];

	constructor(data: (number | null)[][]) {
		this.data = $state(data);
	}

	static fromFn(
		rows: number,
		columns: number,
		fn: (i: number, j: number) => number | null
	): Matrix {
		return new Matrix(
			Array.from({ length: rows }).map((_, i) =>
				Array.from({ length: columns }).map((_, j) => fn(i, j))
			)
		);
	}

	static empty(rows: number, columns: number): Matrix {
		return Matrix.fromFn(rows, columns, () => null);
	}

	static identity(size: number): Matrix {
		return Matrix.fromFn(size, size, (i, j) => (i === j ? 1 : 0));
	}

	map(f: (x: number | null) => number | null): Matrix {
		return new Matrix(this.data.map((row) => row.map(f)));
	}

	tex(
		nullSymbol?: string,
		elemMap: (elem: number | null) => string | null = (x) => x?.toString() ?? null
	): string {
		return `\\begin{bmatrix} ${this.data.map((row) => row.map((elem) => elemMap(elem) ?? nullSymbol ?? '').join(' & ')).join(' \\\\ ')} \\end{bmatrix}`;
	}

	toString(): string {
		return this.data.map((row) => row.join(', ')).join('\n');
	}

	get(i: number, j: number) {
		if (this.data.length <= i) {
			return null;
		}

		if (this.data[i].length <= j) {
			return null;
		}

		return this.data[i][j];
	}

	shape() {
		return [this.data.length, this.data[0].length];
	}

	/**
	 * Convert to ml-matrix, replacing nulls with a default value
	 */
	private _toMLMatrix(defaultValue: number = 0): MLMatrix {
		if (this.data.some((row) => row.some((elem) => elem === null))) {
			console.warn('Replacing nulls with 0 when converting to MLMatrix');
		}

		const data = $state.snapshot(this.data);
		return new MLMatrix(data.map((row) => row.map((v) => (v === null ? defaultValue : v))));
	}

	/**
	 * Matrix multiplication: this * b
	 * Returns a new matrix that is the product of this matrix and b
	 */
	mul(b: Matrix): Matrix {
		const aRows = this.data.length;
		const aCols = this.data[0]?.length ?? 0;
		const bRows = b.data.length;
		const bCols = b.data[0]?.length ?? 0;

		// Check dimension compatibility
		if (aCols !== bRows) {
			throw new Error(
				`Matrix dimensions incompatible for multiplication: (${aRows}x${aCols}) * (${bRows}x${bCols})`
			);
		}

		// Check for nulls
		const hasNulls =
			this.data.some((row) => row.some((v) => v === null)) ||
			b.data.some((row) => row.some((v) => v === null));

		if (hasNulls) {
			// Manual multiplication to preserve null handling
			return Matrix.fromFn(aRows, bCols, (i, j) => {
				let sum = 0;
				for (let k = 0; k < aCols; k++) {
					const aVal = this.data[i][k];
					const bVal = b.data[k][j];

					if (aVal === null || bVal === null) {
						return null;
					}

					sum += aVal * bVal;
				}
				return sum;
			});
		}

		// Use ml-matrix for faster computation
		const mlA = this._toMLMatrix();
		const mlB = b._toMLMatrix();
		const result = mlA.mmul(mlB);

		return new Matrix(result.to2DArray());
	}

	/**
	 * Returns the transpose of this matrix
	 */
	transpose(): Matrix {
		const rows = this.data.length;
		const cols = this.data[0]?.length ?? 0;

		return Matrix.fromFn(cols, rows, (i, j) => this.data[j][i]);
	}

	/**
	 * Computes the Frobenius norm of the matrix
	 * Returns the square root of the sum of squares of all elements
	 */
	frobenius(): number {
		let sumOfSquares = 0;

		for (let i = 0; i < this.data.length; i++) {
			for (let j = 0; j < this.data[i].length; j++) {
				const val = this.data[i][j];
				if (val !== null) {
					sumOfSquares += val * val;
				}
			}
		}

		return Math.sqrt(sumOfSquares);
	}

	/**
	 * Singular Value Decomposition
	 * Returns [U, Sigma, V] where this = U * Sigma * V^T
	 */
	svd(): [Matrix, Matrix, Matrix] {
		const m = this.data.length;
		const n = this.data[0]?.length ?? 0;

		// Check for null values
		for (let i = 0; i < m; i++) {
			for (let j = 0; j < n; j++) {
				if (this.data[i][j] === null) {
					throw new Error('SVD cannot be computed on matrices with null values');
				}
			}
		}

		// Use ml-matrix SVD
		const mlMatrix = this._toMLMatrix();
		const svd = new SingularValueDecomposition(mlMatrix, { autoTranspose: true });

		// Get U, S (singular values), V
		const U = new Matrix(svd.leftSingularVectors.to2DArray());
		const Sigma = new Matrix(svd.diagonalMatrix.to2DArray());
		const V = new Matrix(svd.rightSingularVectors.to2DArray());

		return [U, Sigma, V];
	}

	/**
	 * Computes eigenvalues and eigenvectors using ml-matrix
	 * Returns eigenvalues and eigenvectors (as column vectors in 2D array)
	 */
	eigenDecomposition(): {
		eigenvalues: number[];
		eigenvectors: number[][];
	} {
		const mlMatrix = this._toMLMatrix();
		const evd = new EigenvalueDecomposition(mlMatrix);

		return {
			eigenvalues: evd.realEigenvalues,
			eigenvectors: evd.eigenvectorMatrix.to2DArray()
		};
	}

	/**
	 * Get indices of all non-null (observed) entries
	 * Returns array of [row, col] pairs
	 */
	getObservedIndices(): [number, number][] {
		const indices: [number, number][] = [];
		for (let i = 0; i < this.data.length; i++) {
			for (let j = 0; j < this.data[i].length; j++) {
				if (this.data[i][j] !== null) {
					indices.push([i, j]);
				}
			}
		}
		return indices;
	}

	/**
	 * Get indices of all null (missing) entries
	 * Returns array of [row, col] pairs
	 */
	getMissingIndices(): [number, number][] {
		const indices: [number, number][] = [];
		for (let i = 0; i < this.data.length; i++) {
			for (let j = 0; j < this.data[i].length; j++) {
				if (this.data[i][j] === null) {
					indices.push([i, j]);
				}
			}
		}
		return indices;
	}

	/**
	 * Extract a specific row as a column vector (mx1 matrix)
	 */
	getRow(i: number): Matrix {
		if (i >= this.data.length) {
			throw new Error(`Row index ${i} out of bounds`);
		}
		return new Matrix([this.data[i]]).transpose();
	}

	/**
	 * Extract a specific column as a column vector (mx1 matrix)
	 */
	getColumn(j: number): Matrix {
		const m = this.data.length;
		return Matrix.fromFn(m, 1, (i) => this.data[i][j]);
	}

	/**
	 * Set a specific row from a column vector
	 */
	setRow(i: number, values: Matrix): void {
		if (i >= this.data.length) {
			throw new Error(`Row index ${i} out of bounds`);
		}
		if (values.data[0].length !== 1) {
			throw new Error('Values must be a column vector');
		}
		for (let j = 0; j < this.data[i].length; j++) {
			this.data[i][j] = values.data[j][0];
		}
	}

	/**
	 * Set a specific column from a column vector
	 */
	setColumn(j: number, values: Matrix): void {
		if (values.data[0].length !== 1) {
			throw new Error('Values must be a column vector');
		}
		if (values.data.length !== this.data.length) {
			throw new Error(
				`Column vector length ${values.data.length} does not match matrix rows ${this.data.length}`
			);
		}
		for (let i = 0; i < this.data.length; i++) {
			this.data[i][j] = values.data[i][0];
		}
	}

	/**
	 * Solve least squares: find x that minimizes ||Ax - b||^2
	 * Uses normal equations with regularization: x = (A^T A + λI)^-1 A^T b
	 * Only considers rows where b has non-null values
	 */
	solveLeastSquares(b: Matrix, observedRows?: number[]): Matrix {
		// If observedRows is provided, extract only those rows
		let A = this.clone();
		let b_filtered = b;

		if (observedRows && observedRows.length > 0) {
			A = Matrix.fromFn(
				observedRows.length,
				this.data[0].length,
				(i, j) => this.data[observedRows[i]][j]
			);
			b_filtered = Matrix.fromFn(observedRows.length, 1, (i) => b.data[observedRows[i]][0]);
		}

		// Compute A^T A
		const At = A.transpose();
		const AtA = At.mul(A);

		// Add regularization: AtA + λI (helps with numerical stability)
		const lambda = 1e-4;
		const n = AtA.data.length;
		for (let i = 0; i < n; i++) {
			AtA.data[i][i] = (AtA.data[i][i] as number) + lambda;
		}

		// Compute A^T b
		const Atb = At.mul(b_filtered);

		// Use ml-matrix solve for better numerical stability
		try {
			const mlAtA = AtA._toMLMatrix();
			const mlAtb = Atb._toMLMatrix();
			const solution = solve(mlAtA, mlAtb);
			return new Matrix(solution.to2DArray());
		} catch (e) {
			console.warn('Solve failed, returning small random vector:', e);
			return Matrix.fromFn(n, 1, () => 0.1 * Math.random());
		}
	}

	/**
	 * Update a single row using least squares given fixed columns (V matrix)
	 * This is one step of ALS for updating the U matrix
	 */
	updateRowALS(rowIndex: number, V: Matrix): Matrix {
		// Find which columns are observed in this row
		const observedCols: number[] = [];
		for (let j = 0; j < this.data[rowIndex].length; j++) {
			if (this.data[rowIndex][j] !== null) {
				observedCols.push(j);
			}
		}

		const k = V.data[0].length; // rank

		if (observedCols.length === 0) {
			// No observations, return small random vector to avoid all zeros
			return Matrix.fromFn(k, 1, () => 0.01 * Math.random());
		}

		if (observedCols.length < k) {
			// Underdetermined system - use small random initialization
			return Matrix.fromFn(k, 1, () => 0.1 * Math.random());
		}

		// Extract observed values
		const b = Matrix.fromFn(observedCols.length, 1, (i) => this.data[rowIndex][observedCols[i]]);

		// Extract corresponding rows from V (V is n×k, so V[j] is the features for column j)
		const V_observed = Matrix.fromFn(observedCols.length, k, (i, j) => V.data[observedCols[i]][j]);

		// Solve V_observed * u = b for u
		return V_observed.solveLeastSquares(b);
	}

	/**
	 * Update a single column using least squares given fixed rows (U matrix)
	 * This is one step of ALS for updating the V matrix
	 * Returns a column vector (rank×1) representing the features for column colIndex
	 * Note: This should be set as V's row, since V is n×rank where V[j] = features for column j
	 */
	updateColumnALS(colIndex: number, U: Matrix): Matrix {
		// Find which rows are observed in this column
		const observedRows: number[] = [];
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i][colIndex] !== null) {
				observedRows.push(i);
			}
		}

		const k = U.data[0].length; // rank

		if (observedRows.length === 0) {
			// No observations, return small random vector to avoid all zeros
			return Matrix.fromFn(k, 1, () => 0.01 * Math.random());
		}

		if (observedRows.length < k) {
			// Underdetermined system - use small random initialization
			return Matrix.fromFn(k, 1, () => 0.1 * Math.random());
		}

		// Extract observed values
		const b = Matrix.fromFn(observedRows.length, 1, (i) => this.data[observedRows[i]][colIndex]);

		// Extract corresponding rows from U
		const U_observed = Matrix.fromFn(observedRows.length, k, (i, j) => U.data[observedRows[i]][j]);

		// Solve U_observed * v = b for v
		return U_observed.solveLeastSquares(b);
	}

	/**
	 * Compute reconstruction error (RMSE) on observed entries
	 * Compares this matrix with reconstruction U * V^T
	 */
	reconstructionError(U: Matrix, V: Matrix): number {
		const reconstruction = U.mul(V.transpose());
		let sumSquaredError = 0;
		let count = 0;

		for (let i = 0; i < this.data.length; i++) {
			for (let j = 0; j < this.data[i].length; j++) {
				if (this.data[i][j] !== null) {
					const error = (this.data[i][j] as number) - (reconstruction.data[i][j] as number);
					sumSquaredError += error * error;
					count++;
				}
			}
		}

		return count > 0 ? Math.sqrt(sumSquaredError / count) : 0;
	}

	/**
	 * Create a copy of this matrix
	 */
	clone(): Matrix {
		return new Matrix(this.data.map((row) => [...row]));
	}

	/**
	 * Validate if this matrix is suitable for ALS with given rank
	 * Returns warnings about rows/columns with too few observations
	 */
	validateForALS(rank: number): { valid: boolean; warnings: string[] } {
		const warnings: string[] = [];
		const m = this.data.length;
		const n = this.data[0]?.length ?? 0;

		// Check each row
		for (let i = 0; i < m; i++) {
			let count = 0;
			for (let j = 0; j < n; j++) {
				if (this.data[i][j] !== null) count++;
			}
			if (count === 0) {
				warnings.push(`Row ${i} has no observed values`);
			} else if (count < rank) {
				warnings.push(`Row ${i} has only ${count} observations (less than rank ${rank})`);
			}
		}

		// Check each column
		for (let j = 0; j < n; j++) {
			let count = 0;
			for (let i = 0; i < m; i++) {
				if (this.data[i][j] !== null) count++;
			}
			if (count === 0) {
				warnings.push(`Column ${j} has no observed values`);
			} else if (count < rank) {
				warnings.push(`Column ${j} has only ${count} observations (less than rank ${rank})`);
			}
		}

		const totalObserved = this.getObservedIndices().length;
		const minRequired = (m + n) * rank;
		if (totalObserved < minRequired) {
			warnings.push(
				`Total observations (${totalObserved}) may be too few for m=${m}, n=${n}, rank=${rank}`
			);
		}

		return {
			valid: warnings.length === 0,
			warnings
		};
	}

	/**
	 * Fill in missing values with predictions from U * V^T
	 * Returns a new matrix with nulls replaced by predictions
	 */
	fillWithPredictions(U: Matrix, V: Matrix): Matrix {
		const reconstruction = U.mul(V.transpose());
		return Matrix.fromFn(this.data.length, this.data[0].length, (i, j) => {
			if (this.data[i][j] !== null) {
				return this.data[i][j];
			} else {
				return reconstruction.data[i][j];
			}
		});
	}
}
