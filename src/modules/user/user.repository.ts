import prisma from "@/lib/db"
import type { CreateUserInput,UpdateUserInput } from "./user.types";

export const userRepository = {
  getAll:() =>  prisma.user.findMany(),
  
  findById:(id:string) => prisma.user.findUnique({ where: { id } }),

  findByEmail:(email:string) => prisma.user.findUnique({ where: { email } }),

  //---create a new user---
  create:(data:CreateUserInput) => prisma.user.create({ data }),

  //---update an existing user---
  update:(id:string, data:UpdateUserInput) => prisma.user.update({ where: { id }, data }),

  //---delete a user---
  delete:(id:string) => prisma.user.delete({ where: { id } }),
};
              