// Which of a search's ambiguous names are worth offering to the user. Kept out of the
// component, like `app/utils/status.js`, so the rule is testable without mounting anything.
//
// The backend reports every name that matched more than one catalog entry, but only some of
// those are the user's problem. `kept` is who the search actually FILTERED on:
//
// - more than one name — the resolver declined to guess, so the results belong to all of
//   them and the user is the only one who can say which they meant. Offer the list.
// - exactly one name — the surname identified somebody by itself ("Montero" is Montero
//   Cuadrado, not Vaquero Montero), so the collision never reached the user. Nothing to ask.
//
// Order is the backend's and is deliberately preserved: it puts office holders first, which
// is the likeliest of several people sharing a surname. Likelier is all it means — everybody
// in the list is a real answer, which is why none of them was dropped.

export const sharedNameOptions = (queryMeta) =>
  (queryMeta?.ambiguous || []).filter((item) => (item?.kept || []).length > 1);
