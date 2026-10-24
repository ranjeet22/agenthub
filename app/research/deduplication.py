import re
import unicodedata
from urllib.parse import unquote, urlparse


def normalize_doi(value):
    if not value:
        return None

    value = str(value).strip().lower()
    value = re.sub(r"^https?://(?:dx\.)?doi\.org/", "", value)
    value = re.sub(r"^doi:\s*", "", value)
    value = unquote(value).strip().rstrip(".,;)")
    return value or None


def normalize_arxiv_id(paper):
    candidates = [
        paper.get("arxiv_id"),
        paper.get("url"),
    ]

    for candidate in candidates:
        if not candidate:
            continue

        value = str(candidate).strip()

        match = re.search(
            r"(?:arxiv(?:\.org)?/abs/|arxiv:)"
            r"([a-z\-]+(?:\.[A-Z]{2})?/\d{7}|\d{4}\.\d{4,5})"
            r"(?:v\d+)?",
            value,
            flags=re.IGNORECASE,
        )

        if match:
            return match.group(1).lower()

    return None


def normalize_title(title):
    if not title:
        return ""

    value = unicodedata.normalize("NFKC", str(title)).casefold()
    value = re.sub(r"[^\w\s]", " ", value)
    return " ".join(value.split())


def _name_identity(name):
    """Return a conservative (surname, given-name initials) identity."""
    if not name:
        return None

    value = unicodedata.normalize("NFKC", str(name)).casefold()
    value = re.sub(r"[^a-z0-9\s-]", " ", value)
    tokens = [token for token in re.split(r"[\s-]+", value) if token]

    if not tokens:
        return None

    surname = tokens[-1]
    given_tokens = tokens[:-1]
    initials = "".join(token[0] for token in given_tokens)

    return surname, initials


def _authors_compatible(first, second):
    authors_a = first.get("authors") or []
    authors_b = second.get("authors") or []

    if not authors_a or not authors_b:
        # Missing author metadata is insufficient evidence by itself.
        return False

    identity_a = _name_identity(authors_a[0])
    identity_b = _name_identity(authors_b[0])

    if not identity_a or not identity_b:
        return False

    surname_a, initials_a = identity_a
    surname_b, initials_b = identity_b

    if surname_a != surname_b:
        return False

    # "S. G. Djorgovski" and "Stanislav George Djorgovski"
    # both normalize to surname "djorgovski", initials "sg".
    # If one source has fewer initials, only compare the initials
    # it actually supplies.
    if initials_a and initials_b:
        shorter, longer = sorted(
            (initials_a, initials_b), key=len
        )
        return longer.startswith(shorter)

    # Same surname, but insufficient given-name information.
    return False


def _years_compatible(first, second):
    year_a = first.get("year")
    year_b = second.get("year")

    if not year_a or not year_b:
        return True

    try:
        return abs(int(str(year_a)[:4]) - int(str(year_b)[:4])) <= 1
    except (TypeError, ValueError):
        return True


def papers_match(first, second):
    doi_a = normalize_doi(first.get("doi"))
    doi_b = normalize_doi(second.get("doi"))

    if doi_a and doi_b and doi_a == doi_b:
        return True

    arxiv_a = normalize_arxiv_id(first)
    arxiv_b = normalize_arxiv_id(second)

    if arxiv_a and arxiv_b and arxiv_a == arxiv_b:
        return True

    title_a = normalize_title(first.get("title"))
    title_b = normalize_title(second.get("title"))

    if not title_a or title_a != title_b:
        return False

    return (
        _authors_compatible(first, second)
        and _years_compatible(first, second)
    )


def _unique(values):
    output = []
    seen = set()

    for value in values:
        if value and value not in seen:
            seen.add(value)
            output.append(value)

    return output


def merge_papers(first, second):
    merged = dict(first)

    # Keep useful values from both records without replacing populated
    # fields with empty or missing values.
    for key, value in second.items():
        if value is None or value == "" or value == []:
            continue

        existing = merged.get(key)

        if existing is None or existing == "" or existing == []:
            merged[key] = value

    abstract_a = first.get("abstract") or ""
    abstract_b = second.get("abstract") or ""
    merged["abstract"] = (
        abstract_a if len(abstract_a) >= len(abstract_b) else abstract_b
    )

    merged["authors"] = first.get("authors") or second.get("authors") or []

    merged["categories"] = _unique(
        (first.get("categories") or [])
        + (second.get("categories") or [])
    )

    sources_a = first.get("sources") or [first.get("source")]
    sources_b = second.get("sources") or [second.get("source")]
    merged["sources"] = _unique(sources_a + sources_b)

    urls_a = first.get("source_urls") or [first.get("url")]
    urls_b = second.get("source_urls") or [second.get("url")]
    merged["source_urls"] = _unique(urls_a + urls_b)

    doi = normalize_doi(first.get("doi")) or normalize_doi(second.get("doi"))
    if doi:
        merged["doi"] = doi
        merged["url"] = f"https://doi.org/{doi}"

    return merged


def deduplicate_papers(papers):
    unique_papers = []

    for original in papers:
        paper = dict(original)
        matched_index = next(
            (
                index
                for index, existing in enumerate(unique_papers)
                if papers_match(existing, paper)
            ),
            None,
        )

        if matched_index is None:
            paper["sources"] = _unique(
                paper.get("sources") or [paper.get("source")]
            )
            paper["source_urls"] = _unique(
                paper.get("source_urls") or [paper.get("url")]
            )
            unique_papers.append(paper)
        else:
            unique_papers[matched_index] = merge_papers(
                unique_papers[matched_index], paper
            )

    return unique_papers