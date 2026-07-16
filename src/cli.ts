import { Command } from 'commander';
import { pool } from './config/db.config.js';
import { logSampleData } from './connect_to_db.js';
const program = new Command()

program.name('migrant').description('CLI for migrant.').version('0.0.1');

program
  .command('analyze')
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