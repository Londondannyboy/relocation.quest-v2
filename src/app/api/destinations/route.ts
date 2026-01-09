/**
 * Destinations API - List All Destinations
 *
 * GET: Fetch all enabled destinations
 * Query params:
 *   - featured: Filter by featured status
 *   - limit: Max results (default 20)
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const featured = searchParams.get("featured");
    const limit = parseInt(searchParams.get("limit") || "20");

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    let destinations;

    if (featured === "true") {
      destinations = await sql`
        SELECT
          slug,
          country_name,
          flag,
          region,
          hero_title,
          hero_subtitle,
          hero_image_url,
          meta_description,
          cost_of_living
        FROM destinations
        WHERE enabled = true AND featured = true
        ORDER BY priority DESC, country_name ASC
        LIMIT ${limit}
      `;
    } else {
      destinations = await sql`
        SELECT
          slug,
          country_name,
          flag,
          region,
          hero_title,
          hero_subtitle,
          hero_image_url,
          meta_description,
          cost_of_living
        FROM destinations
        WHERE enabled = true
        ORDER BY priority DESC, country_name ASC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      destinations,
      total: destinations.length,
    });
  } catch (error) {
    console.error("[Destinations API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations", details: String(error) },
      { status: 500 }
    );
  }
}
