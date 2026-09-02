import axios from "axios";
import fs, { readFile } from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'
import * as z from 'zod'
import { title } from "node:process";
import { promises } from "node:dns";

const baseUrl = 'https://books.toscrape.com/'

const baseCachePath = 'cache/'
const cachePath = 'cache/catalogue-page-1.html';

const pages = [];
const bookDetails = [];

const pageCache = async (url, cache) => {
    try {
        const books = await axios.get(url, {
            timeout: 5000,
            headers: {
                "User-Agent": "FlyRankInternship-A9/1.0 (https://github.com/memesofting/scrapit)"
            }
        });
        if (books.status === 200) {
            // console.log(books.data)
            await fs.promises.writeFile(cache, books.data, 'utf-8')
        }
    } catch (error) {
        console.log(error)
        // throw error
    };
}


const fetchOrReadCache = async () => {
    if (fs.existsSync(cachePath)) {
        // read cache
        console.log('CACHE HIT')
        await cheerioPageParse(cachePath);
    }
    else {
        console.log('FETCH')
        await pageCache(baseUrl, cachePath)
        await cheerioPageParse(cachePath);
    }
}

const cheerioPageParse = async (cache) => {
    const links = []
    const page = await fs.promises.readFile(cache, 'utf-8')
    const $ = cheerio.load(page)
    const books_class = $('.product_pod')
    // const book_links = books.find('a').attr('href')
    const book_links = books_class.find('a').attr('href')
    // console.log(book_links)
    books_class.each((_, el) => {
        const url = new URL($(el).find('a').attr('href'), baseUrl)
        links.push(url.href)
    })
    // console.log(links)
    pages.push(links)
    console.log(links.length)
    // console.log(pages)
    console.log(pages.length)

    const currentPage = Number($('.current').text().trim().split(' ')[1])
    if (currentPage == 3) {
        return
    }
    const nextPageHref = $('.next a').attr('href').replace('catalogue/', '');
    const nextPage = 'catalogue/' + nextPageHref
    const nextPageUrl = new URL(nextPage, baseUrl).href
    console.log(`Next page: ${nextPage}`)
    const newPath = path.join(baseCachePath, nextPage.replaceAll('/', '-'))

    console.log(`Next cache path: ${newPath}`)
    console.log(`currentPage : ${currentPage}`)
    if (fs.existsSync(newPath)) {
        console.log(`CACHE HIT ${currentPage}`)
        await cheerioPageParse(newPath)
    } else {
        // cache page

        console.log({
            nextPage,
            newPath,
            nextUrl: new URL(nextPage, baseUrl).href
        });
        await pageCache(nextPageUrl, newPath)
        await cheerioPageParse(newPath)
    }
}

await fetchOrReadCache();
// const bookPageLinks = pages.flat();
// console.log(bookPageLinks)

const validateBook = (bookObj) => {
    const Book = z.object({
        title: z.string(),
        product_url: z.string(),
        price_text: z.string(),
        price_gbp: z.number(),
        availability_text: z.string(),
        rating_text: z.string(),
        description: z.string(),
        source_page: z.string(),
        fetched_at: z.string()
    })

    const result = Book.safeParse(bookObj)
    if (result.success) {
        return result.data
    } else {
        return result.error
    }
}

const getAllBookDetails = async (links) => {
    for (let i = 0; i < links.length; i++) {
        for (let j = 0; j < links[i].length; j++) {
            const cacheFile = `books_cache/page${i}-${j}.html`
            if (fs.existsSync(cacheFile)) {
                // console.log(`BOOK PAGE: ${cacheFile} HIT`)
                const cache = await fs.promises.readFile(cacheFile, 'utf-8')
                const $ = cheerio.load(cache)
                const description = $('#product_description').next().text() ? $('#product_description').next().text() : null
                const ratingClass = $('.star-rating').attr('class');
                const availability = $('.product_main .instock.availability').text();
                const rating = ratingClass.split(' ')[1];
                const fetched_at = new Date().toISOString();
                const details = $.extract(
                    {
                        title: 'h1',
                        price_text: '.price_color',
                        // availability_text: '.instock.availability'
                    }
                )
                // console.log(availability)
                // console.log($('.product_main .instock.availability').length)
                details.price_gbp = Number(details.price_text.slice(1, details.price_text.length))
                details.product_url = links[i][j]
                details.availability_text = availability.trim()
                details.rating_text = rating
                details.description = description
                details.source_page = `https://books.toscrape.com/catalogue/page-${i}.html`
                details.fetched_at = fetched_at

                const validate = validateBook(details)
                bookDetails.push(details)
            } else {
                const pageLink = links[i][j].split('/')
                const cleanPageLink = `${baseUrl}/catalogue/${pageLink[pageLink.length - 2]}/${pageLink[pageLink.length - 1]}`
                // pageCache(links[i][j], cacheFile)
                await pageCache(cleanPageLink, cacheFile)
            }
        }

    }
}



await getAllBookDetails(pages)
// console.log(bookDetails)

const bookJson = JSON.stringify(bookDetails)
// console.log(bookJson)
console.log(`No of books: ${bookDetails.length}`)

if (fs.existsSync('output/books.json')) {
    console.log('Books.json already exists')
} else {
    await fs.promises.writeFile('output/books.json', bookJson, 'utf-8')
}