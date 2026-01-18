export default {
  schema: './prisma/schema.prisma',
  datasource: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}
