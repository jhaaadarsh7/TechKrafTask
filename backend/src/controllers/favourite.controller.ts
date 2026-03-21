import { Request, Response, NextFunction } from "express";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";

export const getMyFavourites = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const favourites = await prisma.favourite.findMany({
      where: {
        userId: req.user.userId,
      },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: favourites.length,
      data: favourites,
    });
  } catch (error) {
    next(error);
  }
};

export const addFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const propertyId = Number(req.params.propertyId);

    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return next(new AppError("Property not found", 404));
    }

    const existingFavourite = await prisma.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.userId,
          propertyId,
        },
      },
    });

    if (existingFavourite) {
      return next(new AppError("Property is already in favourites", 409));
    }

    const favourite = await prisma.favourite.create({
      data: {
        userId: req.user.userId,
        propertyId,
      },
      include: {
        property: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "Property added to favourites",
      data: favourite,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFavourite = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError("Unauthorized", 401));
    }

    const propertyId = Number(req.params.propertyId);

    const existingFavourite = await prisma.favourite.findUnique({
      where: {
        userId_propertyId: {
          userId: req.user.userId,
          propertyId,
        },
      },
    });

    if (!existingFavourite) {
      return next(new AppError("Favourite not found", 404));
    }

    await prisma.favourite.delete({
      where: {
        userId_propertyId: {
          userId: req.user.userId,
          propertyId,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Property removed from favourites",
    });
  } catch (error) {
    next(error);
  }
};