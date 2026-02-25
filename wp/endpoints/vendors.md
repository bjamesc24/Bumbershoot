# Custom Post Type: Vendors / Booths

## Overview

The `vendor` post type represents food vendors, merchandise booths, art vendors, sponsor activations, and other commercial or community presences at Bumbershoot. Vendor posts are linked to map locations so users can find them on the festival grounds.

Like venues, vendor data is **mostly static** during the festival. The app should refresh it daily or on open, not on the 30-minute schedule cadence.

---

## CPT Registration

**Post Type Slug:** `bumbershoot_vendor`  
**Custom Endpoint:** `wp-json/bumbershoot/v1/vendors`

### CPT UI Settings

| Setting | Value |
|---|---|
| Post Type Slug | `bumbershoot_vendor` |
| Plural Label | Vendors |
| Singular Label | Vendor |
| Public | Yes |
| Has Archive | No |
| Show in REST | Yes |
| Menu Icon | `dashicons-store` |
| Supports | Title, Editor (description), Thumbnail |

---

## Fields

### Identity & Classification Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Vendor Type | `vendor_type` | Select | ✅ | See type options below |
| Booth / Location Name | `vendor_booth_name` | Text | ❌ | e.g., "Booth 14B" or "Food Court Row A" — displayed on map if set |
| Short Description | `vendor_description_short` | Textarea | ✅ | Max 200 chars; used in list and map popup |
| Full Description | `vendor_description_full` | WYSIWYG / Textarea | ❌ | Used in vendor detail screen |
| Logo / Photo | (WP native Featured Image) | Image | ❌ | Used as thumbnail; 400×400px minimum |

### Location Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Map Venue / Area | `vendor_venue` | Post Object | ❌ | Links to a `bumbershoot_venue` post for the area/zone |
| Exact Latitude | `vendor_lat` | Number | ❌ | Use if the vendor needs a precise pin separate from the zone |
| Exact Longitude | `vendor_lng` | Number | ❌ | Use if the vendor needs a precise pin separate from the zone |

> If `vendor_lat`/`vendor_lng` are set, they take precedence for map pin placement. If only `vendor_venue` is set, the vendor pin inherits the venue's coordinates. At least one location reference should be set.

### Operational Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Operating Hours | `vendor_hours` | Textarea | ❌ | Plain text; e.g., "Day 1: 11am–10pm / Day 2: 11am–10pm" |
| Payment Methods | `vendor_payment_methods` | Checkbox | ❌ | Options: `cash`, `card`, `mobile-pay` |
| Is Accessible | `vendor_is_accessible` | True/False | ✅ | Booth accessible to wheelchair users |
| Festival Days Active | `vendor_days_active` | Checkbox | ✅ | `day-1`, `day-2`, `day-3` |
| Is Active | `vendor_is_active` | True/False | ✅ | Set to false to hide without deleting |

### Food-Specific Fields (shown when `vendor_type` is `food` or `beverage`)

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Cuisine Type | `vendor_cuisine` | Text | ❌ | e.g., "Thai street food", "BBQ", "Vegan" |
| Dietary Options | `vendor_dietary_options` | Checkbox | ❌ | `vegan`, `vegetarian`, `gluten-free`, `halal`, `kosher` |
| Approximate Price Range | `vendor_price_range` | Select | ❌ | `$`, `$$`, `$$$` |

### Sponsor / External Link Fields

| Field Label | Field Name | Field Type | Required | Notes |
|---|---|---|---|---|
| Website URL | `vendor_website_url` | URL | ❌ | |
| Instagram URL | `vendor_instagram_url` | URL | ❌ | |
| Is Sponsor | `vendor_is_sponsor` | True/False | ❌ | Marks official Bumbershoot sponsors; may affect display treatment |
| Sponsor Tier | `vendor_sponsor_tier` | Select | ❌ | `presenting`, `gold`, `silver`, `community`; only relevant if `is_sponsor` is true |

---

## Vendor Type Options

| Value | Label |
|---|---|
| `food` | Food Vendor |
| `beverage` | Beverage / Bar |
| `merchandise` | Merchandise (Festival) |
| `artist-merch` | Artist Merchandise |
| `art-vendor` | Art Vendor / Gallery |
| `sponsor-activation` | Sponsor Activation |
| `nonprofit` | Nonprofit / Community |
| `info` | Information / Services |
| `other` | Other |

---

## Sample JSON Output

```json
{
  "id": 401,
  "title": "Marination",
  "slug": "marination",
  "type": "food",
  "booth_name": "Food Court Row A, Booth 3",
  "description_short": "Seattle-based Hawaiian-Korean fusion with kalua pork sliders, kimchi fried rice, and spam musubi.",
  "description_full": "Marination has been a Seattle street food staple since 2009...",
  "cuisine": "Hawaiian-Korean fusion",
  "dietary_options": ["gluten-free"],
  "price_range": "$$",
  "operating_hours": "Day 1–3: 11:00 AM – 9:00 PM",
  "payment_methods": ["cash", "card", "mobile-pay"],
  "is_accessible": true,
  "days_active": ["day-1", "day-2", "day-3"],
  "is_active": true,
  "is_sponsor": false,
  "sponsor_tier": null,
  "venue_id": 8,
  "lat": 47.6207,
  "lng": -122.3512,
  "website_url": "https://www.marinationmobile.com",
  "instagram_url": "https://www.instagram.com/marinationmobile",
  "thumbnail_url": "https://cms.bumbershoot.com/wp-content/uploads/marination.jpg"
}
```

See `wp/sample-data/vendors.sample.json` for a full dataset.

---

## Editorial Notes

- **One post per vendor.** If a vendor operates in two locations, consider two posts with distinct `booth_name` values.
- **Food vendors from Seattle** are strongly preferred for Bumbershoot's local identity — note `is_local` logic if needed.
- **Sponsors** should all have `is_sponsor: true` set. Work with the client's sponsorship contact to confirm tiers.
- **`vendor_is_active`** should be used to manage vendors who drop out before or during the festival — don't delete posts.
- Dietary options and price range are optional but highly valued by attendees — encourage content entry for food vendors.
