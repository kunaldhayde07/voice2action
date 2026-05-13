import mongoose from 'mongoose';
import logger from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    mongoose.set('strictQuery', false);

    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Clean up any problematic geospatial indexes from the Issue collection
    try {
      const db = conn.connection.db;
      if (db) {
        const collection = db.collection('issues');
        const indexes = await (collection as any).getIndexes();
        
        // Check for and drop 2dsphere indexes on location.coordinates
        for (const [indexName, indexSpec] of Object.entries(indexes)) {
          const spec = indexSpec as any;
          if (indexName !== '_id_' && spec && spec.key) {
            const keys = Object.keys(spec.key);
            if (keys.some((key: string) => key.includes('location'))) {
              logger.info(`Dropping geospatial index: ${indexName}`);
              try {
                await collection.dropIndex(indexName);
                logger.info(`✅ Successfully dropped index: ${indexName}`);
              } catch (err) {
                logger.warn(`Could not drop index ${indexName}: ${err}`);
              }
            }
          }
        }
      }
    } catch (indexErr) {
      logger.warn('Index cleanup warning:', indexErr);
      // Continue even if index cleanup fails
    }

    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};