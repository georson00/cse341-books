# Books API Week 02 Spec - Version 1

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books. Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, custom id such as `b1`
- `authorId`: string, required, references the `id` field of an author document
- `title`: string, required
- `publicationDate`: string, required

Books will continue to use custom string ids instead of MongoDB `_id` values for route parameters.

### Relationship to Authors
Each book will identify its author with an `authorId` field. The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API should reject the request with a `400` status code if the submitted `authorId` does not match an existing author.

### Routes

#### GET /books
Purpose: Return all books.

Success:
- Status code: `200`
- Response body: an array of book objects

Errors:
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

    {
      "id": "b4",
      "authorId": "a1",
      "title": "Example Book Title",
      "publicationDate": "2026-01-15"
    }

Success:
- Status code: `201`
- Response body: the newly created book object

Errors:
- `400` if a required field is missing
- `400` if the `id` already exists
- `400` if the `authorId` does not match an existing author
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

    {
      "authorId": "a2",
      "title": "Updated Book Title",
      "publicationDate": "2026-02-20"
    }

Success:
- Status code: `200`
- Response body: the updated book object

Errors:
- `400` if a required field is missing
- `400` if the `authorId` does not match an existing author
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Swagger Documentation
Swagger must document every book route.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application. The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

## Feature 2: Author CRUD Operations

TODO: Follow the example above to complete a spec for the authors feature.

## ----------------------------------------------------------------------------------------------------------------------------------------------


## VERSION 2
# Books API Week 02 Spec — Version 2

This document is the implementation contract and acceptance checklist. Unchecked boxes describe required work, not completed implementation.

## 1. Goal and scope

- [ ] Extend the Week 01 Express/MongoDB API with complete CRUD operations for books and authors.
- [ ] Use custom string IDs in routes and relationships; MongoDB `_id` remains internal.
- [ ] Document and test all ten operations through Swagger at `/api-docs`, locally and on Render.

Scope decisions for this version:

- One book has exactly one author. One author may have zero or more books.
- Authors use a minimal model: `id` and `name`. This is a Version 2 design choice because Version 1 did not define author fields.
- IDs are supplied by the client, unique within their collection, and immutable.
- PUT requires every editable field. PATCH, upsert, bulk operations, search, pagination, embedded author details, and authentication are outside this version.
- All routes are intentionally public for this course demonstration, including writes. Use disposable demonstration data, not private or production data. Authentication and authorization are required before using this design for a protected application.
- List endpoints return all records for a small course dataset. This is an explicit scale limitation; do not silently truncate results.
- Concurrent edits use last-write-wins behavior. Strict cross-collection integrity under concurrent writes is outside this version; see section 5.

## 2. Data models and validation

### Book — collection: `books`

| Field | Required | Rules |
| --- | --- | --- |
| `id` | POST only | String matching `^b[1-9][0-9]{0,8}$`; examples: `b1`, `b42`; immutable |
| `authorId` | POST and PUT | String matching `^a[1-9][0-9]{0,8}$`; must identify an existing author |
| `title` | POST and PUT | String; trim outer whitespace; 1–200 characters after trimming |
| `publicationDate` | POST and PUT | String; exactly `YYYY-MM-DD`; a real Gregorian calendar date with year 0001–9999 |

Future publication dates are allowed. Dates are date-only values: do not convert them into timestamps or shift them by timezone. A format check alone is insufficient: reject dates such as `2026-02-30`.

Example book response:

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

### Author — collection: `authors`

| Field | Required | Rules |
| --- | --- | --- |
| `id` | POST only | String matching `^a[1-9][0-9]{0,8}$`; immutable |
| `name` | POST and PUT | String; trim outer whitespace; 1–150 characters after trimming |

Author names need not be unique. Accept Unicode names and titles, including accented characters and punctuation. For the stated length limits, use JavaScript string `.length` consistently.

Example author response:

```json
{
  "id": "a1",
  "name": "Example Author"
}
```

### Shared validation checklist

- [ ] Require POST/PUT bodies to be JSON objects, not arrays, null, strings, or numbers.
- [ ] Reject missing fields, nulls, wrong types, and empty or whitespace-only names/titles with `400`.
- [ ] Do not coerce numbers, booleans, arrays, or objects into strings.
- [ ] Trim names/titles before length validation and storage. Do not trim or normalize IDs or dates; reject values that do not match the exact rules.
- [ ] Reject unknown body fields with `400`, including `_id`, legacy `author`, and `id` on PUT—even if the submitted ID matches the route.
- [ ] Validate route IDs against the corresponding book/author pattern. Invalid syntax returns `400`; a valid but absent ID returns `404`.
- [ ] GET and DELETE ignore request bodies. Query parameters are not supported and return `400` when supplied to any of these ten operations.
- [ ] Return only the public fields shown above; never return MongoDB `_id` or internal metadata.

## 3. Book routes

| Operation | Request | Success | Route-specific errors |
| --- | --- | --- | --- |
| `GET /books` | No body | `200`; array sorted by `id` ascending using MongoDB simple binary collation; `[]` if empty | Shared errors only |
| `GET /books/:id` | Valid book route ID | `200`; one book object | `404 BOOK_NOT_FOUND` |
| `POST /books` | All four book fields | `201`; created book; `Location: /books/{id}` | `409 BOOK_ID_EXISTS`; `400 AUTHOR_NOT_FOUND` |
| `PUT /books/:id` | `authorId`, `title`, `publicationDate` | `200`; complete updated book, preserving route ID | `404 BOOK_NOT_FOUND`; `400 AUTHOR_NOT_FOUND` |
| `DELETE /books/:id` | Valid book route ID | `204`; no body | `404 BOOK_NOT_FOUND` |

Simple string ordering places `b10` before `b2`; numeric ordering is not required.

POST example:

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

PUT example:

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

- [ ] PUT replaces the complete editable representation; omitted editable fields return `400`.
- [ ] PUT never creates a missing book; disable upsert.
- [ ] PUT with values identical to the stored values returns `200`, not `404`. Determine existence from a match, not whether a value changed.
- [ ] A successful DELETE removes only the book, never its author.
- [ ] Deleting the same book again returns `404`.

## 4. Author routes

| Operation | Request | Success | Route-specific errors |
| --- | --- | --- | --- |
| `GET /authors` | No body | `200`; array sorted by `id` ascending using simple binary collation; `[]` if empty | Shared errors only |
| `GET /authors/:id` | Valid author route ID | `200`; one author object | `404 AUTHOR_NOT_FOUND` |
| `POST /authors` | `id`, `name` | `201`; created author; `Location: /authors/{id}` | `409 AUTHOR_ID_EXISTS` |
| `PUT /authors/:id` | `name` only | `200`; updated author, preserving route ID | `404 AUTHOR_NOT_FOUND` |
| `DELETE /authors/:id` | Valid author route ID | `204`; no body | `404 AUTHOR_NOT_FOUND`; `409 AUTHOR_IN_USE` |

POST example:

```json
{"id": "a1", "name": "Example Author"}
```

PUT example:

```json
{"name": "Updated Author Name"}
```

- [ ] Author PUT requires `name`, rejects all other fields, never upserts, and returns `200` for unchanged values.
- [ ] Author responses do not embed books or a book count.
- [ ] Updating an author name does not rewrite books; their `authorId` remains valid.
- [ ] Reject author deletion if any book references the author. Do not cascade-delete books.
- [ ] Allow deletion after all referencing books are deleted or reassigned to another existing author.

## 5. Relationships and database behavior

- [ ] Create a unique index on `books.id` and a unique index on `authors.id` before accepting requests.
- [ ] Create a nonunique index on `books.authorId` for author usage checks.
- [ ] Clean up duplicate or invalid legacy documents before creating unique indexes. If required indexes cannot be created, fail startup rather than start with weaker guarantees.
- [ ] Query by custom string `id`, never by MongoDB ObjectId conversion.
- [ ] Check author existence before every book create/update.
- [ ] Check for at least one referencing book before author deletion; do not load all related books just to establish existence.
- [ ] Map duplicate-key errors for the custom ID unique indexes to the corresponding `409` response, including concurrent duplicate inserts.
- [ ] Construct database filters and update operators from validated, explicitly allowed fields. Never pass an arbitrary client object as a filter or update document.
- [ ] Complete database writes before reporting success. Do not modify data on a rejected request.
- [ ] Use one shared MongoDB client/connection pool rather than opening a new connection per request.

Concurrency limitation: an application-level author check and a later write are separate operations. A concurrent author deletion and book creation/reassignment can still produce a dangling reference. Version 2 acceptance tests cover sequential operations only; do not claim strict referential integrity. A production revision must coordinate these competing writes with an appropriate concurrency-control design.

## 6. Shared response and error contract

- [ ] All responses with bodies use `Content-Type: application/json`.
- [ ] Successful GET/POST/PUT responses return the resource or array directly, without a `data` wrapper.
- [ ] A `204` response sends no body, including no JSON message.
- [ ] All errors use this structure; `details` is always an array and may be empty:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request contains invalid fields.",
    "details": [
      {"field": "title", "message": "title must be a nonempty string of at most 200 characters."}
    ]
  }
}
```

Clients may depend on status codes, error codes, and the error structure. Human-readable message wording is not a stable identifier. Use `body`, `query`, or `id` as the detail field for object-level, query, or route validation failures.

| Status | Error code | Meaning |
| --- | --- | --- |
| `400` | `INVALID_JSON` | Body cannot be parsed as JSON |
| `400` | `VALIDATION_ERROR` | Invalid shape, field, date, ID, or unsupported query parameter |
| `400` | `AUTHOR_NOT_FOUND` | Well-formed submitted `authorId` identifies no author; details identifies `authorId` |
| `404` | `BOOK_NOT_FOUND` | Target book does not exist |
| `404` | `AUTHOR_NOT_FOUND` | Target author does not exist |
| `404` | `ROUTE_NOT_FOUND` | No API route matches the path |
| `409` | `BOOK_ID_EXISTS` | Submitted book ID already exists |
| `409` | `AUTHOR_ID_EXISTS` | Submitted author ID already exists |
| `409` | `AUTHOR_IN_USE` | Author is referenced by at least one book |
| `413` | `PAYLOAD_TOO_LARGE` | POST/PUT body exceeds 16 KiB |
| `415` | `UNSUPPORTED_MEDIA_TYPE` | POST/PUT does not use `application/json` |
| `500` | `INTERNAL_SERVER_ERROR` | Unexpected application or database failure |

Allow `application/json` with a charset parameter. An empty application/json POST/PUT body returns `400 VALIDATION_ERROR`.

### Check order when several errors apply

1. For POST/PUT, enforce media type, then body size/parsing. Parser-level failures stop processing.
2. Validate route ID, unsupported query parameters, body shape, and fields. Stop on validation errors; at least one useful detail is required.
3. For PUT/DELETE, check target existence; missing target returns `404` before relationship checks.
4. For POST, check duplicate ID before checking author existence; duplicate ID returns `409`.
5. Check the submitted author reference or author deletion restriction.
6. Perform the write; handle duplicate-key conflicts and unexpected failures.

Only the ten listed operations are required; custom `405` handling is outside scope. Shared middleware must normalize parser errors into this error format.

## 7. Security and configuration

- [ ] Apply the 16 KiB body limit to POST/PUT requests.
- [ ] Keep MongoDB credentials and deployment settings in environment variables. Exclude local `.env` from Git and provide a secret-free `.env.example`.
- [ ] Use a database account limited to the application's required database access.
- [ ] Return a generic message for `500`; do not expose stack traces, database queries, connection strings, or driver errors.
- [ ] Log diagnostic errors on the server without logging secrets or full connection strings.
- [ ] Use HTTPS on the deployed application.
- [ ] Keep Swagger on the API's own origin so browser testing does not require permissive CORS. CORS is not access control.

Rate limiting and authenticated writes are deferred, not claimed as implemented protections.

## 8. Existing data and seed preparation

- [ ] Use demonstration data and take a backup before modifying existing records.
- [ ] Create valid authors first, with unique IDs.
- [ ] Map every existing book's legacy `author` value to an author ID. Resolve unclear mappings manually; do not guess.
- [ ] Add `authorId`, remove legacy `author`, and normalize all books to the new model.
- [ ] Resolve duplicate IDs and invalid dates before creating indexes.
- [ ] Verify every migrated book references an existing author.
- [ ] Provide a repeatable development seed procedure that establishes `a1`, `a2`, and at least one valid book without accumulating duplicates. Do not reset the database automatically on server startup.

## 9. Swagger and deployment checklist

- [ ] Document all ten operations under Books and Authors tags.
- [ ] Define separate BookCreate, BookUpdate, BookResponse, AuthorCreate, AuthorUpdate, AuthorResponse, and ErrorResponse schemas.
- [ ] Document required fields, `additionalProperties: false` for request objects, ID patterns, string limits, and date format plus real-calendar-date validation.
- [ ] Document required path parameters and every applicable success/error status, including shared parser errors.
- [ ] Include JSON examples for create/update, individual responses, arrays, empty arrays, and errors.
- [ ] Document POST Location headers and DELETE's empty `204` responses.
- [ ] Configure Swagger to call the current local/deployed origin, not a hardcoded localhost URL on Render.
- [ ] Make `/api-docs` accessible and its Try it out actions functional in both environments.
- [ ] Read `PORT` from the environment, connect to MongoDB and establish required indexes before listening, and fail startup clearly if configuration or connection fails.
- [ ] Include README instructions for environment setup, startup, seeding, local API URL, deployed API URL, and Swagger URL.

## 10. Acceptance tests — definition of done

Run against a disposable test dataset. Capture status, response body, and relevant headers. These cases may be verified with automated integration tests or a repeatable HTTP test collection; exercise all ten routes in Swagger as well.

- [ ] Empty collections return `200` with `[]` from both list routes.
- [ ] Create `a1` and `a2`; verify `201`, public response fields, and Location headers.
- [ ] Fetch and list authors; verify stable ID ordering and no `_id`.
- [ ] Duplicate author ID returns `409`; duplicate author name with a different ID is allowed.
- [ ] Update an author and repeat the identical update; both return `200`.
- [ ] Create `b4` referencing `a1`; verify `201`, normalized title, Location header, and persisted values.
- [ ] Fetch and list books; verify ordering and no `_id` or legacy `author` field.
- [ ] Duplicate book ID returns `409`; two simultaneous valid POSTs for the same ID produce one `201`, one `409`, and one stored record.
- [ ] Unknown author on book POST and PUT returns `400 AUTHOR_NOT_FOUND`; the rejected operation leaves data unchanged.
- [ ] Reassign `b4` to `a2` with PUT; verify all updated values and unchanged ID.
- [ ] Repeat identical book PUT; verify `200`.
- [ ] Delete referenced `a2`; verify `409 AUTHOR_IN_USE` and preserved records.
- [ ] Delete unreferenced `a1`; verify `204` and a subsequent GET returns `404`.
- [ ] Delete `b4`; verify empty `204`, then GET and repeated DELETE return `404`.
- [ ] Delete now-unreferenced `a2`; verify `204`.
- [ ] GET/PUT/DELETE with valid nonexistent IDs return the appropriate `404`; PUT does not insert anything.
- [ ] Invalid route IDs return `400`.
- [ ] Missing fields, wrong types, nulls, blank names/titles, extra fields, immutable ID submissions, oversized strings, and unsupported queries return `400` without writes.
- [ ] Invalid calendar dates are rejected; valid leap dates such as `2024-02-29` and future dates are accepted.
- [ ] Malformed JSON returns `400`; non-JSON POST/PUT returns `415`; valid JSON over 16 KiB returns `413`.
- [ ] Conflicting failures follow section 6's check order—for example, a missing target with an unknown submitted author returns `404`.
- [ ] Simulate a database operation failure in a controlled test; verify generic `500`, standard error structure, and server-side logging.
- [ ] Repeat a complete author/book create-read-update-delete workflow against Render through Swagger and verify persistence across an application restart.

Version 2 is complete when these required checks pass locally and the deployment checks pass on Render. Deferred features are not acceptance requirements.
