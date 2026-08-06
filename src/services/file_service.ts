import fs from "fs";

class FileService {
    async writeDataToFile(data: any, path: string): Promise<void> {
        fs.writeFile(path,
            JSON.stringify(data, null, 2),
            () => {}
        );
    }
}

export const fileService = new FileService();