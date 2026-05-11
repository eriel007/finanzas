import { userRepository } from "./user.repository";
import type { CreateUserInput, UpdateUserInput } from "./user.types";

export const userService = {
  getUsers : async()=>{
    return userRepository.getAll();
  },

  getUserById : async(id:string)=>{
    const user = await userRepository.findById(id);
    if(!user) throw new Error("User not found");
    return user;
  },

  getUserEmail : async(email:string)=>{
    return userRepository.findByEmail(email);
  },

  //--- create a new user---
  createUser : async(data:CreateUserInput)=>{
    const existingUser = await userRepository.findByEmail(data.email);
    if(existingUser) throw new Error("Email already in use");
    return userRepository.create(data);
  },

  // --- update ---
  updateUser : async(id:string, data:UpdateUserInput)=>{
    const existing = await userRepository.findById(id);
    if (!existing) throw new Error("User not found");
    
    if (data.email){
      const existingUser = await userRepository.findByEmail(data.email);
      if(existingUser && existingUser.id !== id) throw new Error("Email already in use");
    }
    return userRepository.update(id, data);
  },

  //--- delete ---
  deleteUser : async(id:string)=>{
    await userService.getUserById(id);
    return userRepository.delete(id);
  }
};