# Contributing

Thank you for your interest in improving **Samir Music Provider API**. Contributions to providers, reliability, documentation, testing, and developer experience are welcome. Beginners are welcome too.

## Before you start

- Check existing issues and pull requests for duplicates.
- For a large change, open an issue first to discuss the idea.
- Be respectful, patient, and clear when explaining your work.

## Development setup

Requirements: Node.js 18 or newer, Git, and an internet connection.

```bash
git clone https://github.com/ahmedsamir25032007-cmyk/samir-music-provider-api-.git
cd samir-music-provider-api-
node api-server.mjs
```

The server listens on port 3000.

## Provider guidelines

Every provider should:

1. Be a separate `.mjs` file inside `providers/`.
2. Export a default object with `id`, `name`, `status`, and async `search(query)`.
3. Return an array of consistently shaped results.
4. Handle empty queries and upstream errors safely.
5. Use reasonable network timeouts.
6. Never log credentials or private user data.
7. Respect upstream API terms, copyright, and content licences.

Common result fields (when available): `title`, `artist`, `album`, `image`, `audio`, `preview`, `link`, `duration`, `license`, and `type`. Use `type: "radio"` for radio stations.

Do not label a preview as a full track. Do not claim playback works until the returned audio URL has been tested.

## Code style

- Use modern JavaScript ES modules.
- Prefer clear names and small functions.
- Keep provider-specific logic in its provider module.
- Avoid adding dependencies unless needed; explain new dependencies in the pull request.
- Do not commit backups, generated files, `node_modules/`, or secrets.

## Testing checklist

Before submitting:

- Run `node --check path/to/changed-file.mjs` on changed JavaScript files.
- Start the server with `node api-server.mjs`.
- Check `/health` and `/providers`.
- Test changed providers with a real search query.
- For audio providers, verify the returned URL and content type without downloading large files.
- Clearly report anything you could not test.

## Pull request checklist

- [ ] The purpose of the change is clear.
- [ ] Existing behavior has been checked.
- [ ] Provider behavior and configuration are documented.
- [ ] No credentials or private data are included.
- [ ] Tests and results are described.
- [ ] Licensing and attribution requirements are documented.

## Security reports

Do not publish passwords, API keys, exploit code, or sensitive vulnerability details in public issues. Contact the repository owner privately through GitHub.

Thank you for contributing!
