import { Request, Response } from 'express';
import { getDb } from '../db';

export class ThemeController {
  // Built-in gallery of ultra-premium cinematic stadium themes
  private static THEME_GALLERY = [
    {
      name: "Cyber Blue",
      backgroundType: "DYNAMIC",
      primaryColor: "#050014",
      accentColor: "#00F0FF",
      secondaryColor: "#7B00FF",
      blurIntensity: 25,
      brightness: 85,
      opacity: 45,
      animatedGradient: true,
      particleEffects: true,
      stadiumLightAnimation: true,
      description: "Neon cyber-themed layout with pulsing laser stadium beams."
    },
    {
      name: "Stadium Lights",
      backgroundType: "DYNAMIC",
      primaryColor: "#000B29",
      accentColor: "#00FF66",
      secondaryColor: "#D4AF37",
      blurIntensity: 20,
      brightness: 75,
      opacity: 40,
      animatedGradient: true,
      particleEffects: true,
      stadiumLightAnimation: true,
      description: "Atmospheric dark blue pitch lighting with drifting light flare particles."
    },
    {
      name: "Trophy Celebration",
      backgroundType: "DYNAMIC",
      primaryColor: "#120D00",
      accentColor: "#D4AF37", // Gold
      secondaryColor: "#FFFFFF",
      blurIntensity: 15,
      brightness: 90,
      opacity: 50,
      animatedGradient: true,
      particleEffects: true,
      stadiumLightAnimation: false,
      description: "Golden championship layout complete with falling glitter confetti."
    },
    {
      name: "Match Night",
      backgroundType: "VIDEO",
      primaryColor: "#050912",
      accentColor: "#00FF66",
      secondaryColor: "#3388FF",
      blurIntensity: 30,
      brightness: 70,
      opacity: 35,
      animatedGradient: false,
      particleEffects: false,
      stadiumLightAnimation: false,
      description: "Immersive dark stadium background with looping slow-motion fans wave video."
    },
    {
      name: "Minimal Dark",
      backgroundType: "STATIC",
      primaryColor: "#07080a",
      accentColor: "#FFFFFF",
      secondaryColor: "#555555",
      blurIntensity: 10,
      brightness: 90,
      opacity: 60,
      animatedGradient: false,
      particleEffects: false,
      stadiumLightAnimation: false,
      description: "Clean graphite finish with standard crisp highlights."
    }
  ];

  /**
   * Retrieves active theme preferences for the user.
   */
  static async getTheme(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { prisma, useMock, mockDb } = getDb();

      let theme: any = null;

      if (useMock) {
        theme = mockDb.themeSettings.find(t => t.userId === userId);
      } else {
        theme = await prisma!.themeSettings.findUnique({
          where: { userId }
        });
      }

      // Default back to first theme if not initialized
      if (!theme) {
        theme = {
          userId,
          backgroundType: "DYNAMIC",
          themeName: "Stadium Lights",
          customWallpaperUrl: null,
          customVideoUrl: null,
          blurIntensity: 20,
          brightness: 80,
          opacity: 40,
          glassmorphism: true,
          animatedGradient: true,
          particleEffects: true,
          stadiumLightAnimation: true
        };
      }

      return res.status(200).json({
        activeTheme: theme,
        gallery: ThemeController.THEME_GALLERY
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Saves updated theme preferences.
   */
  static async saveTheme(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const themeData = req.body;
      const { prisma, useMock, mockDb } = getDb();

      let updatedTheme: any = null;

      if (useMock) {
        let existingIndex = mockDb.themeSettings.findIndex(t => t.userId === userId);
        const entry = {
          id: `theme-${Date.now()}`,
          userId,
          ...themeData,
          updatedAt: new Date()
        };

        if (existingIndex !== -1) {
          mockDb.themeSettings[existingIndex] = {
            ...mockDb.themeSettings[existingIndex],
            ...themeData
          };
          updatedTheme = mockDb.themeSettings[existingIndex];
        } else {
          mockDb.themeSettings.push(entry);
          updatedTheme = entry;
        }
      } else {
        updatedTheme = await prisma!.themeSettings.upsert({
          where: { userId },
          update: themeData,
          create: {
            userId,
            ...themeData
          }
        });
      }

      return res.status(200).json({
        message: "Theme customized successfully!",
        theme: updatedTheme
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * AI Theme Recommendation system based on user queries (e.g. team colors or favorite players).
   */
  static async recommendTheme(req: Request, res: Response) {
    try {
      const { favoriteTeam, favoritePlayer } = req.query;

      console.log(`[AI Theme Recommendation] Query: Team=${favoriteTeam}, Player=${favoritePlayer}`);

      let recommendedThemeName = "Stadium Lights";
      let reasoning = "Recommended our flagship match theme highlighting high-fidelity floodlights.";

      if (favoriteTeam) {
        const team = (favoriteTeam as string).toLowerCase();
        if (team.includes("argentina") || team.includes("messi")) {
          recommendedThemeName = "Cyber Blue";
          reasoning = "Matching Argentina's premium neon-blue Sky Colors with glow lines.";
        } else if (team.includes("brazil") || team.includes("yellow")) {
          recommendedThemeName = "Trophy Celebration";
          reasoning = "Evoking Brazil's golden canary prestige with sparkling particle flares.";
        } else if (team.includes("england") || team.includes("usa") || team.includes("white")) {
          recommendedThemeName = "Minimal Dark";
          reasoning = "Contrasting pure white text overlays with structured graphite backgrounds.";
        }
      }

      const matchTheme = ThemeController.THEME_GALLERY.find(t => t.name === recommendedThemeName);

      return res.status(200).json({
        themeName: recommendedThemeName,
        reasoning,
        config: matchTheme
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
