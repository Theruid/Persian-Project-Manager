import { format } from 'date-fns-tz';
import { convertTextWithNumbers } from '../utils/numbers';

export const usePersianFormat = () => {
  const formatDate = (date: Date | string) => {
    const formatted = format(new Date(date), 'yyyy/MM/dd - HH:mm');
    return convertTextWithNumbers(formatted);
  };

  return { formatDate };
};
