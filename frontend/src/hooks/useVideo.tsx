import { MateriProps } from "../entities/materi";

export const useVideo = (data: MateriProps[]) => {

  const getYouTubeId = (url: string) => {
    const match = url.match(
      /(?:https?:\/\/)?(?:www\.)?youtu(?:be\.com\/(?:[^\/\n\s]+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const getLatestVideo = () => {
    if (!Array.isArray(data)) return null;

    const videos = data.filter(item => item.type === "video");

    if (videos.length === 0) return null;

    return videos.sort((a, b) => {
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return timeB - timeA;
    })[0];
  };

  const getLatestVideos = () => {
    if (!Array.isArray(data)) return [];
    
    return [...data]
      .filter(item => item.type === "video" && item.youtube_link)
      .sort((a, b) => {
        const timeA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const timeB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return timeB - timeA;
      })
      .slice(0, 3);
  };

  return {
    getYouTubeId,
    getLatestVideo,
    getLatestVideos,
  };
};