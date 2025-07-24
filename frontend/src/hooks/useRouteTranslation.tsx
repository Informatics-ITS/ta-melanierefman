import { useFetchData } from './crud/useFetchData';
import { useMemo } from 'react';

interface ResearchData {
  id: number;
  judul: string;
  title: string;
  research_progress: {
    id: number;
    judul_progres: string;
    title_progress: string;
  }[];
}

export const useRouteTranslation = () => {
  const { data: researchData, loading, error } = useFetchData<ResearchData[]>('/api/research');

  const { researchMap, progressMap } = useMemo(() => {
    if (!researchData?.length) {
      return { researchMap: new Map(), progressMap: new Map() };
    }

    const researchMap = new Map<string, ResearchData>();
    const progressMap = new Map<string, { progress: any; research: ResearchData }>();

    researchData.forEach(research => {
      const researchKeys = [
        research.judul,
        research.title,
        research.judul.toLowerCase(),
        research.title.toLowerCase()
      ];
      
      researchKeys.forEach(key => {
        researchMap.set(key, research);
      });

      research.research_progress?.forEach(progress => {
        const progressKeys = [
          progress.judul_progres,
          progress.title_progress,
          progress.judul_progres.toLowerCase(),
          progress.title_progress.toLowerCase()
        ];
        
        progressKeys.forEach(key => {
          progressMap.set(key, { progress, research });
        });
      });
    });

    return { researchMap, progressMap };
  }, [researchData]);

  const staticRoutes: Record<string, string> = useMemo(() => ({
    // ID to EN
    'tentang': 'about',
    'anggota': 'members', 
    'penelitian': 'research',
    'progres': 'progress',
    'foto': 'photos',
    'video': 'videos',
    'publikasi': 'publication',
    'kerjasama': 'partners',
    'kontak': 'contact',
    'materi': 'lecturer',
    // EN to ID
    'about': 'tentang',
    'members': 'anggota',
    'member': 'anggota',
    'research': 'penelitian',
    'progress': 'progres', 
    'photos': 'foto',
    'videos': 'video',
    'publication': 'publikasi',
    'partners': 'kerjasama',
    'contact': 'kontak',
    'lecturer': 'materi',
  }), []);

  const decodeSegment = (segment: string): string[] => {
    const variations = [
      segment,
      segment.replace(/\+/g, ' '),
      decodeURIComponent(segment),
    ];
    
    return [...new Set(variations)];
  };

  const formatForUrl = (text: string): string => {
    return text.toLowerCase().replace(/\s+/g, '+');
  };

  const isAfterRoute = (routeTypes: string[], prevSegment: string | null, prevTranslated: string | null): boolean => {
    return routeTypes.some(route => 
      prevTranslated === route || prevSegment === route
    );
  };

  const translateRoute = (targetLang: string, currentPath: string) => {
    const pathWithoutLang = currentPath.replace(/^\/(id|en)/, '');
    const pathSegments = pathWithoutLang.split('/').filter(Boolean);

    if (!pathSegments.length) {
      return targetLang === 'id' ? '/id' : '/en';
    }

    const translatedSegments: string[] = [];

    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      const prevSegment = i > 0 ? pathSegments[i - 1] : null;
      const prevTranslatedSegment = i > 0 ? translatedSegments[i - 1] : null;

      if (staticRoutes[segment]) {
        translatedSegments.push(staticRoutes[segment]);
        continue;
      }

      if (!researchData?.length) {
        translatedSegments.push(segment);
        continue;
      }

      let matched = false;

      if (isAfterRoute(['research', 'penelitian'], prevSegment, prevTranslatedSegment)) {
        const variations = decodeSegment(segment);
        
        for (const variation of variations) {
          const research = researchMap.get(variation) || researchMap.get(variation.toLowerCase());
          if (research) {
            const translatedTitle = targetLang === 'id' ? research.judul : research.title;
            translatedSegments.push(formatForUrl(translatedTitle));
            matched = true;
            break;
          }
        }
      }
      
      if (!matched && isAfterRoute(['progress', 'progres'], prevSegment, prevTranslatedSegment)) {
        const variations = decodeSegment(segment);
        
        for (const variation of variations) {
          const progressData = progressMap.get(variation) || progressMap.get(variation.toLowerCase());
          if (progressData) {
            const translatedTitle = targetLang === 'id' 
              ? progressData.progress.judul_progres 
              : progressData.progress.title_progress;
            translatedSegments.push(formatForUrl(translatedTitle));
            matched = true;
            break;
          }
        }
      }

      if (!matched) {
        const hasProgressInPath = translatedSegments.some(s => s === 'progress' || s === 'progres') ||
                                 pathSegments.some(s => s === 'progres' || s === 'progress');
        
        if (hasProgressInPath) {
          const variations = decodeSegment(segment);
          
          for (const variation of variations) {
            const progressData = progressMap.get(variation) || progressMap.get(variation.toLowerCase());
            if (progressData) {
              const translatedTitle = targetLang === 'id' 
                ? progressData.progress.judul_progres 
                : progressData.progress.title_progress;
              translatedSegments.push(formatForUrl(translatedTitle));
              matched = true;
              break;
            }
          }
        }
      }

      if (!matched) {
        translatedSegments.push(segment);
      }
    }

    return `/${targetLang}/${translatedSegments.join('/')}`;
  };

  return { translateRoute, loading, error };
};