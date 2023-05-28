# Auto Release on Version Bump GitHub Action

This action checks if the version in `package.json` is incremented, and creates a new release for the new version if it is. If the version is not incremented, the action fails. This is useful for enforcing a versioning policy in your repositories.

## Inputs

- `token`: **Required**. The GitHub token.
- `name`: The name of the release. 
  - Defaults to "v$newVersion". 
  - You can use `$newVersion` and `$oldVersion` in this field.
- `body`: The body of the release. 
  - Defaults to an empty string. 
  - You can use `$newVersion` and `$oldVersion` in this field.
- `draft`: A boolean indicating if the created release should be a draft. 
- Defaults to "false".
- `pre-release`: Indicates if the release should be marked as a pre-release. 
  - Available values: "true", "false", "auto". 
  - Defaults to "auto". 
  - If set to "auto", the action will determine if the new version is a pre-release and mark the release accordingly.
- `generate-release-note`: A boolean indicating 
  - Defaults to "true".
  - if a release note should be generated.
- `tag-name`: The name of the tag to create. 
  - Defaults to "$newVersion". 
  - You can use `$newVersion` and `$oldVersion` in this field.

## Example usage

```yaml
uses: Makepad-fr/auto-release-on-version-bump-actionp@v1.0.3
with:
  token: ${{ secrets.GITHUB_TOKEN }}
  name: 'Release $newVersion'
  body: 'Changes in this release: ...'
  draft: 'false'
  pre-release: 'auto'
  generate-release-note: 'true'
  tag-name: '$newVersion'
```

## Support

If you encounter any issues or have any questions, please open an issue in the GitHub repository.

