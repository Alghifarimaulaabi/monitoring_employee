# Application Configurations & Operational Constants

## 1. Image Upload & Compression Constants
* `MAX_RAW_INPUT_SIZE_BYTES`: `10 * 1024 * 1024` (10 MB).
* `ACCEPTED_IMAGE_MIME_TYPES`: `['image/jpeg', 'image/png', 'image/webp']`.
* `COMPRESSION_MAX_WIDTH_PX`: `1280`.
* `COMPRESSION_MAX_HEIGHT_PX`: `1280`.
* `COMPRESSION_QUALITY`: `0.8` (Target output: ~200KB - 400KB).
* `COMPRESSION_OUTPUT_FORMAT`: `image/webp`.

## 2. PDF Document Specification
* `PAGE_SIZE`: `A4`.
* `PAGE_ORIENTATION`: `portrait`.
* `MARGIN_TOP_MM`: `15`.
* `MARGIN_BOTTOM_MM`: `15`.
* `MARGIN_HORIZONTAL_MM`: `12`.
* `ITEMS_PER_PAGE`: `3` (Strict requirement: exactly three photo cards per printed page).
* `THUMBNAIL_ASPECT_RATIO`: `4:3` or `16:9` fixed container with object-fit cover.

## 3. Storage Life-Cycle & Free Tier Limits
* `SUPABASE_FREE_STORAGE_LIMIT_MB`: `1000` (1 GB).
* `ESTIMATED_BYTES_PER_PHOTO`: `300 * 1024` (~300 KB).
* `ESTIMATED_MAX_PHOTOS_FREE_TIER`: `~3,300` photos.
* `ESTIMATED_MONTHLY_CAPACITY`: 450 photos/month (~135 MB/month) = ~7 months of retention before bulk purge recommended.