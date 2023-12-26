import { loadingStateEnum } from '@constants';

export default async function getYoutubeVideos(
  pageToken: string | undefined = undefined,
): Promise<
  | {
      result: loadingStateEnum.success;
      data: youtubeVideoType[];
      nextPageToken?: undefined | string;
    }
  | { result: loadingStateEnum.failed }
> {
  const result = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=UU8HbRWjbR0xjOeE6OlQ1sLA&part=contentDetails,id,snippet${
      pageToken ? `&pageToken=${pageToken}` : ''
    }&key=AIzaSyAeyX34-ADpLxnfUIJk_osy5pgCvO3MtTY`,
  );
  if (result.ok) {
    const data = await result.json();
    const resultData: youtubeVideoType[] = [];
    for (let index = 0; index < data.items.length; index += 1) {
      resultData.push({
        thumbnail: data.items[index].snippet.thumbnails.high.url,
        title: data.items[index].snippet.title,
        videoId: data.items[index].contentDetails.videoId,
      });
    }
    return {
      result: loadingStateEnum.success,
      data: resultData,
      nextPageToken: data.nextPageToken,
    };
  }
  return { result: loadingStateEnum.failed };
}
