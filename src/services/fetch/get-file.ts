type Parser = "json" | "text" | "blob" | "arrayBuffer";

const getFile = async <T>(url: string, parser: Parser = "json"): Promise<T> => {
	const response = await fetch(url);

	if (!response.ok) {
		throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
	}

	switch (parser) {
		case "json":
			return (await response.json()) as T;
		case "text":
			return (await response.text()) as T;
		case "blob":
			return (await response.blob()) as T;
		case "arrayBuffer":
			return (await response.arrayBuffer()) as T;
		default:
			throw new Error(`Unsupported parser type: ${parser}`);
	}
};

export { getFile };
