// type ChunkArrayParams = {};

type ChunkArrayType = <T extends unknown[]>(
	array: T,
	chunkSize: number,
) => T extends unknown[] ? ReadonlyArray<ReadonlyArray<T[number]>> : never;

type ChunkArrayOverloaded = {
	<const T extends unknown[]>(array: T, chunkSize: number): T extends unknown[] ? T[number][][] : never;

	<const T extends unknown[]>(array: unknown[], chunkSize: number): T[number][][];
};

const chunkArray: ChunkArrayOverloaded = (array, chunkSize) => {
	//

	if (chunkSize <= 0) throw new Error("chunkSize must be positive");

	const numChunks = Math.ceil(array.length / chunkSize);

	return Array.from({ length: numChunks }, (_, i) => array.slice(i * chunkSize, (i + 1) * chunkSize));
};

export { chunkArray };
export type { ChunkArrayType };
