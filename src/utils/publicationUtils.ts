import { Publication, SourceGroup, SpecialEvent } from '../types';

export const groupPublicationsBySource = (publications: Publication[]): SourceGroup[] => {
  const groups: { [key: string]: Set<string> } = {};
  
  const addPublicationToGroup = (pub: Publication) => {
    if (!groups[pub.source]) {
      groups[pub.source] = new Set();
    }
    groups[pub.source].add(pub.seriesTitle);
  };
  
  publications.forEach(addPublicationToGroup);
  
  const convertGroupsToSourceGroups = (entries: [string, Set<string>][]): SourceGroup[] => {
    return entries.map(([source, titles]) => ({
      source,
      titles: Array.from(titles).sort()
    }));
  };
  
  return convertGroupsToSourceGroups(Object.entries(groups));
};

export const getPublicationsForDate = (publications: Publication[], date: string) => {
  const isPublicationOnDate = (pub: Publication): boolean => pub.date === date;
  return publications.filter(isPublicationOnDate);
};

export const getEventsForDate = (events: SpecialEvent[], date: string) => {
  const isEventOnDate = (event: SpecialEvent): boolean => 
    date >= event.startDate && date <= event.endDate;
  return events.filter(isEventOnDate);
};

export const getSourcePublications = (publications: Publication[]): [string, Publication[]][] => {
  const sourceMap = new Map<string, Publication[]>();
  
  const addPublicationToSourceMap = (pub: Publication) => {
    if (!sourceMap.has(pub.source)) {
      sourceMap.set(pub.source, []);
    }
    sourceMap.get(pub.source)?.push(pub);
  };
  
  publications.forEach(addPublicationToSourceMap);
  
  const sortSourceMapEntries = (a: [string, Publication[]], b: [string, Publication[]]): number => 
    a[0].localeCompare(b[0]);
  
  return Array.from(sourceMap.entries()).sort(sortSourceMapEntries);
}; 