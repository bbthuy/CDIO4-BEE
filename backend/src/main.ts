import { initializeTransactionalContext } from 'typeorm-transactional';
import { createApp } from './app';
import { SeederService } from './common/databases/seeder.service';

async function main() {
  initializeTransactionalContext();
  let app = await createApp();
  app = await app.init();
  await app.listen(process.env.SERVER_PORT);

  const seeder = app.get(SeederService);
  await seeder.run();
}

main();
