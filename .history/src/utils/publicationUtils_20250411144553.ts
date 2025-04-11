import { Publication, SourceGroup, Event } from '../types';

export const groupPublicationsBySource = (publications: Publication[]): SourceGroup[] => {
  const groups: { [key: string]: Set<string> } = {};
  
  const addPublicationToGroup = (pub: Publication) => {
    if (!groups[pub.InstitutionName]) {
      groups[pub.InstitutionName] = new Set();
    }
    groups[pub.InstitutionName].add(pub.PublicationTitle);
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
  const isPublicationOnDate = (pub: Publication): boolean => pub.ReleaseDate === date;
  return publications.filter(isPublicationOnDate);
};

export const getEventsForDate = (events: Event[], date: string) => {
  const isEventOnDate = (event: Event): boolean => 
    date >= event.ReleaseDate && (!event.EventEndDate || date <= event.EventEndDate);
  return events.filter(isEventOnDate);
};

export const getSourcePublications = (publications: Publication[]): [string, Publication[]][] => {
  const sourceMap = new Map<string, Publication[]>();
  
  const addPublicationToSourceMap = (pub: Publication) => {
    if (!sourceMap.has(pub.InstitutionName)) {
      sourceMap.set(pub.InstitutionName, []);
    }
    sourceMap.get(pub.InstitutionName)?.push(pub);
  };
  
  publications.forEach(addPublicationToSourceMap);
  
  const sortSourceMapEntries = (a: [string, Publication[]], b: [string, Publication[]]): number => 
    a[0].localeCompare(b[0]);
  
  return Array.from(sourceMap.entries()).sort(sortSourceMapEntries);
}; 