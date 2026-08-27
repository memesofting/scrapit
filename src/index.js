import axios from "axios";
import fs from 'node:fs/promises'

const books_url = 'https://books.toscrape.com/'


const robot_scrape = async(url) =>{
    const books = await axios.get(url, {timeout: 6000});
    console.log(books.data)
    await fs.writeFile('index.html', books.data, 'utf-8')
}

robot_scrape(books_url)