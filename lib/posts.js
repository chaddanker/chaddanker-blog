import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import remark from 'remark'
import html from 'remark-html'

const postsDirectory = path.join(process.cwd(), 'posts')

export function getSortedPostsData() {
    // get filenames under /posts
    const fileNames = fs.readdirSync(postsDirectory)
    const allPostsData = fileNames.map(fileName => {
        // remove .md from file to get id
        const id = fileName.replace(/\.md$/, '')
        // read markdown file as string
        const fullPath = path.join(postsDirectory, fileName)
        const fileContents = fs.readFileSync(fullPath, 'utf-8')
        // use gray matter to parse the post metadata section
        const matterResult = matter(fileContents)

        //combiine the data with the id
        return {
            id, 
            ...matterResult.data
        }
    })

    // sort posts by date
    return allPostsData.sort((a, b) => {
        if(a.date < b.date) {
            return 1
        } else {
            return -1
        }
    })
}

export function getAllPostsIds() {
    const fileNames = fs.readdirSync(postsDirectory)

    // returns an array that looks like: 
    // [
    //      {
    //          params: { 
    //              id: 'ssg-ssr' 
    //          }
    //      },
    // ]...

    return fileNames.map(fileName => {
        return {
            params: {
                id: fileName.replace(/\.md$/, '')
            }
        }
    })
}
// Important: The returned list is not just an array of strings — it must be an array of objects that look like the comment above. Each object must have the params key and contain an object with the id key (because we’re using [id] in the file name). Otherwise, getStaticPaths will fail.

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`)
    const fileContents = fs.readFileSync(fullPath, 'utf-8')

    // Use gray-matter to parse the post metadata section
    const matterResult = matter(fileContents)

    // use remark to convert remark to html string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content)
    const contentHtml = processedContent.toString()

    // Combine the data with the id
    return {
    id,
    contentHtml,
    ...matterResult.data
    }
}