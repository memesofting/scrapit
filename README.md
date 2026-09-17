# Polite Scrapper

## Target classification
### Site
- https://books.toscrape.com/

### Scope
- First three catalogue pages 


I will not reuse this code on another site without checking its rules and terms first."

### Test
- CORRECT
- curl -X POST http://localhost:4000/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "title": "A Light in the Attic",
    "description": "It's hard to imagine a world without A Light in the Attic. This now-classic collection of poetry and drawings from Shel Silverstein "
  }'

- BAD
- curl -X POST http://localhost:4000/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "title": "A Light in the Attic",
    "name": "John wick"
  }'