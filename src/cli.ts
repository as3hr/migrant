import { Command } from 'commander';
import { pool } from './config/db.config.ts';
import { parseSchema } from './core/schemaParser.ts';
import { AIService } from './embeddings_vector/ai_service.ts';

export const aiService = new AIService();
const program = new Command()

program.name('migrant').description('CLI for migrant.').version('0.0.1');

program
  .command('migrant')
  .description('Run your migrant agent!')
  .option('--db <url>', 'connect to a database')
    .action((options) => {
      if(options.db) {
        pool.connect(options.db);
        // logSampleData().then((result) => {
        //     console.log('Fetched successfully');
        // });
        // matchDocuments();
        parseSchema();
      }
  })

program.parse()