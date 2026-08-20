import fs from "fs";

class FileService {
    async writeDataToFile(data: any, path: string): Promise<void> {
        fs.writeFile(path,
            JSON.stringify(data, null, 2),
            () => {}
        );
    }

    async appendToFile(data: any, filePath: string): Promise<void> {
        try {
            fs.appendFile(
                filePath,
                JSON.stringify(data, null, 2),
                () => { }
            );
          console.log('Data successfully appended.');
        } catch (error) {
          console.error('Failed to append data:', error);
        }
    }
}

export const fileService = new FileService();