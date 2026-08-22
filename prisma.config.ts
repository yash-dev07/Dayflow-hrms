import { defineConfig } from '@prisma/config'
import 'dotenv/config'

export default defineConfig({
  migrations: {
    seed: 'npx ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts',
  },
  datasource: {
    url: process.env.DIRECT_URL!,
  },
})
