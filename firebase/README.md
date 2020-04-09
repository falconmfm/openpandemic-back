# Corona App Firebase Backend

This is the part of the app where stands the Cloud Function responsible for extract the information about the tests and publish it to a PubSub topic where it can be consumed by the rest of the stack.

## Functionality

Simply execute the firebase functions deploy command:

```sh
firebase deploy --only functions
```

First you had to include the project you are working on in the firebase-cli:

```sh
firebase use --add
```