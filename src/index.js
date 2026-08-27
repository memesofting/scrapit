import axios from "axios";
import fs from 'node:fs/promises'

const books_url = 'https://books.toscrape.com/'


const robot_scrape = async(url) =>{
    try {
        const books = await axios.get(url, {
            timeout: 6000,
            headers:{
                "User-Agent": "FlyRankInternship-A9/1.0 (https://github.com/memesofting/scrapit)"
            }
        });
        if (books.status === 200){
            // console.log(books.data)
            await fs.writeFile('cache/catalogue-page-1.html', books.data, 'utf-8')
        }
    } catch(error){
        console.log(error)
    };
}

robot_scrape(books_url)