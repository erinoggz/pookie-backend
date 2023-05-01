import _ from 'lodash';
import { MongoClient } from 'mongodb';
import { container } from 'tsyringe';
import configuration from '../config/config';
import { LoggerService } from '../service/logger.service';
import plansDoc from './data/plan/plan';

const logger: LoggerService = container.resolve(LoggerService);

const seeder = {
  seedDb: async function () {
    logger.log('Running seed scripts for db...');
    const client = await MongoClient.connect(configuration.mongo.uri);
    try {
      const db = client.db();
      logger.log(`Connected to ${db.databaseName} db to run seed scripts`);
      try {
        for (const plan of plansDoc) {
          if (!plan.plan_code) continue;
          const existingProperty = await db
            .collection('plans')
            .findOne({ plan_code: plan.plan_code });
          if (!existingProperty) {
            await db.collection('plans').insertOne(plan);
            logger.log(`Records added/updated.`);
          }
        }
      } catch (error) {
        if (error.code !== 11000) logger.log(error);
      }
    } finally {
      client.close();
    }
  },
};

export default seeder;
