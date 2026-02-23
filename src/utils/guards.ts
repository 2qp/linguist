const isNullish = (v: unknown): v is null | undefined => v == null;

const isNotNullish = <T>(v: T | null | undefined): v is T => v != null;

export { isNotNullish, isNullish };
