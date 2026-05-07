const createModuleTracer = () => {
	//

	const traces: string[] = new Array(1);

	const origThen = Promise.prototype.then;

	return {
		//

		add: () => {
			(Promise.prototype.then as unknown) = function (
				this: Promise<unknown>,
				onFulfilled?: (...args: unknown[]) => unknown | unknown,
				onRejected?: (...args: unknown[]) => unknown | unknown,
			) {
				const wrapped = onFulfilled
					? (value: object & Record<string, unknown>) => {
							//

							const isModule =
								value &&
								typeof value === "object" &&
								(Object.prototype.toString.call(value) === "[object Module]" || value.__esModule);

							if (isModule) {
								// console.log("@DEBUG1112 module");
								// console.log("exports:", Object.keys(value));

								value = new Proxy(value, {
									get(target, prop, receiver) {
										// console.log("EXPORT:", String(prop));

										const result = Reflect.get(target, prop, receiver);

										const key = Object.keys(value)[0];
										const val = String(prop);

										if (typeof key === "string" && typeof prop === "string" && prop !== "then") {
											console.info(key, val, "TRACED");
											traces[0] = val;
										}

										return result;
									},
								});
							}

							return onFulfilled(value);
						}
					: onFulfilled;

				return origThen.call(this, wrapped, onRejected);
			};
		},

		traces: () => traces,

		remove: () => {
			(Promise.prototype.then as unknown) = origThen;
			traces.length = 0;
		},
	};
};

export { createModuleTracer };
