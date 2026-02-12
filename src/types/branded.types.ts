/**
 * uid of a `Field` type
 */
type UID = string & { readonly __brand: "UID" };

/**
 * field name of a `Language` `Object`.
 *
 * ex: `ace_mode` / `extensions`...
 *
 * ref with `UID` type
 */
type Field = string & { readonly __brand: "Field" };

export type { Field, UID };
