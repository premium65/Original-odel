import path from "path";
import AWS from "aws-sdk";
import { exec } from "child_process";
import fs from "fs";
import os from "os"; // For temporary directory
import { MongoClient } from "mongodb";

// AWS configuration with logging enabled
AWS.config.update({ logger: console });
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
});

// Backup MongoDB and Upload to S3
export const getBackupDBdata = async (req, res) => {
    const backupDir = path.join(os.tmpdir(), `backupDB_${Date.now()}`);
    const backupArchive = `${backupDir}.tar.gz`;
    const dbUri = process.env.DATABASE_URI;
    const dbName = process.env.DATABASE_NAME;

    try {
        // Create temporary backup directory
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // Step 1: Connect to MongoDB and get all collection names
        const client = new MongoClient(dbUri);
        await client.connect();
        const db = client.db(dbName);
        const collections = await db.listCollections().toArray();
        console.log("Collections:", collections.map((col) => col.name));

        // Step 2: Export each collection using mongoexport
        for (const collection of collections) {
            const collectionName = collection.name;
            const outputFilePath = path.join(backupDir, `${collectionName}.json`);
            const exportCommand = `mongoexport --uri="${dbUri}" --collection="${collectionName}" --out="${outputFilePath}"`;

            console.log(`Exporting collection: ${collectionName}`);
            await execCommand(exportCommand);
        }
        console.log("All collections exported successfully.");

        // Step 3: Compress the exported files
        const compressCommand = `tar -czf "${backupArchive}" -C "${backupDir}" .`;
        console.log("Compress Command:", compressCommand);
        await execCommand(compressCommand);
        console.log("Backup compressed successfully.");

        // Step 4: Upload to S3
        const fileStream = fs.createReadStream(backupArchive);
        const s3Params = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `${process.env.S3_FILE_LOCATION}/mongodb-backup-${Date.now()}.tar.gz`,
            Body: fileStream,
        };
        const uploadData = await s3Upload(s3Params);
        console.log("Backup uploaded to S3 successfully:", uploadData.Location);

        // Step 5: Clean up local backup files
        if (fs.existsSync(backupArchive)) fs.unlinkSync(backupArchive);
        if (fs.existsSync(backupDir)) fs.rmSync(backupDir, { recursive: true, force: true });
        console.log("Local backup files cleaned up.");
        return res.status(200).json({ success: true, message: `Backup uploaded to S3 successfully` });
    } catch (error) {
        console.error("Error during backup process:", error);
        res.status(500).send(`Error during backup process: ${error.message}`);
    }
};

// Helper function to execute shell commands
const execCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout, stderr) => {
            if (err) {
                console.error(`Error executing command "${command}":`, stderr);
                return reject(new Error(stderr));
            }
            resolve(stdout);
        });
    });
};

// Helper function to upload to S3
const s3Upload = (params) => {
    return new Promise((resolve, reject) => {
        s3.upload(params, (err, data) => {
            if (err) {
                console.error("Error uploading to S3:", err);
                return reject(err);
            }
            resolve(data);
        });
    });
};
