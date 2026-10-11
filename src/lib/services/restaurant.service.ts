import prisma from '@/lib/prisma';

export class RestaurantService {
  /**
   * Retrieves restaurant by slug with branding, settings, and social links.
   * Never leaks data from another tenant.
   */
  static async getBySlug(slug: string) {
    return prisma.restaurant.findUnique({
      where: { slug },
      include: {
        socialLinks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Retrieves restaurant by ID
   */
  static async getById(id: string) {
    return prisma.restaurant.findUnique({
      where: { id },
      include: {
        socialLinks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Lists all registered restaurants (for platform root / tenant switch)
   */
  static async listAll() {
    return prisma.restaurant.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        tagline: true,
        city: true,
        heroImageUrl: true,
        logoUrl: true,
        openingHours: true,
        dineInEnabled: true,
        takeawayEnabled: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Updates restaurant branding, story, footer, and operational settings
   */
  static async updateSettings(
    restaurantId: string,
    data: {
      name?: string;
      tagline?: string;
      description?: string;
      aboutText?: string;
      aboutHeading?: string;
      storyImageUrl?: string;
      policyTitle?: string;
      policyText?: string;
      footerCopyright?: string;
      heroHeading?: string;
      heroSubtitle?: string;
      heroImageUrl?: string;
      logoUrl?: string;
      address?: string;
      city?: string;
      pincode?: string;
      googleMapsUrl?: string;
      phone?: string;
      email?: string;
      openingHours?: string;
      dineInEnabled?: boolean;
      takeawayEnabled?: boolean;
      reservationsEnabled?: boolean;
      maintenanceMode?: boolean;
      maintenanceNotice?: string;
      taxPercentage?: number;
      serviceChargePercentage?: number;
      welcomeGreetingHeading?: string;
      welcomeGreetingMessage?: string;
      qrCtaText?: string;
      socialLinks?: Array<{
        platform: string;
        url: string;
        label: string;
      }>;
    }
  ) {
    const { socialLinks, ...restaurantFields } = data;

    // If social links provided, sync them
    if (socialLinks && Array.isArray(socialLinks)) {
      await prisma.socialLink.deleteMany({
        where: { restaurantId },
      });

      if (socialLinks.length > 0) {
        await prisma.socialLink.createMany({
          data: socialLinks.map((s, idx) => ({
            restaurantId,
            platform: s.platform,
            url: s.url,
            label: s.label || s.platform,
            displayOrder: idx + 1,
          })),
        });
      }
    }

    return prisma.restaurant.update({
      where: { id: restaurantId },
      data: restaurantFields,
      include: {
        socialLinks: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }
}
