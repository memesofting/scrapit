import axios from "axios";
import fs from 'node:fs'

const books_url = 'https://books.toscrape.com/'

const cachePath = 'cache/catalogue-page-1.html';

const robot_scrape = async(url) =>{
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


const fetchOrReadCache = async()=>{
    if (fs.existsSync(cachePath)){
        // read cache
        console.log('CACHE HIT')
    }
    else{
        console.log('FETCH')
        robot_scrape(books_url)
    }
}

fetchOrReadCache();