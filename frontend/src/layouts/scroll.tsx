import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop: React.FC<{ targetId?: string }> = ({ targetId }) => {
  const { pathname } = useLocation();

  useEffect(() => {
    const target = targetId ? document.getElementById(targetId) : window;
    if (target === window) {
      window.scrollTo(0, 0);
    } else if (target) {
      target.scrollTo(0, 0);
    }
  }, [pathname, targetId]);

  return null;
};

export default ScrollToTop;