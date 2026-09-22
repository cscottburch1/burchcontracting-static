/**
 * Head metadata for the hand-authored pages, extracted from the pages
 * themselves in Phase 3.3a-ii. Their <main> bodies live in src/templates/.
 *
 * Extracted mechanically rather than retyped: every value here came out of the
 * page it belongs to, so the conversion cannot quietly reword a title or drop a
 * schema block. The snapshot proves the result.
 *
 * title and description hold PLAIN TEXT, not HTML. seoHead() escapes them on
 * the way out, so storing '&amp;' here produced '&amp;amp;' in the meta tag —
 * caught by check-build's double-encoded-ampersand assertion on the first
 * build after extraction. Entities are decoded at extraction for that reason;
 * escaping is the renderer's job, not the data's.
 *
 * `schema` holds only each page's OWN graph. Five of these pages ship a second
 * Article/Person block, which Phase 3.3c stopped storing here: trustRender()
 * builds it from the template's <h1> and the git-derived content dates, so a
 * copy here would be a derived value free to go stale. src/build/pages.mjs
 * appends it. The rendered block count is unchanged at 75.
 */
export const HAND_AUTHORED_PAGES = [
  {
    "file": "index.html",
    "title": "General Contractor in Upstate SC | Burch Contracting",
    "description": "$40-$340/sq ft: decks, additions, garages & screened porches in Upstate SC since 1995. SC Licensed #CLG118679, BBB A+ rated.",
    "canonical": "https://burchcontracting.com/",
    "ogImage": "/images/custom-deck-greenville-sc.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": [
              "LocalBusiness",
              "GeneralContractor"
            ],
            "@id": "https://burchcontracting.com/#business",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "image": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "description": "Scott Burch has built and restored homes for Upstate SC homeowners since 1995 — decks, screened porches, garages, additions, remodeling, and insurance restoration. SC Licensed #CLG118679 | NC Licensed (Limited) #107292. BBB A+ rated.",
            "telephone": "+18647244600",
            "email": "estimates@burchcontracting.com",
            "foundingDate": "1995",
            "founder": {
              "@type": "Person",
              "name": "C. Scott Burch"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1095 Water Tank Rd",
              "addressLocality": "Gray Court",
              "addressRegion": "SC",
              "postalCode": "29645",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 34.6465,
              "longitude": -82.1158
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Simpsonville"
              },
              {
                "@type": "City",
                "name": "Fountain Inn"
              },
              {
                "@type": "City",
                "name": "Mauldin"
              },
              {
                "@type": "City",
                "name": "Greenville"
              },
              {
                "@type": "City",
                "name": "Five Forks"
              },
              {
                "@type": "City",
                "name": "Woodruff"
              },
              {
                "@type": "City",
                "name": "Laurens"
              },
              {
                "@type": "City",
                "name": "Gray Court"
              }
            ],
            "priceRange": "$$",
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "5.0",
              "bestRating": "5",
              "ratingCount": "6"
            },
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "SC Contractor License",
                "value": "CLG118679"
              },
              {
                "@type": "PropertyValue",
                "propertyID": "NC Contractor License (Limited)",
                "value": "107292"
              }
            ],
            "hasCredential": [
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "license",
                "name": "SC General Contractor License #CLG118679"
              },
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "license",
                "name": "NC General Contractor License (Limited) #107292"
              }
            ]
          },
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "WebSite",
            "@id": "https://burchcontracting.com/#website",
            "url": "https://burchcontracting.com/",
            "name": "Burch Contracting",
            "publisher": {
              "@id": "https://burchcontracting.com/#business"
            },
            "inLanguage": "en-US"
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Debra Lee"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "I'm so proud of the shower replacement they did—an outstanding job! Great work. Great price."
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Tanya Towne"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "The owner was very professional and understood what I needed. The work was done in a timely manner with no complaints. His employees were polite and respectful. They cleaned up behind themselves and I was very impressed."
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Denise Majewski"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Scott's team took out our big bathtub and made it into a step-in shower. They did a fabulous job. On time every day, good follow-up, cleaned up every day, nice people to work with. The price was very fair."
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Joanie M Neely"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "Scott told me he was really busy but eager to help. He and his team worked quickly and efficiently to get us back home. Super high quality, fairness, and professionalism is what you get when you work with him."
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Gary Krause"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "This company was very professional and the timeline was amazing. Very pleased with everything. I would highly recommend them for any work you need done."
          },
          {
            "@type": "Review",
            "itemReviewed": {
              "@id": "https://burchcontracting.com/#business"
            },
            "author": {
              "@type": "Person",
              "name": "Cindy Miler"
            },
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5"
            },
            "reviewBody": "We had the best experience with Burch Contracting! Scott sent his guys over to make some improvements to our kitchen and we couldn't be happier. They all went above and beyond. Highly recommend!!"
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              }
            ]
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Is Burch Contracting a licensed general contractor?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Burch Contracting holds SC General Contractor License #CLG118679 and NC General Contractor License (Limited) #107292. Scott Burch has been a licensed residential builder since 1995 and a licensed general contractor since 2014. The company is fully insured and BBB A+ rated."
                }
              },
              {
                "@type": "Question",
                "name": "What areas does Burch Contracting serve in Upstate SC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Burch Contracting serves Simpsonville, Fountain Inn, Mauldin, Greenville, Five Forks, Woodruff, Laurens, Gray Court, and surrounding Upstate South Carolina communities."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a screened porch cost in Simpsonville SC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Screened porches in Simpsonville and surrounding areas typically run $15,000 to $65,000 for new construction. Converting an existing deck can save 50–70%."
                }
              },
              {
                "@type": "Question",
                "name": "How much does a detached garage cost in Upstate SC?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Detached two-car garages (576 sqft) in Upstate SC commonly range from $52,000 to $62,000 for a standard finish, with larger 3-car or workshop configurations (900 sqft) running $109,000 to $131,000."
                }
              },
              {
                "@type": "Question",
                "name": "Does Scott Burch work on the job site?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. When you hire Burch Contracting, you work directly with Scott Burch — not a salesperson who disappears after you sign."
                }
              },
              {
                "@type": "Question",
                "name": "Does Burch Contracting handle permits and inspections?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Burch Contracting pulls required building permits, coordinates HOA approvals when needed, and schedules inspections through local jurisdictions."
                }
              },
              {
                "@type": "Question",
                "name": "How much does insurance restoration cost?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Costs vary based on the extent of storm or water damage and the scope of repairs needed. We offer a free consultation and ballpark range. A detailed written estimate with full documentation is available for a fee, fully credited back if you hire us."
                }
              },
              {
                "@type": "Question",
                "name": "Does Burch Contracting handle ADA compliance projects?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Burch Contracting builds residential accessibility modifications (roll-in showers, grab bars, ramps) and commercial ADA compliance upgrades (entrance ramps, restroom retrofits, door widening) to meet current ADA standards."
                }
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website",
    "ogDescription": "Scott Burch has built and restored homes for Upstate SC homeowners since 1995 — decks, screened porches, garages, additions, remodeling, and insurance restoration. SC Licensed #CLG118679 | NC Licensed (Limited) #107292. BBB A+ rated. Free consultations."
  },
  {
    "file": "about.html",
    "title": "About Scott Burch | Upstate SC Contractor Since 1995",
    "description": "30+ years building in Upstate SC — meet Scott Burch, SC Licensed #CLG118679, BBB A+ since 2014, 5.0 Google rating general contractor.",
    "canonical": "https://burchcontracting.com/about",
    "ogImage": "/images/scott-burch-profile.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": [
              "LocalBusiness",
              "GeneralContractor"
            ],
            "@id": "https://burchcontracting.com/#business",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "image": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "description": "Meet C. Scott Burch — Upstate SC general contractor since 1995. SC License #CLG118679 | NC License (Limited) #107292, BBB A+ since 2014, Google 5.0. Garages, additions, decks, and screened porches.",
            "telephone": "+18647244600",
            "email": "estimates@burchcontracting.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1095 Water Tank Rd",
              "addressLocality": "Gray Court",
              "addressRegion": "SC",
              "postalCode": "29645",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 34.6465,
              "longitude": -82.1158
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Simpsonville"
              },
              {
                "@type": "City",
                "name": "Fountain Inn"
              },
              {
                "@type": "City",
                "name": "Mauldin"
              },
              {
                "@type": "City",
                "name": "Greenville"
              },
              {
                "@type": "City",
                "name": "Five Forks"
              },
              {
                "@type": "City",
                "name": "Woodruff"
              },
              {
                "@type": "City",
                "name": "Laurens"
              },
              {
                "@type": "City",
                "name": "Gray Court"
              }
            ],
            "priceRange": "$$",
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "SC Contractor License",
                "value": "CLG118679"
              },
              {
                "@type": "PropertyValue",
                "propertyID": "NC Contractor License (Limited)",
                "value": "107292"
              }
            ]
          },
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "About",
                "item": "https://burchcontracting.com/about"
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website"
  },
  {
    "file": "contact.html",
    "title": "Get a Free Consultation | Simpsonville SC Contractor | Burch Contracting",
    "description": "30+ years in Upstate SC — free consultation from Burch Contracting. Decks, additions, garages, remodeling.",
    "canonical": "https://burchcontracting.com/contact",
    "ogImage": "/images/burch-contracting-logo.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": [
              "LocalBusiness",
              "GeneralContractor"
            ],
            "@id": "https://burchcontracting.com/#business",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "image": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "description": "Request a free consultation from Burch Contracting. Garages, additions, decks, screened porches, and remodeling in Upstate SC. SC Licensed #CLG118679 | NC Licensed (Limited) #107292.",
            "telephone": "+18647244600",
            "email": "estimates@burchcontracting.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1095 Water Tank Rd",
              "addressLocality": "Gray Court",
              "addressRegion": "SC",
              "postalCode": "29645",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 34.6465,
              "longitude": -82.1158
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Simpsonville"
              },
              {
                "@type": "City",
                "name": "Fountain Inn"
              },
              {
                "@type": "City",
                "name": "Mauldin"
              },
              {
                "@type": "City",
                "name": "Greenville"
              },
              {
                "@type": "City",
                "name": "Five Forks"
              },
              {
                "@type": "City",
                "name": "Woodruff"
              },
              {
                "@type": "City",
                "name": "Laurens"
              },
              {
                "@type": "City",
                "name": "Gray Court"
              }
            ],
            "priceRange": "$$",
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "SC Contractor License",
                "value": "CLG118679"
              },
              {
                "@type": "PropertyValue",
                "propertyID": "NC Contractor License (Limited)",
                "value": "107292"
              }
            ]
          },
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Contact",
                "item": "https://burchcontracting.com/contact"
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website"
  },
  {
    "file": "services.html",
    "title": "Services & Pricing | Burch Contracting",
    "description": "Every Burch Contracting service compared: cost range, timeline & permit status. SC Licensed #CLG118679, BBB A+, free consultations.",
    "canonical": "https://burchcontracting.com/services",
    "ogImage": "/images/custom-deck-greenville-sc.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": [
              "LocalBusiness",
              "GeneralContractor"
            ],
            "@id": "https://burchcontracting.com/#business",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "image": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "description": "Garage construction, room additions, screened porches, decks, remodeling, commercial upfits, commercial roofing, insurance restoration, and ADA compliance in Upstate SC. Transparent pricing. SC Licensed #CLG118679 | NC Licensed (Limited) #107292.",
            "telephone": "+18647244600",
            "email": "estimates@burchcontracting.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1095 Water Tank Rd",
              "addressLocality": "Gray Court",
              "addressRegion": "SC",
              "postalCode": "29645",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 34.6465,
              "longitude": -82.1158
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Simpsonville"
              },
              {
                "@type": "City",
                "name": "Fountain Inn"
              },
              {
                "@type": "City",
                "name": "Mauldin"
              },
              {
                "@type": "City",
                "name": "Greenville"
              },
              {
                "@type": "City",
                "name": "Five Forks"
              },
              {
                "@type": "City",
                "name": "Woodruff"
              },
              {
                "@type": "City",
                "name": "Laurens"
              },
              {
                "@type": "City",
                "name": "Gray Court"
              }
            ],
            "priceRange": "$$",
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "SC Contractor License",
                "value": "CLG118679"
              },
              {
                "@type": "PropertyValue",
                "propertyID": "NC Contractor License (Limited)",
                "value": "107292"
              }
            ]
          },
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Services",
                "item": "https://burchcontracting.com/services"
              }
            ]
          },
          {
            "@type": "Person",
            "@id": "https://burchcontracting.com/#scott-burch",
            "name": "C. Scott Burch",
            "jobTitle": "General Contractor",
            "hasCredential": [
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "license",
                "recognizedBy": {
                  "@type": "Organization",
                  "name": "South Carolina LLR"
                },
                "identifier": "CLG118679"
              },
              {
                "@type": "EducationalOccupationalCredential",
                "credentialCategory": "license",
                "recognizedBy": {
                  "@type": "Organization",
                  "name": "North Carolina Licensing Board for General Contractors"
                },
                "identifier": "107292"
              }
            ]
          },
          {
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "How do I get a free consultation and ballpark estimate?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Call (864) 724-4600 or use the contact form to describe your project. Scott Burch will discuss your goals and provide a free ballpark price range. A detailed written estimate, concept drawings, or floor plans are available for a fee, fully credited back if you hire us."
                }
              },
              {
                "@type": "Question",
                "name": "What areas does Burch Contracting serve?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Simpsonville, Fountain Inn, Mauldin, Greenville, Five Forks, Woodruff, Laurens, Gray Court, and surrounding Upstate SC communities."
                }
              },
              {
                "@type": "Question",
                "name": "Is Burch Contracting licensed and insured?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. Burch Contracting holds SC General Contractor License #CLG118679 and NC General Contractor License (Limited) #107292, is fully insured, and is BBB A+ rated."
                }
              },
              {
                "@type": "Question",
                "name": "Does Burch Contracting handle permits and inspections?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes. We pull required building permits, coordinate HOA approvals when needed, and schedule inspections through local jurisdictions for every project we build."
                }
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website"
  },
  {
    "file": "projects.html",
    "title": "Recent Projects | Burch Contracting Upstate SC",
    "description": "14 real completed projects: decks, garages, additions & remodels across Upstate SC. SC Licensed #CLG118679, BBB A+.",
    "canonical": "https://burchcontracting.com/projects",
    "ogImage": "/images/room-addition-fountain-inn-sc.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": [
              "LocalBusiness",
              "GeneralContractor"
            ],
            "@id": "https://burchcontracting.com/#business",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "image": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "description": "Recent decks, screened porches, garages, room additions, remodeling, and commercial projects by Burch Contracting across Upstate SC. SC Licensed #CLG118679 | NC Licensed (Limited) #107292.",
            "telephone": "+18647244600",
            "email": "estimates@burchcontracting.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "1095 Water Tank Rd",
              "addressLocality": "Gray Court",
              "addressRegion": "SC",
              "postalCode": "29645",
              "addressCountry": "US"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": 34.6465,
              "longitude": -82.1158
            },
            "openingHours": "Mo-Fr 08:00-17:00",
            "areaServed": [
              {
                "@type": "City",
                "name": "Simpsonville"
              },
              {
                "@type": "City",
                "name": "Fountain Inn"
              },
              {
                "@type": "City",
                "name": "Mauldin"
              },
              {
                "@type": "City",
                "name": "Greenville"
              },
              {
                "@type": "City",
                "name": "Five Forks"
              },
              {
                "@type": "City",
                "name": "Woodruff"
              },
              {
                "@type": "City",
                "name": "Laurens"
              },
              {
                "@type": "City",
                "name": "Gray Court"
              }
            ],
            "priceRange": "$$",
            "identifier": [
              {
                "@type": "PropertyValue",
                "propertyID": "SC Contractor License",
                "value": "CLG118679"
              },
              {
                "@type": "PropertyValue",
                "propertyID": "NC Contractor License (Limited)",
                "value": "107292"
              }
            ]
          },
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Projects",
                "item": "https://burchcontracting.com/projects"
              }
            ]
          }
        ]
      }
    ],
    "scripts": [
      "/src/js/projects.js"
    ],
    "ogType": "website"
  },
  {
    "file": "privacy-policy.html",
    "title": "Privacy Policy | Burch Contracting",
    "description": "Privacy Policy for Burch Contracting — how we collect, use, and protect information submitted through our website.",
    "canonical": "https://burchcontracting.com/privacy-policy",
    "ogImage": "/images/burch-contracting-logo.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Privacy Policy",
                "item": "https://burchcontracting.com/privacy-policy"
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website"
  },
  {
    "file": "terms-of-service.html",
    "title": "Terms of Service | Burch Contracting",
    "description": "Terms of Service for Burch Contracting — terms governing use of our website and consultation requests.",
    "canonical": "https://burchcontracting.com/terms-of-service",
    "ogImage": "/images/burch-contracting-logo.webp",
    "schema": [
      {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": "https://burchcontracting.com/#organization",
            "name": "Burch Contracting",
            "url": "https://burchcontracting.com/",
            "logo": "https://burchcontracting.com/images/burch-contracting-logo.webp",
            "sameAs": [
              "https://share.google/punCyIgljtaPkt03e",
              "https://www.facebook.com/BurchContracting",
              "https://www.instagram.com/burchcontracting",
              "https://www.linkedin.com/company/burch-contracting",
              "https://www.bbb.org/us/sc/gray-court/profile/home-additions/burch-contracting-llc-0673-90007875"
            ]
          },
          {
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://burchcontracting.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Terms of Service",
                "item": "https://burchcontracting.com/terms-of-service"
              }
            ]
          }
        ]
      }
    ],
    "scripts": [],
    "ogType": "website"
  }
]
