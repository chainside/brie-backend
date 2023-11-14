import { ConnectionOptions, createConnection } from 'typeorm';
import { dataSourceOpts } from '../src/modules/common/provider/config.provider';

async function dropDatabase(): Promise<void> {
    try {
        const connectionOptions: ConnectionOptions = dataSourceOpts;
        const connection = await createConnection(connectionOptions);
        await connection.dropDatabase();
        await connection.close();
    } catch (error) {
        throw new Error('Clear Databaase error');
    }
}

dropDatabase();
