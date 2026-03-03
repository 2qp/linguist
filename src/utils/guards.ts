const isNullish = (v: unknown): v is null | undefined => v == null;

const isNotNullish = <T>(v: T | null | undefined): v is T => v != null;

const isEmpty = (obj: object) => Object.keys(obj).length === 0;

export { isEmpty, isNotNullish, isNullish };
