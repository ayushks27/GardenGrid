"use server"

import { getUserId } from "./user.actions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function getPlants(searchTerm?: String) {
    try{
        const currentUserId = await getUserId();

        const whereClause: any = {
            userId: currentUserId,
        };

        if(searchTerm) {
            whereClause.name = {
                contains: searchTerm,
                mode: "insensitive"
            };
        }        

        const userPlants = await prisma.plants.findMany({
            where: whereClause,
        });

        revalidatePath("/");
        return { success: true, userPlants };
    } catch (error){
        console.log("Error in getPlants", error);
        throw new Error("Failed to fetch plants");
    }
}

export async function getPlantById(id: string) {
    return await prisma.plants.findUnique({
        where: { id },
    });
}

export async function createPlant(data: Prisma.PlantsCreateInput) {
  console.log("Creating plant")
  console.log(data)

  try {
    const currentUserId = await getUserId();
    if(!currentUserId) return
    const newPlant = await prisma.plants.create({
      data: {
        ...data,
        userId: currentUserId,
      },
    });

    revalidatePath("/plants");
    return newPlant;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
}

export async function editPlant(id: string, data: Prisma.PlantsUpdateInput) {
  try {
    const currentUserId = await getUserId();

    const updatedPlant = await prisma.plants.update({
      where: { id },
      data: {
        ...data,
        userId: currentUserId,
      },
    });

    revalidatePath("/plants");
    return updatedPlant;
  } catch (error) {
    console.error("Error updating plant:", error);
    throw error;
  }
}

export async function deletePlant(id: string) {
  try {
    console.log("Deleting:", id);
    const currentUserId = await getUserId();
    if(!currentUserId) return;
    const deletedPlant = await prisma.plants.delete({
      where: { id },
    });
    revalidatePath("/plants");
    return deletedPlant;
  } catch (error) {
    console.error("Error deleting plant:", error);
    throw error;
  }
}