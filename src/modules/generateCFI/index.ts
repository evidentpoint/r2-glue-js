import { Dispatcher } from '../../lib';
import { GenerateCFIHandler } from './handler';

export default new Dispatcher('generateCFI', GenerateCFIHandler);
