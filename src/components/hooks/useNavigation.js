import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { locationData } from '../../data/locationData';
import { LOCATIONS } from '../map/constants';
import { useTransition } from '../../stores/useTransitionStore';

const chapters = LOCATIONS.map((location, index) => {
  const key = location.path.substring(1);
  // Support circular navigation: after last chapter, go to first chapter
  const nextChapter = LOCATIONS[index + 1] || LOCATIONS[0];
  // Support circular navigation: before first chapter, go to last chapter
  const prevChapter = LOCATIONS[index - 1] || LOCATIONS[LOCATIONS.length - 1];

  return {
    ...location,
    key: key,
    ...locationData[key],
    nextChapterPath: nextChapter ? nextChapter.path : null,
    prevChapterPath: prevChapter ? prevChapter.path : null,
  };
});

export const useNavigation = () => {
  const { location } = useParams();
  const navigate = useNavigate();
  const { play } = useTransition();

  const currentChapter = useMemo(() => {
    return chapters.find(chapter => chapter.key === location);
  }, [location]);

  // Navigation handlers that components can call directly.
  const goToNextChapter = () => {
    if (currentChapter?.nextChapterPath) {
      play(() => {
        navigate(currentChapter.nextChapterPath);
      });
    }
  };

  const goToPrevChapter = () => {
    if (currentChapter?.prevChapterPath) {
      play(() => {
        navigate(currentChapter.prevChapterPath);
      });
    }
  };

  return {
    chapters,
    currentChapter,
    goToNextChapter, 
    goToPrevChapter, 
  };
};