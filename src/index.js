import axios from "axios";
import fs, { readFile } from 'node:fs'
import * as cheerio from 'cheerio'

const books_url = 'https://books.toscrape.com/'

const cachePath = 'cache/catalogue-page-1.html';

const pages = [];

const page_scrape = async(url) =>{
    try {
        const books = await axios.get(url, {
            timeout: 10000,
            headers:{
                "User-Agent": "FlyRankInternship-A9/1.0 (https://github.com/memesofting/scrapit)"
            }
        });
        if (books.status === 200){
            // console.log(books.data)
            await fs.promises.writeFile(cachePath, books.data, 'utf-8')
        }
    } catch(error){
        console.log(error)
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
        page_scrape(books_url)
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
        const url = new URL($(el).find('a').attr('href'), books_url)
        links.push(url.href)
    })
    // console.log(links)
    pages.push(links)
    console.log(pages)

    const nextPage = $('.next a').attr('href');
    console.log(nextPage)
    // if (fs.existsSync('cache/' + nextPage)){
    //     cheerioPageParse(nextPage)
    // }else{}
}

fetchOrReadCache();
// await cheerioPageParse();
// console.log(pages)