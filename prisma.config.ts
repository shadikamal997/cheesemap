export default {
  database: {
    provider: 'postgresql',
    url: process.env.DATABASE_URL,
    extensions: ['postgis']
  }
}