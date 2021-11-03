import { ProjectFilterFlag } from './models';

type Project = { flights: [{ order?: unknown }, { order?: unknown }] };

type ConformStrategy = (project: Project) => boolean;

const isAll = (): boolean => true;

const onlyCurrent = ({ flights: [current, coming] }: Project): boolean =>
  Boolean(current.order && !coming.order);

const noFlight = ({ flights: [current, coming] }: Project): boolean =>
  Boolean(!current.order && !coming.order);

export const projectConformStrategies: Record<ProjectFilterFlag, ConformStrategy> = {
  [ProjectFilterFlag.ALL]: isAll,
  [ProjectFilterFlag.ONLY_CURRENT]: onlyCurrent,
  [ProjectFilterFlag.IDLE]: noFlight,
};
