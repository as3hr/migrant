import { Command } from 'commander';
import { pool } from './config/db.config.ts';
import { logSampleData } from './connect_to_db.ts';
import { AIUtilities } from './embeddings_vector/ai_utilities.ts';

export const aiUtilities = new AIUtilities();
const program = new Command()

program.name('migrant').description('CLI for migrant.').version('0.0.1');

program
  .command('migrant')
  .description('Run your migrant agent!')
  .option('--db <url>', 'connect to a database')
    .action((options) => {
      if(options.db) {
        pool.connect(options.db);
        logSampleData().then((result) => {
            console.log(result);
        });
      }
  })

program.parse()