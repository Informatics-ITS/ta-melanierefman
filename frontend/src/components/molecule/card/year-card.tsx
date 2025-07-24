import { useNavigate } from 'react-router-dom';
import { ChevronRight } from "lucide-react";

import { Typography } from '../../atom/typography';

import { PublikasiProps } from "../../../entities/publikasi";
import { PenelitianProps } from "../../../entities/penelitian";

import { useLocalizedRoute } from '../../../hooks/useLocalizedRoute';

interface CardYearProps {
  data: PublikasiProps[] | PenelitianProps[];
  showResearch: boolean;
}

const CardYear: React.FC<CardYearProps> = ({ data, showResearch }) => {
  const navigate = useNavigate();
  const getLocalizedRoute = useLocalizedRoute();

  const years = Array.isArray(data)
  ? Array.from(
      new Set(
        data
          .map((item) =>
            showResearch
              ? (item as PenelitianProps).start_date
                ? new Date((item as PenelitianProps).start_date).getFullYear()
                : null
              : (item as PublikasiProps).year ?? null
          )
          .filter((year): year is number => year !== null && !isNaN(year))
      )
    ).sort((a, b) => b - a)
  : [];

  const handleYearClick = (year: number) => {
    const filteredData = showResearch
      ? data.filter((item) => 
          new Date((item as PenelitianProps).start_date).getFullYear() === year
        )
      : data.filter((item) => 
          (item as PublikasiProps).year === year
        );
  
    const route = showResearch
      ? getLocalizedRoute('archive_penelitian', { year: year.toString() })
      : getLocalizedRoute('archive_publikasi', { year: year.toString() });
    
    navigate(route, { state: { research: showResearch ? filteredData : undefined, publications: !showResearch ? filteredData : undefined } });
  };

  return (
    <div>
      {years.map((year) => (
        <div 
          key={year} 
          onClick={() => handleYearClick(year)} 
          className="year-card"
        >
          <div className="bg-typo-white2 text-typo hover:bg-primary hover:text-white flex items-center justify-between p-3 mb-4 rounded-lg">
            <Typography type="body" weight="regular">{year}</Typography>
            <ChevronRight size={16} className="ml-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardYear;