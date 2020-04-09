# pubsub_to_bq Cloud Function

Cloud Function for Open Corona App. Its job is to extract the information in the PubSub `new_diagnostic` topic and insert in the BigQuery Model Data.

## Deploy to Gcloud

Use the command in the script element of the `package.json`:

```sh
npm run deploy
```

This will use your credentials to deploy the Cloud Function in your project.