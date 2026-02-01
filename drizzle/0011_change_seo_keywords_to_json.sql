-- Change seo_keywords column from text to jsonb to support array of keywords
ALTER TABLE "posts" ALTER COLUMN "seo_keywords" TYPE jsonb USING 
  CASE 
    WHEN "seo_keywords" IS NULL THEN NULL
    WHEN "seo_keywords" = '' THEN NULL
    ELSE to_jsonb(string_to_array("seo_keywords", ','))
  END;
