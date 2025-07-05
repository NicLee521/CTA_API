import * as Minio from 'minio'

class MinioClient {
    private readonly client: Minio.Client;

    constructor() {
        this.client = new Minio.Client({
            endPoint: process.env.MINIO_ENDPOINT ?? 'localhost',
            useSSL: process.env.MINIO_USE_SSL === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY,
        });
    }

    async uploadFile(bucketName: string, objectName: string, filePath: string): Promise<{ bucketName: string; objectName: string }> {
        try {
            await this.client.fPutObject(bucketName, objectName, filePath);
            console.log(`File uploaded successfully to ${bucketName}/${objectName}`);
            return {bucketName, objectName};
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    }

    async downloadFile(bucketName: string, objectName: string, filePath: string): Promise<string> {
        try {
            await this.client.fGetObject(bucketName, objectName, filePath);
            return filePath;
        } catch (error) {
            console.error('Error downloading file:', error);
            throw error;
        }
    }

    async deleteFile(bucketName: string, objectName: string): Promise<void> {
        try {
            await this.client.removeObject(bucketName, objectName);
            console.log(`File deleted successfully from ${bucketName}/${objectName}`);
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }

}

export { MinioClient };