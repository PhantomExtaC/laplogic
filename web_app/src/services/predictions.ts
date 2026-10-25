import {getPredictionsResource} from '../data/services';
export async function getPredictions(){return (await getPredictionsResource()).data;}
