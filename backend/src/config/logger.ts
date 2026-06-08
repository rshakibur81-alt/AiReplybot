import morgan from 'morgan';

const logger = morgan(
  process.env.NODE_ENV === 'production'
    ? 'combined'
    : ':method :url :status :res[content-length] - :response-time ms'
);

export default logger;