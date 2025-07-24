import { Typography } from '../../atom/typography';


interface CardProps {
  title: string;
  content: { [key: string]: string | React.ReactNode };
}

const Card: React.FC<CardProps> = ({ title, content }) => {
  return (
    <div className="mb-4 rounded-xl overflow-hidden bg-white">
      <div className="bg-primary px-4 py-2">
        <Typography type="body" className="text-white">{title}</Typography>
      </div>
      <div className="bg-typo-white2 px-4 py-2">
        {Object.entries(content).map(([key, value]) => (
          <div key={key} className="mb-2">
            <Typography type="body" weight="semibold">{key}:</Typography>
            <Typography type="body" font="dm-sans" className="text-primary break-words">{value}</Typography>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Card;