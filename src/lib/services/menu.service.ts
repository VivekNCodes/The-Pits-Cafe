import prisma from '@/lib/prisma';

export class MenuService {
  /**
   * Fetches active categories and food items for a restaurant.
   * Strictly isolated by restaurantId.
   */
  static async getPublicMenu(restaurantId: string) {
    try {
      return await prisma.category.findMany({
        where: {
          restaurantId,
          isActive: true,
        },
        orderBy: { displayOrder: 'asc' },
        include: {
          foodItems: {
            where: { isAvailable: true },
            orderBy: { displayOrder: 'asc' },
            include: {
              addonGroups: {
                include: {
                  addons: {
                    where: { isAvailable: true },
                    orderBy: { displayOrder: 'asc' },
                  },
                },
              },
            },
          },
        },
      });
    } catch (err) {
      console.error('MenuService.getPublicMenu error:', err);
      return [];
    }
  }

  /**
   * Fetches all categories and food items (including unavailable items) for Admin CMS.
   */
  static async getAdminMenu(restaurantId: string) {
    return prisma.category.findMany({
      where: { restaurantId },
      orderBy: { displayOrder: 'asc' },
      include: {
        foodItems: {
          orderBy: { displayOrder: 'asc' },
          include: {
            addonGroups: {
              include: {
                addons: {
                  orderBy: { displayOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Fetches a single food item by ID or Slug with add-on options
   */
  static async getFoodItem(restaurantId: string, itemIdOrSlug: string) {
    return prisma.foodItem.findFirst({
      where: {
        restaurantId,
        OR: [{ id: itemIdOrSlug }, { slug: itemIdOrSlug }],
      },
      include: {
        category: true,
        addonGroups: {
          include: {
            addons: {
              where: { isAvailable: true },
            },
          },
        },
      },
    });
  }

  /**
   * Toggles item availability (instantly reflects on customer menu without losing historical data)
   */
  static async toggleItemAvailability(restaurantId: string, itemId: string, isAvailable: boolean) {
    return prisma.foodItem.updateMany({
      where: { id: itemId, restaurantId },
      data: { isAvailable },
    });
  }

  /**
   * Creates or updates a food item
   */
  static async upsertFoodItem(
    restaurantId: string,
    data: {
      id?: string;
      categoryId: string;
      name: string;
      slug: string;
      description?: string;
      price: number;
      imageUrl?: string;
      preparationTime?: number;
      isAvailable?: boolean;
      isVeg?: boolean;
      isSpicy?: boolean;
      isFeatured?: boolean;
      isBestseller?: boolean;
      ingredients?: string;
      allergens?: string;
      searchTags?: string;
    }
  ) {
    if (data.id) {
      return prisma.foodItem.update({
        where: { id: data.id },
        data: {
          categoryId: data.categoryId,
          name: data.name,
          slug: data.slug,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          preparationTime: data.preparationTime ?? 15,
          isAvailable: data.isAvailable ?? true,
          isVeg: data.isVeg ?? true,
          isSpicy: data.isSpicy ?? false,
          isFeatured: data.isFeatured ?? false,
          isBestseller: data.isBestseller ?? false,
          ingredients: data.ingredients,
          allergens: data.allergens,
          searchTags: data.searchTags,
        },
      });
    }

    return prisma.foodItem.create({
      data: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        preparationTime: data.preparationTime ?? 15,
        isAvailable: data.isAvailable ?? true,
        isVeg: data.isVeg ?? true,
        isSpicy: data.isSpicy ?? false,
        isFeatured: data.isFeatured ?? false,
        isBestseller: data.isBestseller ?? false,
        ingredients: data.ingredients,
        allergens: data.allergens,
        searchTags: data.searchTags,
      },
    });
  }

  /**
   * Category management
   */
  static async upsertCategory(
    restaurantId: string,
    data: { id?: string; name: string; slug: string; description?: string; icon?: string; displayOrder?: number }
  ) {
    if (data.id) {
      return prisma.category.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          icon: data.icon,
          displayOrder: data.displayOrder ?? 0,
        },
      });
    }

    return prisma.category.create({
      data: {
        restaurantId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        icon: data.icon,
        displayOrder: data.displayOrder ?? 0,
      },
    });
  }

  static async deleteCategory(restaurantId: string, categoryId: string) {
    return prisma.category.deleteMany({
      where: { id: categoryId, restaurantId },
    });
  }

  static async deleteFoodItem(restaurantId: string, itemId: string) {
    return prisma.foodItem.deleteMany({
      where: { id: itemId, restaurantId },
    });
  }
}
