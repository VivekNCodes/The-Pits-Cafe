import prisma from '@/lib/prisma';

export class SearchService {
  /**
   * Calculates Levenshtein distance between two strings
   */
  private static levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];
    const lenA = a.length;
    const lenB = b.length;

    if (lenA === 0) return lenB;
    if (lenB === 0) return lenA;

    for (let i = 0; i <= lenB; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= lenA; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= lenB; i++) {
      for (let j = 1; j <= lenA; j++) {
        if (b.charAt(i - 1).toLowerCase() === a.charAt(j - 1).toLowerCase()) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[lenB][lenA];
  }

  /**
   * Computes string similarity score between 0.0 (no match) and 1.0 (exact match)
   */
  private static similarity(s1: string, s2: string): number {
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
  }

  /**
   * Checks if query matches string by token, substring or fuzzy threshold
   */
  private static scoreMatch(target: string, query: string): number {
    const targetNorm = target.toLowerCase();
    const queryNorm = query.toLowerCase().trim();

    // Exact match or contains
    if (targetNorm === queryNorm) return 1.0;
    if (targetNorm.includes(queryNorm)) return 0.85;

    // Tokenize
    const targetTokens = targetNorm.split(/\s+/);
    const queryTokens = queryNorm.split(/\s+/);

    let maxTokenScore = 0;
    for (const qToken of queryTokens) {
      if (qToken.length < 2) continue;
      for (const tToken of targetTokens) {
        if (tToken.includes(qToken)) {
          maxTokenScore = Math.max(maxTokenScore, 0.75);
        } else {
          const sim = this.similarity(tToken, qToken);
          if (sim > 0.6) {
            maxTokenScore = Math.max(maxTokenScore, sim * 0.7);
          }
        }
      }
    }

    return maxTokenScore;
  }

  /**
   * Smart Search with typo tolerance across name, description, ingredients, searchTags, category
   */
  static async searchItems(restaurantId: string, query: string) {
    if (!query || query.trim() === '') {
      return [];
    }

    const trimmed = query.trim().toLowerCase();

    // Fetch candidate available items for the tenant
    const items = await prisma.foodItem.findMany({
      where: {
        restaurantId,
        isAvailable: true,
      },
      include: {
        category: true,
      },
    });

    const scored = items
      .map((item) => {
        let score = 0;

        // Name match has highest priority
        const nameScore = this.scoreMatch(item.name, trimmed);
        score += nameScore * 2.0;

        // Search tags (custom aliases like 'panner', 'cofee', 'magi')
        if (item.searchTags) {
          const tagScore = this.scoreMatch(item.searchTags, trimmed);
          score += tagScore * 1.5;
        }

        // Category name
        if (item.category?.name) {
          const catScore = this.scoreMatch(item.category.name, trimmed);
          score += catScore * 1.0;
        }

        // Description
        if (item.description) {
          const descScore = this.scoreMatch(item.description, trimmed);
          score += descScore * 0.5;
        }

        // Ingredients
        if (item.ingredients) {
          const ingScore = this.scoreMatch(item.ingredients, trimmed);
          score += ingScore * 0.5;
        }

        return { item, score };
      })
      .filter((result) => result.score > 0.3)
      .sort((a, b) => b.score - a.score);

    return scored.map((s) => s.item);
  }
}
