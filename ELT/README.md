# Import the data using pgAdmin

Make your tables with columns in pgAdmin first. Be sure to follow the exact format of the data. Be sure you are using the public schema.

![Questions Columns](./readme_assets/QuestionsColumns.png)
![Answers Columns](./readme_assets/AnswersColumns.png)
![AnswersPhotos Columns](./readme_assets/AnswersPhotosColumns.png)

Right click on a table and select "Import/Export Data"

![Right Click](./readme_assets/RightClick.png)

Make sure "Import" is selected, and select the CSV file to import. Make sure "Header" is selected because the CSV file should have headers in it.

![Import Data](./readme_assets/ImportData.png)

# Deploy Cloud Instance

Use your favorite cloud service and create a PostgreSQL instance.

Or use pgAdmin to do it. (Only available option is an Amazon RDS at time of writing.)

![Deploy Cloud Instance](./readme_assets/DeployCloudInstance.png)

# Export the data to the cloud

Use pgAdmin or CLI to make a dump of the database.

![Backup Server](./readme_assets/BackupServer.png)

```
pg_dump SDC
```

Then restore that dump to your cloud-based database.
Easiest way is to use a URL. Replace the values in the following command appropriately.

```
pg_restore -d postgres://<USERNAME>:<PASSWORD>@<CLOUD_URL>:<PORT>/sdc SDC
```