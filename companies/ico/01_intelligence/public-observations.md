# Public observations

Date: 3 June 2026  
Target: `https://www.icoterminals.com`

## Identity

Firecrawl search confirmed the target as International Car Operators:

- `https://www.icoterminals.com/en`
- LinkedIn: `https://be.linkedin.com/company/international-car-operators`

## Technology

Wappalyzer result:

```text
No of apps detected 1
Google Tag Manager
```

HTTP response headers from `curl -I https://www.icoterminals.com/en`:

```http
HTTP/2 200
server: nginx
content-type: text/html; charset=UTF-8
cache-control: max-age=3600, public
x-drupal-dynamic-cache: UNCACHEABLE
content-language: en
x-content-type-options: nosniff
x-frame-options: SAMEORIGIN
x-drupal-cache: MISS
```

Not observed in the response:

```http
strict-transport-security
content-security-policy
referrer-policy
permissions-policy
```

## Sitemap and robots

`robots.txt` includes Drupal defaults and disallows administrative/user routes:

```text
Disallow: /admin/
Disallow: /user/register
Disallow: /user/password
Disallow: /user/login
```

It also contains the default example sitemap comment:

```text
# Sitemap: https://www.example.com/sitemap.xml
```

The actual sitemap exists:

```text
https://www.icoterminals.com/sitemap.xml
```

## Cookie statement

The cookie statement contains a likely template error:

```text
pages of fujioilghana.com
```

It also lists `_ga`, `_gid` and `_gat` below "Functional & statistical cookies".

## Contact form

The contact form asks users to accept the privacy policy and points to:

```text
https://www.icoterminals.com/en/node/4
```

Footer canonical privacy URL:

```text
https://www.icoterminals.com/en/privacy-policy
```

