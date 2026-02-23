declare const __brand: unique symbol;

type Brand<T, B> = T & { readonly [__brand]: B };

/**
 * uid of a `Field` type
 */
type UID = Brand<string, "UID">;

/**
 * field name of a `Language` `Object`.
 *
 * ex: `ace_mode` / `extensions`...
 *
 * ref with `UID` type
 */
type Field = Brand<string, "Field">;

export type { Field, UID };
