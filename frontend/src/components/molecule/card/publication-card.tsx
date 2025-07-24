import { useTranslation } from 'react-i18next';

import { Button } from '../../atom/button';
import { Typography } from '../../atom/typography';

import { PublikasiProps } from '../../../entities/publikasi';

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';

interface PublicationCardProps {
  data: (PublikasiProps & { research?: any })[];
  variant?: 'default' | 'no-citation';
}

const PublicationCard: React.FC<PublicationCardProps> = ({ data, variant = 'default' }) => {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const getLocalizedRoute = useLocalizedRoute();

  const formatCitation = (item: PublikasiProps) => {
    const formatAuthors = (authors: string) => {
      const authorList = authors
        .split(", ")
        .map((author) => {
          const nameParts = author.trim().split(" ");
          const lastName = nameParts.pop();
          const initials = nameParts.map((name) => name[0] + ".").join(" ");
          return `${lastName}, ${initials}`;
        });

      const numAuthors = authorList.length;

      if (numAuthors === 1) {
        return authorList[0];
      } else if (numAuthors === 2) {
        return `${authorList[0]}, & ${authorList[1]}`;
      } else if (numAuthors >= 3 && numAuthors <= 20) {
        return authorList.slice(0, -1).join(", ") + ", & " + authorList[authorList.length - 1];
      } else {
        const first19 = authorList.slice(0, 19);
        const lastAuthor = authorList[authorList.length - 1];
        return first19.join(", ") + ", ... " + lastAuthor;
      }
    };

    const toSentenceCase = (str: string) => {
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    const formatDOI = (doi: string) => {
      if (doi.toLowerCase().startsWith('http')) {
        return doi;
      } else if (doi.toLowerCase().startsWith('doi:')) {
        return `https://doi.org/${doi.slice(4)}`;
      } else {
        return `https://doi.org/${doi}`;
      }
    };

    return (
      <div className="text-left">
        {formatAuthors(item.author)}
        {" "}({item.year}).
        {" "}{toSentenceCase(item.title)}.
        {item.name_journal && (
          <>
            {" "}<em>{item.name_journal}</em>
            {item.volume && (
              <>
                , <em>{item.volume}</em>
                {item.issue && `(${item.issue})`}
              </>
            )}
            {item.page && `, ${item.page}`}
            .
          </>
        )}
        
        {(item.DOI_link || item.article_link) && (
          <>
            {" "}
            <a 
              href={(item.DOI_link ? formatDOI(item.DOI_link) : item.article_link) ?? undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline break-all"
            >
              {item.DOI_link ? formatDOI(item.DOI_link) : item.article_link}
            </a>
          </>
        )}
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-full">
      {data.map((item) => {
        const research = item.research;
        const externalLink = item.article_link || item.DOI_link;

        const title = lang === 'id' ? research?.judul ?? item.title : research?.title ?? item.title;
        const route = getLocalizedRoute('detail_penelitian', {
          title: title.toLowerCase().replace(/\s+/g, '+'),
        });

        return (
          <div key={item.id} className="mb-4 transition">
            <div
              className={`flex ${
                variant === 'no-citation' ? 'flex-row' : 'flex-col md:flex-row'
              }`}
            >
              <div className="md:w-[120px] w-[160px] h-[108px] mr-4 md:mb-0 mb-2 flex bg-gray-200 border border-typo-outline overflow-hidden rounded-lg">
                  <img
                    className="w-full h-full object-cover rounded-lg"
                    src={item.image ? `${import.meta.env.VITE_API_BASE_URL}/storage/${item.image}` : "/no-image.png"}
                    alt={item.title}
                    style={item.image ? {} : { transform: 'scale(1.4)' }}
                  />
                </div>

              <div
                className={`w-full md:w-5/6 flex flex-col ${
                  variant === 'no-citation' ? 'justify-center' : 'justify-between'
                }`}
              >
                <div className=" space-y-1 md:mb-0">
                  <Typography
                    type="paragraph"
                    weight="semibold"
                    className="text-typo line-clamp-2"
                  >
                    {externalLink ? (
                      <a
                        href={externalLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline text-inherit"
                      >
                        {item.title}
                      </a>
                    ) : (
                      item.title
                    )}
                  </Typography>
                  {variant == 'no-citation' && (
                    <Typography type="caption1" font="dm-sans" weight="regular" className="text-typo-secondary mb-1 line-clamp-2">
                      {item.author}
                    </Typography>
                  )}
                  {variant !== 'no-citation' && (
                    <div className="text-typo text-sm leading-relaxed">
                      <Typography
                        type="caption1"
                        font="dm-sans"
                        weight="regular"
                        className="mb-1 break-all"
                      >
                        <span className="font-semibold text-primary">{t('sitasi')}:</span> {formatCitation(item)}
                      </Typography>
                    </div>
                  )}
                </div>
                {variant !== 'no-citation' && item.research && (
                  <div className="flex w-full justify-end">
                    <Button to={route} variant="underline">
                      Penelitian
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PublicationCard;