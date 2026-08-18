const ORCID_API = "https://pub.orcid.org/v3.0";
const CROSSREF_API = "https://api.crossref.org/works";

// Crossref fields we need. Note that `subtype` is not a valid select on this
// route — `type: "posted-content"` is the preprint signal.
const CROSSREF_SELECT = "DOI,type,title,container-title,relation,published";

// bioRxiv/medRxiv (legacy) and openRxiv (current) DOI prefixes. Only consulted
// when Crossref is unreachable; Crossref's `type` is authoritative otherwise.
const PREPRINT_DOI_PREFIXES = ["10.1101", "10.64898"];

// Crossref relations that link a preprint to its published version.
const PREPRINT_RELATIONS = [
  "is-preprint-of",
  "has-preprint",
  "is-version-of",
  "has-version",
];

// Shortest normalised title accepted for a subtitle-prefix match, so a bare tool
// name ("motifpeeker") can never collapse two unrelated papers.
const MIN_PREFIX_MATCH_LENGTH = 30;

/**
 * Lowercase, strip accents and drop everything that isn't alphanumeric, so
 * titles that differ only in case, punctuation or curly quotes compare equal.
 */
export function normaliseTitle(title) {
  return (title || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function isPreprintDoi(doi) {
  return PREPRINT_DOI_PREFIXES.some((prefix) => (doi || "").startsWith(`${prefix}/`));
}

function externalIds(summary) {
  return summary?.["external-ids"]?.["external-id"] || [];
}

function firstValue(values) {
  return values.find((value) => value != null && value !== "") ?? null;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Collapse one ORCID group into a single record.
 *
 * ORCID returns one summary per contributing source. Some sources (institutional
 * repositories in particular) map every work to type "other" and omit the journal
 * title, so take the best value across all summaries rather than trusting [0].
 */
export function flattenOrcidGroup(group) {
  const summaries = group?.["work-summary"] || [];
  if (!summaries.length) return null;

  const doi = firstValue(
    summaries.map(
      (summary) =>
        externalIds(summary).find((id) => id["external-id-type"] === "doi")?.[
          "external-id-value"
        ]
    )
  );

  // Sources sometimes truncate a subtitle; the longest title is the safest pick.
  const title =
    summaries
      .map((summary) => summary.title?.title?.value)
      .filter(Boolean)
      .sort((a, b) => b.length - a.length)[0] || "Untitled";

  const types = summaries.map((summary) => summary.type).filter(Boolean);
  const type =
    firstValue(types.filter((value) => value !== "other")) ??
    firstValue(types);

  const journal = firstValue(
    summaries.map((summary) => summary["journal-title"]?.value)
  );

  let url = doi ? `https://doi.org/${doi}` : null;
  if (!url) {
    url = firstValue(
      summaries.flatMap((summary) =>
        externalIds(summary).map((id) => id["external-id-url"]?.value)
      )
    );
  }

  return {
    title,
    doi,
    journal,
    url,
    year: toNumber(
      firstValue(summaries.map((s) => s["publication-date"]?.year?.value))
    ),
    month: toNumber(
      firstValue(summaries.map((s) => s["publication-date"]?.month?.value))
    ),
    isPreprint: type === "preprint" || isPreprintDoi(doi),
    relatedDois: [],
  };
}

/**
 * Look up every DOI in a single bulk Crossref request.
 * Returns a Map keyed by lowercased DOI.
 */
export async function fetchCrossrefMetadata(dois, { mailto } = {}) {
  if (!dois.length) return new Map();

  const params = new URLSearchParams({
    filter: dois.map((doi) => `doi:${doi}`).join(","),
    select: CROSSREF_SELECT,
    rows: String(dois.length),
  });
  // Crossref's polite pool; `fetch` can't set a User-Agent from the browser.
  if (mailto) params.set("mailto", mailto);

  const response = await fetch(`${CROSSREF_API}?${params}`);
  if (!response.ok) throw new Error("Crossref lookup failed");

  const items = (await response.json())?.message?.items || [];
  return new Map(items.map((item) => [item.DOI.toLowerCase(), item]));
}

/** Overlay authoritative Crossref metadata onto the ORCID records. */
export function enrichWithCrossref(records, crossrefByDoi) {
  return records.map((record) => {
    const item = record.doi && crossrefByDoi.get(record.doi.toLowerCase());
    if (!item) return record;

    const relatedDois = PREPRINT_RELATIONS.flatMap((key) =>
      (item.relation?.[key] || [])
        .filter((entry) => entry["id-type"] === "doi")
        .map((entry) => entry.id)
    );

    return {
      ...record,
      // Crossref carries the canonical (untruncated) title and the venue that
      // ORCID leaves null whenever no publisher-sourced summary exists.
      title: item.title?.[0] || record.title,
      journal: item["container-title"]?.[0] || record.journal,
      isPreprint: item.type === "posted-content" || record.isPreprint,
      relatedDois,
    };
  });
}

function titlesMatch(a, b) {
  const left = normaliseTitle(a.title);
  const right = normaliseTitle(b.title);
  if (!left || !right) return false;
  if (left === right) return true;

  // A journal may add or drop a subtitle ("<title>: towards ..."). Only merge on
  // a prefix when exactly one side is a preprint, and only for titles long enough
  // that the shared prefix can't be a coincidence.
  if (a.isPreprint === b.isPreprint) return false;
  const [shorter, longer] =
    left.length <= right.length ? [left, right] : [right, left];
  return (
    shorter.length >= MIN_PREFIX_MATCH_LENGTH && longer.startsWith(shorter)
  );
}

function compareDateDesc(a, b) {
  return (b.year || 0) - (a.year || 0) || (b.month || 0) - (a.month || 0);
}

/**
 * Collapse preprints into their published versions.
 *
 * ORCID groups by shared external ID, but a preprint and its journal article
 * carry different DOIs and so arrive as separate groups. Link them by Crossref
 * relation first, then fall back to title matching for the pairs publishers
 * never deposited a relation for.
 */
export function dedupePublications(records) {
  const parent = records.map((_, index) => index);

  const find = (index) => {
    let root = index;
    while (parent[root] !== root) root = parent[root];
    while (parent[index] !== root) [parent[index], index] = [root, parent[index]];
    return root;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootA] = rootB;
  };

  const indexByDoi = new Map();
  records.forEach((record, index) => {
    if (record.doi) indexByDoi.set(record.doi.toLowerCase(), index);
  });

  records.forEach((record, index) => {
    record.relatedDois.forEach((doi) => {
      const related = indexByDoi.get(doi.toLowerCase());
      if (related != null) union(index, related);
    });
  });

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      if (titlesMatch(records[i], records[j])) union(i, j);
    }
  }

  const groups = new Map();
  records.forEach((record, index) => {
    const root = find(index);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(record);
  });

  // The published version always wins over a preprint of the same paper.
  return [...groups.values()].map(
    (group) =>
      group.slice().sort((a, b) => {
        if (a.isPreprint !== b.isPreprint) return a.isPreprint ? 1 : -1;
        return compareDateDesc(a, b);
      })[0]
  );
}

/**
 * Fetch, deduplicate and sort the owner's publications.
 *
 * Crossref only ever refines what ORCID already gave us, so a failed lookup
 * degrades to ORCID data plus the DOI-prefix preprint heuristic.
 */
export async function fetchPublications({ orcidId, mailto, limit = 5 }) {
  const response = await fetch(`${ORCID_API}/${orcidId}/works`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch publications");

  const data = await response.json();
  let records = (data.group || []).map(flattenOrcidGroup).filter(Boolean);

  try {
    const crossrefByDoi = await fetchCrossrefMetadata(
      records.map((record) => record.doi).filter(Boolean),
      { mailto }
    );
    records = enrichWithCrossref(records, crossrefByDoi);
  } catch {
    // Keep the ORCID-only records rather than failing the whole section.
  }

  return dedupePublications(records)
    .map((record) => ({
      ...record,
      journal: record.journal || (record.isPreprint ? "Preprint" : null),
    }))
    .sort(compareDateDesc)
    .slice(0, limit);
}
