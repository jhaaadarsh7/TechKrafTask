import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";

export const getAllProperties = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    next(error);
  }
};