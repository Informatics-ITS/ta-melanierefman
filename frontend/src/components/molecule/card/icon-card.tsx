import { Typography } from "../../atom/typography";

interface CardProps {
  icon: React.ReactNode;
  count: number;
  label: string;
}

const IconCard: React.FC<CardProps> = ({ icon, count, label }) => (
  <div className="md:flex md:space-y-0 space-y-4 bg-typo-white2 gap-6 md:px-6 md:py-4 p-4 items-center rounded-xl">
    <div className="bg-primary text-white p-2 rounded-full flex justify-center items-center w-12 h-12">
      {icon}
    </div>
    <div>
      <Typography type="heading6" weight="semibold">{count}</Typography>
      <Typography type="body">{label}</Typography>
    </div>
  </div>
);

export default IconCard;