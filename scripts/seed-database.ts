import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { fallbackCategories, fallbackTools } from '../lib/fallback-data';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seed() {
  console.log('🌱 Seeding from lib/fallback-data.ts (single source of truth)...');

  try {
    const categories = fallbackCategories.map(({ id: _id, ...rest }) => rest);

    console.log('📁 Seeding categories...');
    const { data: insertedCategories, error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' })
      .select();

    if (categoriesError) throw categoriesError;
    console.log(`✅ Seeded ${insertedCategories?.length} categories`);

    const categoryMap = new Map(
      insertedCategories?.map((cat) => [cat.slug, cat.id]) || []
    );

    const tools = fallbackTools.map((tool) => {
      const { tool_categories: _relations, ...rest } = tool;
      return rest;
    });

    console.log('🔧 Seeding tools...');
    const { data: insertedTools, error: toolsError } = await supabase
      .from('tools')
      .upsert(tools, { onConflict: 'slug' })
      .select();

    if (toolsError) throw toolsError;
    console.log(`✅ Seeded ${insertedTools?.length} tools`);

    const insertedBySlug = new Map(
      insertedTools?.map((tool) => [tool.slug, tool.id]) || []
    );

    console.log('🔗 Seeding tool-category relationships...');
    const toolCategoryRelations = [];

    for (const tool of fallbackTools) {
      const toolId = insertedBySlug.get(tool.slug);
      if (!toolId) continue;

      for (const relation of tool.tool_categories || []) {
        const categorySlug = relation.categories?.slug;
        const categoryId = categorySlug ? categoryMap.get(categorySlug) : undefined;
        if (!categoryId) continue;

        toolCategoryRelations.push({
          tool_id: toolId,
          category_id: categoryId,
          is_primary: Boolean(relation.is_primary),
        });
      }
    }

    if (toolCategoryRelations.length > 0) {
      const { error: relationsError } = await supabase
        .from('tool_categories')
        .upsert(toolCategoryRelations, { onConflict: 'tool_id,category_id' });

      if (relationsError) throw relationsError;
      console.log(`✅ Seeded ${toolCategoryRelations.length} tool-category relationships`);
    }

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seed();
