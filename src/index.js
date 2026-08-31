import axios from "axios";
import fs, { readFile } from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const baseUrl = 'https://books.toscrape.com/'

const baseCachePath = 'cache/'
const cachePath = 'cache/catalogue-page-1.html';

const pages = [];

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

fetchOrReadCache();