import { PrismaClient } from "@prisma/client";
import { PrismaPg } from '@prisma/adapter-pg';


const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL 
});

const prismaClienteSingleton = () => {
  return new PrismaClient({
    adapter:adapter
  });
}

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClienteSingleton>;
} & typeof global;
const prisma = globalThis.prismaGlobal || prismaClienteSingleton();


export default prisma
if (process.env.NODE_ENV !== "production") globalThis.prismaGlobal = prisma;