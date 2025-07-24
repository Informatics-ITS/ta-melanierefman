import { useTranslation } from "react-i18next";
import { Typography } from "../../../atom/typography";
import { MateriProps } from "../../../../entities/materi";

type DocProps = {
  data: MateriProps[];
};

const Doc: React.FC<DocProps> = ({ data }) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const baseUrl = `${import.meta.env.VITE_API_BASE_URL}/storage/`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {data.map((item) => {
        const downloadUrl = item.file
          ? `${baseUrl}${item.file}`
          : "#";

        return (
          <div
            key={item.id}
            className="flex flex-col h-full"
          >
            <a
              href={downloadUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 flex-col"
            >
              <div className="aspect-[16/9] w-full mb-3 overflow-hidden rounded-xl border-2 border-typo-outline">
                <img
                  className="w-full h-full object-cover"
                  src={item.thumbnail ? `${import.meta.env.VITE_API_BASE_URL}/storage/${item.thumbnail}` : "/no-image.png"}
                  alt={item.title}
                />
              </div>
              
              <div className="flex-grow flex flex-col justify-between">
                <div className="space-y-2">
                  <Typography
                    type="body"
                    weight="semibold"
                    className="text-center line-clamp-2"
                  >
                    {lang === "id" ? item.judul : item.title}
                  </Typography>
                  
                  <div className="flex flex-wrap justify-center gap-2 text-center">
                    <Typography type="caption1" font="dm-sans" className="text-primary">
                      {lang === "id" ? item.kata_kunci : item.keyword}
                    </Typography>
                  </div>
                </div>
              </div>
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default Doc;