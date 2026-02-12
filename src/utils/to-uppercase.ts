const toUpperCase = <const T extends string>(value: T): Uppercase<T> => {
	return value.toUpperCase() as Uppercase<T>;
};

export { toUpperCase };
