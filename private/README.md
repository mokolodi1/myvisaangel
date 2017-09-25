# Private files

The following secret files must be in this folder for the API to work correctly.

```
myvisaangel-f24414135324-service-account.json
```

## TODO

For right now I'm going to check in the Google service account file as it's not super secret. If an attacker can get to that file they can also get to the Google Docs it can access via the web interface. (Being logged into Google with physical access to a machine, etc.)

If this project grows we'll remove this from the git and figure out a more secure way of distributing it to production boxes. (When that happens we'll regenerate the secret keys because they'll be in the git history.)
