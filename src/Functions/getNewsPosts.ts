import { loadingStateEnum } from "../types";

export async function getNewsPosts(): Promise<{result: loadingStateEnum.failed} | {result: loadingStateEnum.success, data: newsPost[], nextLink?: string|undefined}> {
  const result = await fetch('https://public-api.wordpress.com/rest/v1.1/sites/thecrusadernews.ca/posts/');
  if (result.ok) {
    const data = await result.json();
    var outputPosts: newsPost[] = [];
    for (var index = 0; index < data['posts'].length; index += 1) {
      outputPosts.push({
        title: data['posts'][index]['title'],
        excerpt: data['posts'][index]['excerpt'],
        content: data['posts'][index]['content'],
        id: data['posts'][index]['id']
      })
    }
    return {result: loadingStateEnum.success, data: outputPosts, nextLink: data['meta']['next_page']}
  } else {
    return {result: loadingStateEnum.failed}
  }
}