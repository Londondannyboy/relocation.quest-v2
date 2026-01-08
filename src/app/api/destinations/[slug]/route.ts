/**
 * Destinations API - Single Destination by Slug
 *
 * GET: Fetch a destination with all structured data
 */

import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      return NextResponse.json(
        { error: "DATABASE_URL not configured" },
        { status: 500 }
      );
    }

    const sql = neon(databaseUrl);

    const destinations = await sql`
      SELECT
        id,
        slug,
        country_name,
        flag,
        region,
        hero_title,
        hero_subtitle,
        hero_gradient,
        language,
        enabled,
        featured,
        priority,
        quick_facts,
        highlights,
        visas,
        cost_of_living,
        job_market,
        faqs,
        meta_title,
        meta_description,
        hero_image_url
      FROM destinations
      WHERE slug = ${slug} AND enabled = true
    `;

    if (destinations.length === 0) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(destinations[0]);
  } catch (error) {
    console.error("[Destinations API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch destination", details: String(error) },
      { status: 500 }
    );
  }
}
