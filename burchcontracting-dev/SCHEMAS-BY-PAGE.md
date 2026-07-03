# JSON-LD Structured Data - Quick Reference
**What's on each page**

## Main Pages

### index.html
```
✓ LocalBusiness/GeneralContractor (with aggregateRating, openingHours, geo, identifier)
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ WebSite
✓ 6x Review (Debra Lee, Tanya Towne, Denise Majewski, Joanie M Neely, Gary Krause, Cindy Miler)
✓ FAQPage (6 questions)
```

### services.html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > Services)
✓ 6x Service (Deck, Screened Porch, Garage, Room Addition, Remodeling, Commercial)
✓ FAQPage (7 questions)
```

### faqs.html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > FAQs)
✓ FAQPage (15 questions)
```

### about.html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > About)
```

### projects.html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > Projects)
```

### contact.html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > Contact)
```

---

## Service-Area Pages (9 files)

**All service-area pages follow this pattern:**

### service-areas/[city].html
```
✓ LocalBusiness/GeneralContractor (@id: #business)
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > Service Areas > [City])
✓ Service (references @id: #business)
✓ FAQPage (5 city-specific questions)
```

**Files:**
- simpsonville.html
- fountain-inn.html
- mauldin.html
- greenville.html
- five-forks.html
- woodruff.html
- laurens.html
- gray-court.html

---

## Calculator Pages (4 files)

**All calculator pages follow this pattern:**

### calculator/[service].html
```
✓ LocalBusiness/GeneralContractor
✓ Organization (sameAs: PLACEHOLDER URLs)
✓ BreadcrumbList (Home > Services > [Service Type] > Calculator)
```

**Files & Breadcrumbs:**
- **decks.html:** Home > Services > Decks > Calculator
- **garages.html:** Home > Services > Garages > Calculator
- **additions.html:** Home > Services > Room Additions > Calculator
- **porch.html:** Home > Services > Screened Porches > Calculator

---

## Required Action: Replace Placeholders

**Find & replace these in ALL 23 HTML files:**

1. `PLACEHOLDER_GOOGLE_BUSINESS_PROFILE_URL`  
   → Your Google Business Profile URL

2. `PLACEHOLDER_FACEBOOK_URL`  
   → Your Facebook page URL

3. `PLACEHOLDER_BBB_URL`  
   → Your BBB profile URL

**Command to find placeholders:**
```bash
grep -l "PLACEHOLDER_" *.html service-areas/*.html calculator/*.html
```

---

## Validation Concerns

### ⚠️ Potential Google Rich Results Test Issues:

1. **Organization.sameAs placeholders** - Will fail until real URLs added
2. **Review schemas lack datePublished** - Optional but recommended for rich snippets

### ✅ Should Pass Validation:

- LocalBusiness (all required fields present)
- FAQPage (proper Question/Answer structure)
- BreadcrumbList (valid itemListElement arrays)
- Service (proper serviceType and provider references)

---

## Schema Totals

| Schema Type | Total | Notes |
|-------------|-------|-------|
| LocalBusiness | 23 | Every page |
| Organization | 23 | Every page (needs URL fixes) |
| BreadcrumbList | 22 | All except index.html |
| FAQPage | 12 | index, services, faqs, 9 service-areas |
| Service | 15 | services (6), 9 service-areas (1 each) |
| Review | 6 | index.html only |
| WebSite | 1 | index.html only |
| **TOTAL** | **102** | Across 23 pages |
