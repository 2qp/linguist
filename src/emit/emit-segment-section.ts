const emitSegmentSection = (segments: string[]): string => {
	const uniqueSorted = [...new Set(segments)].sort();
	return ["// Segment definitions for large types", ...uniqueSorted, "\n"].join("\n");
};

export { emitSegmentSection };
