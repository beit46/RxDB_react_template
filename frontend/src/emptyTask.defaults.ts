import {Task} from "./Task.model";

export const emptyTask : () => Task = () => ({name: '', description: '', uuid: crypto.randomUUID()})