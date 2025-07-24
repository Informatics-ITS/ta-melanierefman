import { format } from "date-fns";
import { id, enUS } from "date-fns/locale";

export const useFormatDate = () => {
  const formatDate = (dateString: string, lang: string) => {
    const validDateString = dateString.replace(" ", "T");
    const created_at = new Date(validDateString);
    const isValidDate = created_at && !isNaN(created_at.getTime());
    return isValidDate
      ? format(created_at, "dd MMMM yyyy", {
          locale: lang === "id" ? id : enUS,
        })
      : lang === "id"
      ? "Tanggal tidak valid"
      : "Invalid date";
  };

  return { formatDate };
};