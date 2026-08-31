import axios from "axios";
import fs, { readFile } from 'node:fs'
import path from 'node:path'
import * as cheerio from 'cheerio'

const baseUrl = 'https://books.toscrape.com/'

const baseCachePath = 'cache/'
const cachePath = 'cache/catalogue-page-1.html';

const pages = [];

const pageCache = async(url, cache) =>{
    try {
        const books = await axios.get(url, {
            timeout: 10000,
            headers:{
                "User-Agent": "FlyRankInternship-A9/1.0 (https://github.com/memesofting/scrapit)"
            }
        });
        if (books.status === 200){
            // console.log(books.data)
            await fs.promises.writeFile(cache, books.data, 'utf-8')
        }
    } catch(error){
        console.log(error)
        // throw error
    };
}


const fetchOrReadCache = ()=>{
    if (fs.existsSync(cachePath)){
        // read cache
        console.log('CACHE HIT')
        cheerioPageParse(cachePath);
    }
    else{
        console.log('FETCH')
        pageCache(baseUrl, cachePath)
    }
}

const cheerioPageParse = async(cache)=>{
    const links = []
    const page = await fs.promises.readFile(cache, 'utf-8')
    const $ = cheerio.load(page)
    const books_class = $('.product_pod')
    // const book_links = books.find('a').attr('href')
    const book_links = books_class.find('a').attr('href')
    // console.log(book_links)
    books_class.each((_, el)=>{
        const url = new URL($(el).find('a').attr('href'), baseUrl)
        links.push(url.href)
    })
    // console.log(links)
    pages.push(links)
    console.log(pages)

    const currentPage = Number($('.current').text().trim().split(' ')[1])
    if (currentPage == 3){
        return
    }
    const nextPage = $('.next a').attr('href');
    const nextPageUrl = new URL(nextPage, baseUrl).href
    console.log(nextPage)
    const newPath = path.join(baseCachePath, nextPage.replaceAll('/', '-'))
    // console.log(new URL(nextPage, baseUrl).href)
    console.log(newPath)
    console.log(`currentPage : ${currentPage}`)
    if (fs.existsSync(newPath)){
        console.log(`CACHE HIT ${currentPage}`)
        await cheerioPageParse(newPath)
    }else{
        // cache page

        // console.log({
        // nextPage,
        // newPath,
        // nextUrl: new URL(nextPage, baseUrl).href
        // });
        await pageCache(nextPageUrl, newPath)
        await cheerioPageParse(newPath)
    }
}

fetchOrReadCache();
// await cheerioPageParse();
// console.log(pages)